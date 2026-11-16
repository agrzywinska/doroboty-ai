type IncidentCode = "APP-RENDER" | "SCENARIO-SAVE";

const INCIDENT_KEY = "doroboty.incident";

export function recordIncident(code: IncidentCode) {
  try {
    sessionStorage.setItem(INCIDENT_KEY, `${code} · ${new Date().toISOString()}`);
  } catch {
    // The visible recovery message remains available when storage is denied.
  }
}

export function readIncident() {
  try {
    const incident = sessionStorage.getItem(INCIDENT_KEY);
    if (
      /^(APP-RENDER|SCENARIO-SAVE) · \d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(incident ?? "")
    ) {
      return incident;
    }
  } catch {
    return null;
  }
  return null;
}
