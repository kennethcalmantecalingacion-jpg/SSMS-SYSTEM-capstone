# Decision log

Record decisions, assumptions, pending approvals, and reasons for exclusions.
Update this log when a decision changes.

## 2026-11-05 — Start from an empty workspace

- **Decision:** Treat this as a fresh mock-system project, not a migration.
- **Evidence:** The workspace at that time contained only empty `index.html`,
  `style.css`, and `script.js` files. No prior demo, assets, backend, or Git
  repository was found.
- **Implication:** There is no existing application behavior to preserve. Set
  up Git and a backup before application implementation.

## 2026-11-05 — Keep development fictitious and non-operational

- **Decision:** The system is for capstone presentation and iteration only.
  Use synthetic records, and do not present it as approved, deployed, or
  legally compliant.
- **Basis:** User-confirmed project intent.
- **Revisit:** Before any real-data use or operational deployment.

## 2026-11-05 — Verify policy text before deriving requirements

- **Decision:** Do not derive screens, data fields, or business rules from an
  issuance whose full text has not been reviewed.
- **Evidence:** During the initial review, policy-source material was not
  available in a readable form to verify. No jurisdiction-specific policy was
  adopted as a requirement.
- **Next step:** Identify the deployment jurisdiction and review applicable,
  readable official primary sources; keep policy-specific decisions pending
  in the requirements reconciliation.

## 2026-11-05 — Build the dashboard as the first UI increment

- **Decision:** Start with a responsive monitoring dashboard using aggregate
  and clearly fictitious sample values.
- **Behavior:** The sample attendance chart changes by selected period. Warning
  acknowledgment and filtering work in the current browser session.
- **Limitations:** No records are saved; there is no authentication or backend.
  Other navigation modules are not implemented yet.
- **Next step:** Build and test one additional workflow at a time.

## 2026-11-05 — Add an in-session attendance prototype

- **Decision:** Use generated learner IDs in three sample sections and the
  proposed Present, Late, Absent, and Excused statuses.
- **Behavior:** Validate complete marking before save; allow corrections and
  show a session-only change history.
- **Limitations:** Data is held in JavaScript memory and is cleared by refresh.
  Categories, period handling, and staff access require client review before
  they become operational rules.
- **Next step:** Review the attendance workflow and data model before adding
  durable persistence.

## 2026-11-05 — Improve readability and add the student directory

- **Decision:** Increase the interface type scale, particularly navigation,
  form labels, table text, and supporting details.
- **Behavior:** Add searchable, grade/section-filterable directory rows with
  synthetic IDs, provisional learner names, and session-only enrollment in a
  sample section. New learners are also included in the section attendance and
  academic rosters.
- **Limitations:** Names and other learner data are synthetic. Roster edits
  disappear on refresh; real enrollment fields and processes remain subject
  to school review.
- **Next step:** Test the updated screens with the intended presentation users
  and continue one workflow at a time.

## 2026-11-05 — Add an academic assessment score-entry prototype

- **Decision:** Add a simple score-entry screen organized by section and
  subject, with one sample assessment per subject.
- **Behavior:** Create activities with custom possible points, enter scores
  per learner, review score completion and the average as a percentage, search
  by learner ID, validate scores against each activity maximum, and save
  changes for the current page session.
- **Limitations:** Subjects, assessments, and points are synthetic examples.
  The screen does not calculate final grades, apply pass/fail rules, or use
  intervention thresholds. Scores clear on refresh.
- **Next step:** Confirm subjects, assessment plans, grading periods, and
  deployment-approved calculations before extending this workflow.

## 2026-11-05 — Define provisional access boundaries before login

- **Decision:** Document a draft least-access matrix for the roles named in
  the project requirements before adding any login or role-specific behavior.
- **Basis:** Project requirements identify teachers, advisers, parents, and guidance
  counselors as stakeholders in alerts, communication, and follow-up, but
  does not specify permissions. Official source references do not establish
  deployment-specific access assignments.
- **Limitations:** The matrix is a proposal only. The prototype remains
  session-only, has no authentication or authorization, and must not be used
  with real learner data.
- **Next step:** Review the matrix with project and deployment reviewers;
  approve role assignments, guardian linking, sensitive-record
  boundaries, audit procedures, and local sync design before implementation.

## 2026-11-05 — Extend student directory management

- **Decision:** Add session-only learner profile editing, a Boy/Girl directory
  filter from the project notes, and management controls for grade levels and
  sections.
- **Behavior:** Updating a learner's section moves the learner between rosters
  and carries their in-session attendance and activity-score entries to the
  new section. New classes appear in attendance and academics selectors.
  Directory, attendance, and academic roster search can match the learner
  name or ID; attendance can also be filtered by the provisional Boy/Girl
  value without narrowing mark-all or save behavior.
- **Limitations:** Profile information is limited to learner ID, section, and
  a synthetic name and the provisional gender value. No sensitive profiling
  fields are collected. Institution terminology, purpose, access, and workflow
  need confirmation.
- **Next step:** Confirm profile fields, demographic reporting purpose, and
  class-transfer/history rules for a deployment before using real information.

## 2026-11-05 — Add session-only intervention tracking

- **Decision:** Implement the project's alert-to-follow-up requirement as a small
  session-only workflow using synthetic learner records.
- **Behavior:** A dashboard warning opens a new support plan with its learner
  and reason preselected. Staff can record a planned action, an assigned staff
  label, and a next check-in date; later updates add a status and timestamped
  note. The dashboard and intervention list show the open plan status.
- **Limitations:** Statuses and fields are provisional. Plans and notes are
  cleared on refresh; there is no role enforcement, persistence, external
  messaging, or approval of institutional procedures. The interface advises keeping
  notes brief and avoiding sensitive details.
- **Next step:** Confirm the status flow, required follow-up information,
  assignments, visibility, audit/correction rules, and any family communication
  process with authorized deployment reviewers before operational use.

## 2026-11-05 — Add a session-only announcement board

- **Decision:** Turn the dashboard's announcement area into a small workspace
  board for the project communication requirement, without simulating delivery outside
  the app.
- **Behavior:** Staff can post a title and message with an all-staff or
  grade/section audience label. Posts can be marked read in the current
  session, and the navigation and notification control show the in-app unread
  count.
- **Limitations:** Posts are visible only in this browser session; audience
  labels do not enforce role access. No message is sent to families, guardians,
  or external services. Message fields, recipients, and communication
  procedures remain unapproved.
- **Next step:** Confirm communication channels, recipient scope, approved
  content, role boundaries, and delivery requirements with the adviser and
  deployment reviewers before building real notifications or family messaging.

## 2026-11-05 — Add session-based printable reports

- **Decision:** Make the Reports navigation usable by previewing and printing
  summaries from records saved during the current page session.
- **Behavior:** Provide attendance by section/date, activity scores by
  section/subject/activity, intervention status, and an aggregate roster
  summary. Reports are generated on demand and can be sent to the browser's
  print dialog.
- **Limitations:** No report persists or includes unsaved drafts. The summary
  does not calculate official grades, GPA, warning thresholds, or compliance.
  Learner and profile fields remain synthetic and session-only.
- **Next step:** Confirm report fields, audience/access, retention, and any
  required official calculations with authorized deployment reviewers.

## 2026-11-06 — Add a dedicated early-warning review view

- **Decision:** Make the sample warning workflow reviewable in a dedicated
  list rather than only as a dashboard preview.
- **Behavior:** Show four synthetic prompts with category/status filters,
  learner/topic search, session-only acknowledgement, live counts, and a
  shortcut to create a linked intervention plan.
- **Limitations:** Categories and priority labels are illustrative, not
  criteria approved for the deployment. No warning threshold, automated classification,
  persistence, or real learner status is implemented; acknowledgements clear
  on refresh.
- **Next step:** Confirm the evidence, categories, escalation, review meaning,
  authorized reviewers, audit requirements, and any approved thresholds
  before using real learner information.

## 2026-11-08 — Define the attendance-first backend authorization boundary

- **Decision:** Keep the future first shared-data workflow limited to
  authenticated identity, approved role and assignment checks, the assigned
  roster, an attendance session, its entries, and attributable corrections.
  Roles and assignments must both be checked; UI navigation is not an
  authorization boundary.
- **Provisional scope:** An assigned Teacher may record only if the deployment institution approves
  that attendance responsibility. An Adviser may record only within an
  assigned advisory section if the deployment institution separately approves that permission.
  Guidance Counselor, Parent/Guardian, and Designated System Administrator
  receive no general attendance-table access. Any future referral or guardian
  summary needs its own approved scope and data path.
- **Role distinction:** The blueprint's proposed School Administrator is
  separate from Designated System Administrator. School structure and staff
  assignment administration remain ungranted until the deployment institution approves that
  separate role; technical/account administration does not imply learner
  access.
- **Integrity direction:** Attendance entries reference the historical
  enrollment valid for the session's section/date; enforce one entry per
  session/enrollment, validate the relationship atomically, and append
  actor-attributed before/after correction events. Do not define
  section/date as a unique session key until the school decides whether a
  section may have multiple sessions per day.
- **Pending:** Teacher/Adviser recording and correction authority, session
  type and date uniqueness, enrollment date-boundary rules, whether initial
  status creation gets a history event, and who provisions/revokes roles and
  assignments require adviser/the deployment institution confirmation.
- **Validation status:** Design and test scenarios documented only. No SQL,
  database, RLS policy, or backend test has been implemented or executed.
- **Next step:** Review the attendance-first model and allow/deny test plan
  before beginning local Supabase preparation.

## 2026-11-11 — Adopt Vercel and Supabase as the target architecture

- **Decision:** Keep the existing Vanilla JavaScript, HTML, CSS, and Vite
  frontend; use Vercel for frontend hosting/deployment and Supabase for backend
  services and Supabase-managed PostgreSQL. GitHub remains the source
  repository and deployment trigger. The application target is an installable
  PWA, with IndexedDB, service-worker caching, and controlled synchronization
  as future capabilities.
- **Provider responsibilities:** Vercel builds and serves the frontend.
  Supabase provides Auth, managed PostgreSQL, RLS/grants, Edge Functions,
  Storage, and optional Realtime. PostgreSQL is included in the Supabase
  backend architecture, not a separately hosted database to acquire.
  Google Drive remains an optional secondary backup/export destination, not
  the transactional source of truth.
- **Security boundary:** `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY` are the only Supabase values intended for
  browser configuration. Publishable keys do not authorize data access.
  Secret/service-role, JWT, and database credentials must remain server-side.
- **Evidence checked:** Official provider documentation reviewed on
  2026-11-11: [Supabase/Vercel integration](https://supabase.com/docs/guides/integrations/vercel),
  [Preview branches](https://supabase.com/docs/guides/integrations/vercel-preview-branches),
  [Vercel Marketplace](https://supabase.com/docs/guides/integrations/vercel-marketplace),
  [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), and
  [Vercel Git integration](https://vercel.com/docs/git).
- **Status:** Architecture selected; no provider accounts, project integration,
  Vercel deployment, or PWA installation were configured or tested by this
  decision. Production/Preview environments must be configured separately;
  Preview must not use production student data. Provider availability,
  configuration, application connection/testing, and deployment verification
  are separate states.
