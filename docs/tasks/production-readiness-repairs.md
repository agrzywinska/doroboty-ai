# Production readiness repairs

Protect the synthetic course scenario from stale tabs, keep release bytes stable across Git checkouts, and make startup and storage failures reportable without sharing scenario contents.

- A stale tab must preserve the latest persisted snapshot and explain how to recover. Two Chrome tabs must exercise the original profile/bookmark conflict.
- The reference manifest and baseline CSV must pass byte checks, and a fresh participant package must exclude instructor materials and Git history.
- Assess the startup fallback and storage incident code using safe browser failures. Use Poster People C17 recovery anatomy and existing host status and button styles for the settings guidance. Check small-screen layout and keyboard access.
- Repeat the full synthetic recruitment journey, record the actual release gate results, and refresh the offline audit for the resulting sources.

## Local verification and review

All 42 browser journeys passed against a fresh static build in system Chrome 157, including the two-tab conflict and the complete recruitment flow. The startup fallback was exercised with a blocked bundle and a forced uncaught React error. A denied local write exposed only the fixed diagnostic code and timestamp. The evaluated route used the existing host panel and form styling at desktop and mobile widths.

Prettier, ESLint, TypeScript, Vitest (27 tests), the 67-file kit hash check and all six kit example tests passed. A temporary Git checkout with core.autocrlf enabled verified the baseline CSV, kit entry and PDF byte preservation. The participant package passed the pristine manifest and kit checks. The usual verify entry point produced no runnable gate in this PowerShell session without npm and Bash, and the prescribed Playwright Chromium was absent. The gate's checks were executed directly with Node and system Chrome.

The source review traced all domain writes through the same lock and snapshot check and confirmed that diagnostics contain fixed codes and time only. The report records separate evidence for the checkout, local preview and any future hosted rehearsal. The hosting plan, access, rollback and delivery of a test incident remain open.
