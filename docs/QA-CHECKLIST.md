# QA Checklist

Manual checks for the current prototype and future deployment. This is a
reusable checklist, not an automated test suite. Use synthetic data only;
never enter real learner information or credentials. Record each test run
with the template at the end.

## 1. Pre-test checks

- [ ] Open the production-facing login. Confirm it reports Supabase as
  unconfigured when public project variables are absent; demo credentials
  must not authenticate through production sign-in.
- [ ] Choose **Enter Demo Mode**, confirm the separate browser-local Demo
  Portal, then sign in using a fictional demo account.
- [ ] Confirm the account's permitted landing screen appears.
- [ ] Open the browser console and check for errors during load and testing.
- [ ] Use fictional names, IDs, notes, and messages exclusively.

## 1a. Production authentication (requires configured Supabase project)

The local no-configuration state can be checked without an external project.
The following checks require configured Supabase Auth, allowed redirect URLs,
and synthetic test accounts; they have not been verified by this checklist:

- [ ] Configure only `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY` for the frontend. Never expose a secret or
  service-role key through a `VITE_` variable.
- [ ] Verify password sign-in, persistent session restoration, sign-out,
  expired-session behavior, password recovery, and recovery redirect handling.
- [ ] Verify production registration remains disabled until trusted
  server-side registration-invitation validation is implemented.
- [ ] Confirm an authenticated user without workspace membership cannot enter
  the demo shell or see browser-local demo learner records.

## 1b. Vercel and Supabase deployment (requires provider projects)

Provider instructions do not prove that providers are configured or the app
is deployed. When authorized projects are available:

- [ ] Confirm the Vercel project is linked to the existing GitHub repository
  and builds the existing Vite app to `dist`.
- [ ] Confirm the Supabase integration is linked to the intended Supabase
  project and maps the public URL/publishable key to the Vite variable names.
- [ ] Inspect synced variables; no database password, secret/service-role key,
  or JWT secret may be exposed to browser code or build output.
- [ ] Confirm Preview uses an isolated Supabase preview branch/project and
  Production uses the intended production configuration.
- [ ] Verify Auth redirect allowlists for local, Preview, and Production
  origins. Do not mark deployment complete until the deployed app is tested.

## 2. Core module smoke tests

For each workflow, record the actual result; do not assume a check passed
because the screen appears correct.

- [ ] **Overview and navigation:** Open each navigation item and use an
  Overview shortcut. Confirm the selected screen and summary values display.
- [ ] **Student directory and profile:** Search a fictional learner, edit the
  profile, and change section. Confirm the edited directory entry and relevant
  rosters reflect the change. Try a blank required name and duplicate ID.
- [ ] **Attendance:** Select a section and date, mark the session, and save.
  Try an incomplete session; confirm it is rejected. Compare saved history and
  report with the session entered.
- [ ] **Academic activities and scores:** Add an activity with possible
  points. Try an empty name, invalid points, and a score above the maximum;
  enter valid boundary scores and save. Confirm the selected activity and
  report match.
- [ ] **Early-warning acknowledgment:** Filter and search the warning list,
  acknowledge a synthetic warning, and confirm the status/count updates.
- [ ] **Warning-to-intervention link:** Start a support plan from a warning.
  Confirm its learner and warning/reason are the intended ones.
- [ ] **Interventions:** Create a plan with required fields, add an update,
  and confirm its history, status summary, and report reflect the change.
- [ ] **Announcements:** Post one staff-wide and one section announcement.
  Check audience-dependent validation, read/unread state, filters, and unread
  count.
- [ ] **Reports and print preview:** Generate attendance, academic,
  intervention, and roster summaries where applicable. Check empty states and
  open print preview; confirm the application layout remains usable.

## 2a. Future backend attendance authorization checks (not implemented)

These are design acceptance cases for a future authenticated backend, not
checks that can pass against the current browser-only prototype. Run them
against the backend after the school approves the relevant roles and
assignments. Use synthetic accounts, sections, and attendance data.

- [ ] **Assigned Teacher:** Allow session creation and entry changes only for
  an approved assigned offering/section; deny unassigned sections and
  out-of-scope dates.
- [ ] **Adviser:** Deny recording and correction unless the deployment institution explicitly
  approves the Adviser permission; if approved, allow only the assigned
  advisory section.
- [ ] **Guidance Counselor:** Deny general attendance session and entry
  access. Test any separately approved summary only through its specifically
  scoped path.
- [ ] **Parent/Guardian:** Deny general attendance table access. Test any
  future approved child summary only through its separately scoped path.
- [ ] **Designated System Administrator:** Deny general attendance session
  and entry access; technical/account administration does not imply learner
  data access.
- [ ] **Workspace Owner/Administrator:** Verify any structure-management
  capability is workspace-scoped and does not grant cross-workspace or
  confidential guidance access.
- [ ] **Platform Operator:** Deny routine attendance and learner-record
  access unless a separately approved, audited support workflow specifically
  requires it.
- [ ] **Historical enrollment:** Reject an entry if the enrollment did not
  belong to the session section or was not effective on the session date.
- [ ] **Entry uniqueness and atomicity:** Reject a second entry for the same
  session/enrollment and ensure an invalid or partial session cannot be
  persisted.
- [ ] **Session uniqueness:** Test only the rule the deployment institution approves; do not assume
  a section can have only one session per date.
- [ ] **Correction history:** For an authorized correction, verify actor,
  previous/new status, and timestamp are retained; determine whether initial
  entry creation also requires a history event.

## 3. Dialog and form checks

- [ ] Open each dialog using its normal screen action. Close with the close
  button and Cancel where available.
- [ ] Try submitting required fields empty and with whitespace-only text.
  Confirm invalid submissions are blocked and no partial record appears.
- [ ] Correct an invalid field and submit again. Confirm the old validation
  message clears and the corrected record can be submitted.
- [ ] Enter a harmless HTML-like string, such as
  `<img src=x onerror=alert("test")>`, in a suitable text field. Confirm it
  displays as literal text, not an image or executable element.
- [ ] In long intervention or announcement dialogs, scroll to and use the
  final action buttons.
- [ ] Use Tab and Shift+Tab to check keyboard navigation and visible focus.
  Check dialog focus on open and after closing. Test Escape dismissal in
  Chrome manually; a synthetic key event alone does not verify browser
  keyboard behavior.

## 4. Responsive checks

Use browser device emulation or resize the viewport to each size:

- [ ] 375 × 480
- [ ] 375 × 667
- [ ] 768 × 900
- [ ] 1280 × 900

At each size, check that:

- [ ] The menu trigger, close control, and navigation links have usable touch
  areas; every navigation item can be selected.
- [ ] Dialogs and form controls fit or scroll, and action buttons remain
  reachable.
- [ ] No unintended horizontal overflow or clipped controls appear.
- [ ] Important controls remain visible and usable; the page behind an open
  modal does not unexpectedly scroll.

## 5. Test frequency

- **Quick smoke check:** After a small code correction, check application
  loading, the changed control/workflow, and the affected screen's basic
  navigation. Run relevant syntax or diff checks when applicable.
- **Targeted regression check:** After changing a module, repeat its workflow
  and the directly connected workflows (for example, learner section changes
  and attendance/academic rosters).
- **Full regression check:** Before major milestones, review all core module,
  cross-module, responsive, and accessibility checks above. A full suite is
  not required after every CSS-only change; test the affected viewports and
  related interactions instead.

## 6. Known limitations

- Roster/class structure, attendance, academic, and support demo records use
  versioned browser-local storage; they are synthetic, local to this browser,
  and not shared or protected by backend authorization. Other module data may
  remain session-only.
- Demo account selection and client-side role navigation are not real
  authentication or enforced authorization; hidden views and local browser
  data are not secured from direct access.
- Supabase Auth password sign-in and recovery are implemented in source but
  require project configuration and have not been remotely tested.
- Production registration is disabled. There is no complete application
  schema, migration set, workspace persistence, grants/RLS foundation, or
  trusted membership backend.
- Multi-workspace functionality is browser-local simulation. Student
  monitoring records remain synthetic, browser-local, and unauthorized.
- Vercel hosting/deployment, Supabase/Vercel integration, and PWA installation
  have not been configured or verified.
- Offline record synchronization is not implemented.
- Settings displays data-free technical/account capability status; no account
  administration function is operational.
- School-specific rules, fields, roles, and permissions remain provisional.
- Dialog Escape-key dismissal still needs manual verification in Chrome.

Attendance backend authorization, database integrity, and RLS checks above
are future tests and have not been implemented or run. Remote Supabase Auth,
Vercel deployment, workspace isolation, and offline sync also remain untested
without configured external projects and implementation. These are known
prototype limitations, not results of a new test run. The prototype is for
demonstration with fictional data, not operational use.

## 7. Test record template

Copy this block for each test. Select one status and note if the check was
performed in a browser, manually, or with an automated command.

```text
Test ID:
Date:
Module:
Steps:
Expected result:
Actual result:
Status: Pass / Fail / Not tested
Finding or notes:
Verification method: Browser / Manual / Automated (command):
```

### Prior verification notes

The Phase 1 Task 4B browser checks covered selected validation and literal
text-rendering cases with synthetic input; `node --check script.js` and
`git diff --check` also passed at that time. Those results do not replace
running this checklist on a later build. Chrome Escape dismissal remains a
manual verification item.
