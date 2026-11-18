import { expect, test } from "@playwright/test";

test("published host sends anonymous clicks without private text or URLs", async ({ page }) => {
  const events: { event: string; distinct_id: string; properties: Record<string, unknown> }[] = [];
  await page.route("https://eu.i.posthog.com/**", async (route) => {
    events.push(route.request().postDataJSON());
    await route.fulfill({ json: { status: 1 } });
  });
  // Exercise the actual production build without publishing or sending test data to PostHog.
  await page.route("https://doroboty-ai-e01.vercel.app/**", async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: `http://127.0.0.1:3106${url.pathname}` });
    await route.fulfill({ response });
  });
  await page.goto("https://doroboty-ai-e01.vercel.app/#/oferty?query=PRIVATE-SEARCH");
  await expect.poll(() => events.filter((event) => event.event === "page_view").length).toBe(1);
  const home = page.getByRole("link", { name: "DoRoboty.ai — strona główna" });
  await home.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => events.filter((event) => event.event === "ui_click").length).toBe(1);
  await expect.poll(() => events.filter((event) => event.event === "page_view").length).toBe(2);
  expect(events.find((event) => event.event === "ui_click")?.properties).toEqual({
    $process_person_profile: false,
    route: "/oferty",
    element_type: "link",
    destination: "/",
  });
  expect(JSON.stringify(events)).not.toContain("PRIVATE-SEARCH");
  expect(new Set(events.map((event) => event.distinct_id)).size).toBe(1);
  const visit = events[0].distinct_id;
  await page.reload();
  await expect.poll(() => events.at(-1)?.distinct_id).not.toBe(visit);
  expect((await page.context().cookies()).filter((cookie) => cookie.name.includes("ph_"))).toEqual(
    [],
  );

  await page.evaluate(() => {
    window.location.hash = "/app/kandydaci/PRIVATE-RECORD?note=PRIVATE-NOTE";
  });
  await expect
    .poll(() => events.some((event) => event.properties.route === "/app/kandydaci/:id"))
    .toBe(true);
  expect(JSON.stringify(events)).not.toMatch(/PRIVATE-RECORD|PRIVATE-NOTE/);
});

test("local preview does not contact PostHog", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("posthog.com")) requests.push(request.url());
  });
  await page.goto("/#/oferty");
  await page.getByRole("link", { name: "DoRoboty.ai — strona główna" }).click();
  await expect(page).toHaveURL(/#\/$/);
  expect(requests).toEqual([]);
});
