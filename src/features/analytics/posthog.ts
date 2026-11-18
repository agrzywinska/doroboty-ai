// This public ingestion token is scoped to the user's published teaching prototype.
const projectToken = "phc_qYuQ6r3WYXR2z8jjCDkjxATpVY9fDPmq9R3qqfAxFysH";
const publishedOrigin = "https://doroboty-ai-e01.vercel.app";
const captureEndpoint = "https://eu.i.posthog.com/i/v0/e/";

const routes = [
  "/",
  "/oferty",
  "/oferty/:slug",
  "/firmy/:slug",
  "/metodologia",
  "/polityka-prywatnosci",
  "/auth/:mode",
  "/aplikuj/:slug",
  "/app",
  "/app/onboarding",
  "/app/profil",
  "/app/profil/podglad",
  "/app/zapisane",
  "/app/aplikacje",
  "/app/aplikacje/:id",
  "/app/aplikacje/:id/wyslano",
  "/app/oferty",
  "/app/oferty/:id",
  "/app/organizacja",
  "/app/kandydaci",
  "/app/kandydaci/:id",
  "/app/case",
  "/app/settings",
];

function routeTemplate(hash: string) {
  const path = hash.replace(/^#/, "").split(/[?#]/)[0] || "/";
  return (
    routes.find((route) => new RegExp(`^${route.replace(/:[a-z]+/g, "[^/]+")}/?$`).test(path)) ??
    "/other"
  );
}

export function startAnalytics() {
  if (!import.meta.env.PROD || window.location.origin !== publishedOrigin) return;

  // New on every page load; deliberately never persisted or linked to a persona.
  const visitId = crypto.randomUUID();
  function capture(event: "page_view" | "ui_click", properties: Record<string, string>) {
    void fetch(captureEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      referrerPolicy: "no-referrer",
      keepalive: true,
      body: JSON.stringify({
        api_key: projectToken,
        distinct_id: visitId,
        event,
        properties: { $process_person_profile: false, ...properties },
      }),
    }).catch(() => {
      // Offline browsers and blocked analytics must not affect the prototype.
    });
  }

  const pageView = () => capture("page_view", { route: routeTemplate(window.location.hash) });
  pageView();
  window.addEventListener("hashchange", pageView);
  document.addEventListener(
    "click",
    (event) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest('a, button, [role="button"]');
      if (!control || control.matches(':disabled, [aria-disabled="true"]')) return;
      const properties: Record<string, string> = {
        route: routeTemplate(window.location.hash),
        element_type: control.tagName === "A" ? "link" : "button",
      };
      const href = control.getAttribute("href");
      if (href?.startsWith("#/")) properties.destination = routeTemplate(href);
      capture("ui_click", properties);
    },
    true,
  );
}
