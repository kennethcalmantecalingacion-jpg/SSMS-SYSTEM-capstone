# Smart Student Monitoring and Early Warning System for LNHS

This is a mock system for presenting an academic capstone concept. It is not an
approved or deployed school system.

## Current status

- A responsive dashboard is implemented in `index.html` and the Vite source
  under `src/`.
- Dashboard summaries use the current synthetic browser-local roster, saved
  attendance statuses, and support plans. Period selection filters saved
  attendance counts; no official attendance rate is calculated. Warning
  prompts remain illustrative samples, not learner risk findings.
- Dashboard figures and learner IDs are fictional demo data, not official
  school-wide statistics. This is still a prototype, not an official or
  deployed school system.
- Dashboard and attendance typography has been increased for readability on
  laptop and mobile layouts.
- The interface uses a blue and light-blue palette, shorter action-oriented
  copy, and no demo labels in presentation screens.
- The attendance screen supports section/date selection, recording status for
  fictional learner IDs, validation, totals, and a browser-local change
  history for successfully saved attendance.
- The student directory supports section/grade and Boy/Girl filters,
  name/ID search, learner name and profile editing, and adding learners.
- Learner names, profiles, section membership, grade levels, and section
  labels persist in this browser using the versioned roster localStorage key.
  Valid saved rosters restore before attendance, academic, and support data;
  invalid roster data is skipped as a whole without being overwritten during
  startup.
- Moving a learner changes current section membership without moving or
  deleting saved attendance and academic records. Unsaved attendance and
  academic entries for that learner are discarded rather than transferred.
- Attendance supports section/date selection, gender filtering, and
  name/ID search. The filter only changes visible rows: summary totals,
  mark-all, and save validation still cover every learner in the section.
- Academic records support section/subject selection, custom activity names
  and possible points, per-learner scores, percentage class averages, search,
  validation, and browser-local saving of custom activities and submitted
  scores. Unfinished score drafts are cleared on refresh. Search matches
  learner names and IDs; official grade and GPA rules remain unconfigured.
- The Early Warnings view lists four synthetic review prompts and supports
  category/status filtering, learner/topic search, browser-local review
  acknowledgment, and opening a linked support plan. Counts reflect the
  current review state. Priority labels are illustrative only; no thresholds
  or automatic learner classifications are implemented.
- Staff can record a planned action, an assigned staff label, and a next
  check-in date, then add progress updates and outcomes through completion.
  Support plans and their update history persist in this browser using
  localStorage. Plans created from warnings retain the warning's record ID.
- The announcements board supports session-only staff-workspace posts,
  section labels, unread/read-in-session state, and an in-app unread count.
  These posts are not delivered to families or external services; audience
  labels do not enforce access.
- Reports can preview and print saved attendance for a section/date, saved
  activity scores, support-plan status, or a synthetic roster summary.
  Attendance, academic, and support-plan reports can use records saved in
  this browser; roster reports use the current directory and class structure.
  Reports do not apply official grades or early-warning rules.
- Successfully saved attendance records and their history persist in this
  browser using localStorage; unfinished attendance drafts are cleared on
  refresh. Custom academic activities and successfully saved scores also
  persist in this browser; unfinished score drafts are cleared on refresh.
  Warning acknowledgements, support plans, and plan update history also
  persist in this browser. Roster, attendance, academic, and support records
  are local browser records, not shared or server-side data, and are not
  protected by real authentication or backend authorization.
  No real student records are stored. Browser-local demo storage is not
  suitable for real student information.
- Demo account selection and client-side navigation presets are available.
  Settings shows a data-free System Administration status page; account
  administration and school configuration are not operational.
- The demo navigation presets are provisional and not school-approved. There
  is no real authentication, assignment-level enforcement, backend
  authorization, RLS, external messaging, or central database. Client-side
  navigation restrictions do not protect records from direct browser/API
  access. Attendance, academic, and support data are persisted only in this
  browser.
- A provisional role-permission proposal for teachers, advisers, guidance
  counselors, parents, and system administration is documented in
  `docs/ACCESS-CONTROL-MATRIX.md`. It is not school-approved or enforced as
  data authorization; only demo-level client-side navigation restrictions
  exist.
- Use fictitious data only. Do not enter real learner information or credentials.
- School-specific fields, roles, thresholds, and procedures remain provisional
  until reviewed with the adviser and school client.
- No legal or policy compliance is claimed.

## Project title

Smart Student Monitoring and Early Warning System for Labnig National High
School (LNHS).

## Development approach

Build and verify one small increment at a time. Review official sources before
translating policy into requirements. Review the data model and access design
before adding database migrations or connecting a real backend.

Run `npm run dev` to preview the frontend, `npm run build` to create a
production bundle, or `npm run preview` to serve that bundle. No backend is
configured.

## Project records

- [Requirements reconciliation](docs/REQUIREMENTS-RECONCILIATION.md)
- [Decision log](docs/DECISIONS.md)

Set up Git and make a backup before beginning application implementation.
