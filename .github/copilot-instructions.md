# Project guidance

- Treat this repository as a fictitious-data capstone mock, not a production
  school system. Never request or add real learner records or credentials.
- Keep the approved project title and problem areas unchanged.
- Work in small, reviewable increments. Inspect the relevant files, state the
  goal and scope, and run the narrowest relevant validation.
- Check official primary sources before recording policy requirements. Record
  source links, verification status, and unresolved questions in
  `docs/REQUIREMENTS-RECONCILIATION.md`.
- Do not invent school procedures, student fields, roles, grading rules, or
  warning thresholds. Keep unconfirmed items provisional and log decisions in
  `docs/DECISIONS.md`.
- Do not claim legal compliance, live authentication, external messaging, or
  backend security unless the relevant implementation and tests support that
  claim.
- Keep secrets out of frontend files and version control. If Supabase is added,
  protect exposed data with reviewed grants and row-level security policies;
  never place a service-role key in the browser.
- Use only synthetic learner data in code, fixtures, screenshots, and tests.
