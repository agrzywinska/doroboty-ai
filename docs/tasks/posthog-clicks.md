# PostHog click visibility

## Intent and acceptance criteria

Connect the published E01 teaching prototype to the user's EU PostHog project so they can see a real browser click. Use the public project token supplied in chat. Enable collection only on https://doroboty-ai-e01.vercel.app in production builds; local previews and participant deployments remain offline.

- Send anonymous `page_view` and `ui_click` events to the EU capture endpoint.
- Send only fixed route templates and control types; never collect DOM text, input values, query strings, record identifiers, CVs or scenario contents.
- Use an in-memory random visit ID, no analytics cookies or browser storage, and no recording or person profiles.
- Analytics failures must not interrupt navigation or local editing.
- Update the privacy copy and FEATURES.md, run the repository verification gate and perform a separate review. Do not claim deployment or PostHog receipt from mocked tests.

## Validation

- Node.js 24.22.1 and npm 12.2.3 (via the available Corepack shim). Existing worktree changes were preserved; no commit, merge or deployment was performed.
- `./scripts/verify` was attempted through the bundled Git shell; its shell utilities were absent from PATH. Ran its equivalent `npm run check` gate instead. The first sandboxed run passed formatting, kit checks, lint and types, then esbuild could not read the Vitest configuration because of sandbox restrictions.
- The gate rerun outside that restriction passed formatting, all 67 immutable kit hashes and six example tests, lint, types, 27 existing unit tests, the 120-journey packet check and the production build. Existing Zod annotation and bundle-size warnings remain.
- All 44 browser journeys failed before executing assertions because the provisioned Playwright Chromium headless executable is missing. No browser or OS dependencies were installed. Browser delivery, mobile/desktop layout and keyboard interaction remain unverified in this environment.
- Added three unit contract tests for production-origin gating, anonymous payloads, route/query/record redaction, click metadata, disabled controls and blocked requests. The resulting 30 unit tests and TypeScript check passed. The browser tests remain source coverage only and send no real PostHog traffic.
- Separate review checked the final source, startup integration, failure handling, privacy copy and FEATURES.md. Collection reads no DOM text/input values/scenario state, stores no analytics identity and only runs on the exact production origin. Privacy copy reuses the existing paragraph composition without style/layout changes. `git diff --check` passed.
- No real event was sent by these tests and PostHog ingestion has not been verified. Publish the new build before guiding the user through a real click and the PostHog event list.

## Authorized production release

The user explicitly requested publication of the PostHog change. They confirmed `main` as the Vercel production branch. Vercel inspection confirmed project `doroboty-ai-e01`, account `team_6aBs2eW97LfrBgI5RmckEX25`, production alias `doroboty-ai-e01.vercel.app` and current public commit `9f66c6590125412731c735734503a4903e5015a3` from `codex/vercel-test-e01`.

Remote `main` is still `81682a8`, an ancestor of that already-published E01 build. Fast-forward it with the existing two E01/build commits plus the isolated PostHog commit, preserving the current public UI. Stage only the analytics module/tests, startup hook, privacy copy, feature register and this task record. Leave unrelated local changes and line-ending status noise untouched. No forced push or history replacement.

The separate release review confirmed that the staged product delta relative to the current public commit contains only the PostHog integration and its privacy disclosure. Existing browser verification remains blocked by missing provisioned Chromium; publication is authorized with that disclosed limitation. Monitor the deployment for the exact new commit and inspect the served asset before claiming publication.
