import { afterEach, expect, test, vi } from "vitest";
import { startAnalytics } from "./posthog";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function setup(origin = "https://doroboty-ai-e01.vercel.app") {
  vi.stubEnv("PROD", true);
  const location = { origin, hash: "#/oferty?query=PRIVATE-SEARCH" };
  const documentListener = vi.fn();
  const windowListener = vi.fn();
  const fetch = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("window", { location, addEventListener: windowListener });
  vi.stubGlobal("document", { addEventListener: documentListener });
  vi.stubGlobal("fetch", fetch);
  return { location, documentListener, windowListener, fetch };
}

test("only the published production origin enables analytics", () => {
  const local = setup("http://127.0.0.1:3001");
  startAnalytics();
  expect(local.fetch).not.toHaveBeenCalled();
  expect(local.documentListener).not.toHaveBeenCalled();
  const development = setup();
  vi.stubEnv("PROD", false);
  startAnalytics();
  expect(development.fetch).not.toHaveBeenCalled();
});

test("capture strips queries and dynamic IDs and never persists a persona identity", () => {
  const { location, fetch, windowListener } = setup();
  startAnalytics();
  const initial = JSON.parse(fetch.mock.calls[0][1].body);
  expect(initial.properties).toEqual({ $process_person_profile: false, route: "/oferty" });
  expect(initial.event).toBe("page_view");
  expect(initial.distinct_id).toMatch(/^[a-f0-9-]{36}$/);
  expect(fetch.mock.calls[0][0]).toBe("https://eu.i.posthog.com/i/v0/e/");
  expect(fetch.mock.calls[0][1]).toMatchObject({
    credentials: "omit",
    referrerPolicy: "no-referrer",
    keepalive: true,
  });
  const onHashChange = windowListener.mock.calls[0][1];
  for (const [hash, expected] of [
    ["#/app/kandydaci/PRIVATE-RECORD?note=PRIVATE-NOTE", "/app/kandydaci/:id"],
    ["#/PRIVATE-ROUTE", "/other"],
    ["#/app/aplikacje/PRIVATE-RECORD/wyslano", "/app/aplikacje/:id/wyslano"],
  ]) {
    location.hash = hash;
    onHashChange();
    const event = JSON.parse(fetch.mock.calls.at(-1)![1].body);
    expect(event.properties.route).toBe(expected);
    expect(event.distinct_id).toBe(initial.distinct_id);
    expect(JSON.stringify(event)).not.toContain("PRIVATE");
  }
});

test("click capture sends only control metadata and tolerates blocked requests", async () => {
  const { fetch, documentListener } = setup();
  class Control {
    tagName = "A";
    disabled = false;
    textContent = "PRIVATE-TEXT";
    closest() {
      return this;
    }
    matches() {
      return this.disabled;
    }
    getAttribute() {
      return "#/firmy/PRIVATE-COMPANY?note=PRIVATE-NOTE";
    }
  }
  vi.stubGlobal("Element", Control);
  startAnalytics();
  const click = documentListener.mock.calls[0][1];
  const control = new Control();
  fetch.mockRejectedValue(new Error("Blocked analytics"));
  click({ target: control });
  expect(JSON.parse(fetch.mock.calls[1][1].body).properties).toEqual({
    $process_person_profile: false,
    route: "/oferty",
    element_type: "link",
    destination: "/firmy/:slug",
  });
  expect(fetch.mock.calls[1][1].body).not.toContain("PRIVATE");
  control.disabled = true;
  click({ target: control });
  expect(fetch).toHaveBeenCalledTimes(2);
  await Promise.resolve();
});
