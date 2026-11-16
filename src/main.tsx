import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/prototype/app";
import { recordIncident } from "./features/prototype/diagnostics";
import "./app/globals.css";

createRoot(document.getElementById("root")!, {
  onUncaughtError() {
    recordIncident("APP-RENDER");
    document.getElementById("startup-incident")!.textContent = "Kod zgłoszenia: APP-RENDER";
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
