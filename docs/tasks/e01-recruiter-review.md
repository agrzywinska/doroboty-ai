# E01 recruiter review

Slug: `e01-recruiter-review`
Created: 2026-11-15

## Goal

Test the same synthetic Apply application with and without the contribution card, starting from the existing Candidates list in BrightLabs.

## Acceptance criteria

- Both variants use the same role description, application, RecordSheet and controls. The card shows contribution, AI use and verification, in that order.
- Three equally styled native radio options support keyboard selection. The shared C01 primary button saves a decision with one available source quote. The visible C19-style result spells out the next step.
- Reuse the existing C13 return link, C22 reading structure, record layout, and host paper/white/ink/pink tokens. Keep content readable at 320 CSS px and focus visible.
- The synthetic record is employer-scoped. Existing applications preserve their stage actions. The two prototype results persist independently using the existing local scenario store. Older version-1 saves remain readable.
- Run the project verification gate and check both variants in Chromium.

## Handoff and verification

Select Karolina Wiśniewska (BrightLabs), then open Michał Nowak from `/#/app/kandydaci` or `/#/app/kandydaci?e01=karta`. The list passes the variant through to the record. A fresh browser profile starts with an empty review for each variant. The reviewed record is a synthetic presentation fixture. It remains outside the scenario's submitted application collection, and the store saves only the selected action and fragment ID per variant.

Chrome verified the three decisions at 1280, 390 and 320 CSS px, including keyboard choice, visible focus, wrapping, an accessibility scan, persistence and variant isolation. Reviewed the captured record and result against the existing shared layout. The application-to-employer journey, company boundaries and the existing record's note/stage history passed after the final change. TypeScript, ESLint, formatting for changed files, build, 27 unit tests and six reference renderer tests passed. The broader check has Windows checkout issues: the kit checksum and participant CSV checks detect CRLF working copies for LF files, and two existing PDF tests count the installed Chrome viewer's internal extension URLs as external requests.

## Follow-up prototype checks

Fresh Chrome sessions selected Karolina through the employer persona picker, opened Candidates through desktop or mobile navigation, searched by role and opened Michał. The standard and card variants each passed Invite at 1280 px, Ask at 320 px and Close at 390 px. Keyboard checks covered radio selection, the missing-quote error, quote selection and submission. The saved choice and quote matched after refresh. Returning to Candidates preserved the variant, which had a separate saved result.

Reviewed desktop and mobile captures of the outlined card, reading order, selected radio and focused controls. Checked page width before the decision, with the quote picker open and after saving. Five existing journeys passed on the production build: publishing through employer decision, company visibility, employer record notes/stages, long content and custom CV snapshots, and candidate withdrawal. No defect in the scoped product behavior was found. These are prototype behavior checks; the E01 hypothesis about the quality of recruiters' reasoning remains for participant sessions.
