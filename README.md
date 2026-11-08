# Smart Student Monitoring and Early Warning System for LNHS

This is a mock system for presenting an academic capstone concept. It is not an
approved or deployed school system.

## Current status

- A responsive dashboard is implemented in `index.html`, `style.css`, and
  `script.js`.
- The dashboard uses fictional sample figures; period selection, warning
  acknowledgment, filtering, and mobile navigation work in the browser.
- Presentation screens omit demo labels, but the figures and learner IDs remain
  fictional. This is still a prototype, not an official or deployed school
  system.
- Dashboard and attendance typography has been increased for readability on
  laptop and mobile layouts.
- The interface uses a blue and light-blue palette, shorter action-oriented
  copy, and no demo labels in presentation screens.
- The attendance screen supports section/date selection, recording status for
  fictional learner IDs, validation, totals, and a browser-local change
  history for successfully saved attendance.
- The student directory supports section/grade and Boy/Girl filters,
  name/ID search, learner name and profile editing, and adding learners.
- Grade levels and sections can be added in the current session; profile
  changes also update attendance and academic rosters.
- Attendance supports section/date selection, gender filtering, and
  name/ID search. The filter only changes visible rows: summary totals,
  mark-all, and save validation still cover every learner in the section.
- Academic records support section/subject selection, custom activity names
  and possible points, per-learner scores, percentage class averages, search,
  validation, and browser-local saving of custom activities and submitted
  scores. Unfinished score drafts are cleared on refresh. Search matches
  learner names and IDs; official grade and GPA rules remain unconfigured.
- The Early Warnings view lists four synthetic review prompts and supports
  category/status filtering, learner/topic search, session-only review
  acknowledgment, and opening a linked support plan. Counts reflect the
  current review state. Priority labels are illustrative only; no thresholds
  or automatic learner classifications are implemented.
- Staff can record a planned action, an assigned staff label, and a next
  check-in date, then add progress updates and outcomes through completion.
  Plans and their update history remain in memory for the current page session.
- The announcements board supports session-only staff-workspace posts,
  section labels, unread/read-in-session state, and an in-app unread count.
  These posts are not delivered to families or external services; audience
  labels do not enforce access.
- Reports can preview and print saved attendance for a section/date, saved
  activity scores, intervention status, or a synthetic roster summary.
  Attendance and academic reports can use records saved in this browser;
  intervention and roster reports use current-session data. Reports do not
  apply official grades or early-warning rules.
- Successfully saved attendance records and their history persist in this
  browser using localStorage; unfinished attendance drafts are cleared on
  refresh. Custom academic activities and successfully saved scores also
  persist in this browser; unfinished score drafts are cleared on refresh.
  Student profiles, class structure, and directory changes exist only in the
  current session.
  No real student records are stored.
- Settings remain a future module. There is no backend, authentication, role
  enforcement, external messaging, or central database; only saved attendance
  and academic data are persisted locally in this browser.
- A provisional role-permission proposal for teachers, advisers, guidance
  counselors, parents, and system administration is documented in
  `docs/ACCESS-CONTROL-MATRIX.md`. It is not school-approved and is not
  enforced by the prototype.
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

Open `index.html` in a browser to preview the current frontend. No build step or
backend is configured yet.

## Project records

- [Requirements reconciliation](docs/REQUIREMENTS-RECONCILIATION.md)
- [Decision log](docs/DECISIONS.md)

Set up Git and make a backup before beginning application implementation.
