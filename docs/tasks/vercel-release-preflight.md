# Vercel release preflight

Prepare the E01 test branch for a reproducible static build on Vercel.

- The package and its lockfile select Node.js 24. The deployment config installs locked packages, runs the repository build, and serves only `dist`.
- Rebuild an isolated copy from the release sources, verify the course packet and repeat the complete synthetic recruitment journey.
- Record hosted checks separately in the readiness report. Release ownership, target configuration, rollback and delivery of a test incident require evidence from Vercel.

## Verification and review

The prior engine range accepted Node.js 26. The package and its lockfile now accept Node.js 24 and reject 26. Vercel's framework, install, build and output properties match the locally executed release steps.

Node.js 24.22.1 with temporary npm 12.2.2 installed 415 locked packages in an archive of the Git source with the release configuration applied. Formatting, lint, type checks, 27 unit tests, all 67 kit hashes, six kit tests, baseline verification, participant packaging, and the standard npm production build passed. All 42 browser tests passed against that build using system Chrome 157 and a temporary Playwright configuration because the provisioned Playwright Chromium was absent. The full recruitment journey survived reload. Separate browser evidence covered export and restore in an isolated context and a forced rendering error.

Reviewed the configuration against the Vercel reference and the public build against the participant boundary. The output contains the baseline CSV. The kit, sources, instructor material and Git history are outside the published output. The npm audit reported zero runtime findings and 12 low or moderate development-tree entries. The product behavior register was reviewed and required no change for this configuration-only task.

GitHub email verification and the account link in Vercel were confirmed by the user. A hosted build, actual project access, usage and rollback remain unverified.
