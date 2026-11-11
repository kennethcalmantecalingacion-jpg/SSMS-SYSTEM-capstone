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
- [ ] Verify public Auth sign-up is disabled and the trusted registration
  function accepts only valid, unexpired, bounded invitation codes. Confirm
  failed Auth invitations release their reservation and do not consume the
  code. The function is implemented in source but this flow has not been run.
- [ ] Verify invitation/password-establishment and recovery links on the
  exact configured origins. Confirm that registration does not grant workspace
  membership or workspace-creation authority.
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

## 2a. Backend authorization, attendance, and directory checks (source implemented; not run)

The migrations and attendance RPC implement the intended backend checks, but
the local database was unavailable because Docker/Podman are missing. These
are required database/API acceptance checks, not passing results. Run them
against a local Supabase stack after it is available. Use synthetic accounts,
sections, and attendance data.

The current pgTAP source declares 83 assertions. It exercises synthetic
Workspace A/B access to learners, attendance, memberships, invitations, join
requests, audit events, and restricted guidance; denial of client-side
membership/invitation/join-request/audit writes; assigned-counselor access;
Workspace B Owner denial for confidential guidance reads, creation, and
updates; an audited update-only path with append-only history; assigned
counselor creation and update with appended history; direct attendance write
denials; cross-workspace foreign-key rejection; revoked-member denial; and
manager-only atomic learner creation and enrollment transfer, including
duplicate identifier rejection, initial enrollment creation, prior-enrollment
closure, attendance-history preservation, and attributable workspace audit
events; and manager-only learner profile correction with old-value/reason/
actor history, audit attribution, duplicate-identifier rollback, and
teacher/cross-workspace denial. It also denies direct writes that would
bypass the atomic learner/enrollment/profile operations and checks that
paginated learner search respects RLS scope. These membership, directory,
transfer, historical assignment, and other database source tests have not
been executed.

- [ ] **Assigned Teacher:** Allow session creation and entry changes only for
  an approved assigned offering/section; deny unassigned sections and
  out-of-scope dates.
- [ ] **Adviser:** Deny recording and correction by default. The current
  migration grants attendance only to an assigned Teacher for the exact
  school year; do not enable Adviser recording without explicit approval and
  a reviewed policy change.
- [ ] **Guidance Counselor:** Deny general attendance session and entry
  access. Test any separately approved summary only through its specifically
  scoped path.
- [ ] **Parent/Guardian:** Deny general attendance table access. Test any
  future approved child summary only through its separately scoped path.
- [ ] **Designated System Administrator:** Deny general attendance session
  and entry access; technical/account administration does not imply learner
  data access.
- [ ] **Workspace Owner/Administrator:** Verify structure-management
  capability is workspace-scoped and does not grant attendance access,
  cross-workspace access, or confidential guidance access without separate
  approved assignments.
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
- [ ] **Directory read scope:** Verify a manager sees only its workspace and
  an assigned Teacher sees only learners in authorized sections.
- [ ] **Atomic learner creation:** Verify an authorized manager creates one
  learner plus its initial active-year enrollment; a duplicate identifier or
  invalid section/date leaves no partial record.
- [ ] **Enrollment transfer:** Verify a manager transfer closes the prior
  enrollment and starts the next enrollment on the requested date, preserves
  prior attendance, and rejects unauthorized, cross-workspace, same-day,
  retroactive, and attendance-invalidating attempts.
- [ ] **Learner profile correction:** Verify only workspace managers can
  correct the approved identifier/display name; duplicate identifiers roll
  back without partial history; previous values, reason, actor, and audit
  event are recorded; teachers and other workspaces are denied.
- [ ] **Class setup:** Verify only Workspace Owners/Administrators can create
  grade levels and sections, with duplicate labels and cross-workspace grade
  IDs rejected.
- [ ] **Real-account surface:** Confirm the real account never opens
  browser-local demo records and that unfinished monitoring modules remain
  explicitly unavailable.

## 2b. PWA app shell (local browser check required)

- [ ] Validate manifest name, scope, start URL, display mode, theme color,
  and icon response on the built preview.
- [ ] Verify service-worker registration and installation on a first visit.
- [ ] After a successful online visit, switch the browser offline and reload.
  Confirm the shell, built same-origin JS/CSS, and login screen render.
- [ ] Confirm cross-origin Supabase requests fail visibly offline and no
  authenticated API response or learner record is present in Cache Storage.
- [ ] Verify update notification is user-controlled and activation does not
  unexpectedly replace a page with unsaved state.
- [ ] Check online/offline status changes and mobile installability where
  supported.

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
- Production Auth, invitation registration, workspace functions, and
  attendance UI/RPC source are implemented, but remote Auth and database
  behavior have not been tested.
- Versioned migrations, grants, RLS, synthetic two-workspace seed data, and
  pgTAP isolation test source exist. None were executed: Docker/Podman are
  unavailable. Do not claim tenant isolation is verified.
- The production UI connects workspace listing/creation and attendance only.
  Student/class CRUD, membership administration, gradebook, warnings, support,
  announcements, reports, and dashboard remain unconnected for real accounts.
- The user reports Vercel project `ssms_front`, Supabase integration, and
  Production/Preview/Development public variables are configured, and the
  application URL is `https://pwassms.vercel.app`. The public URL returned
  its account sign-in page in a browser. Auth operations, backend workflows,
  exact environment settings, and Preview isolation were not verified.
- The PWA shell, static-asset service worker, online/offline status, and
  update handling are in source. Offline login-shell reload was verified in a
  local browser; actual device installation and hosted PWA acceptance remain
  unverified. Offline record synchronization is not implemented.
- Settings displays data-free technical/account capability status; no account
  administration function is operational.
- School-specific rules, fields, roles, and permissions remain provisional.
- Dialog Escape-key dismissal still needs manual verification in Chrome.

Database integrity, attendance authorization, RLS, Auth, and hosted workflows
are untested. The prototype is for demonstration with fictional data, not
operational use.

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

### Connected implementation checks

- `npm.cmd run build` passed.
- `npm.cmd test` passed (1 Node test: PWA manifest).
- `node --check` passed for `src/app/auth-shell.js`,
  `src/app/production-workspace.js`, `src/app/pwa.js`, and `public/sw.js`.
- `git diff --check` passed.
- Local preview browser: manifest and service worker registered; the current
  cache contained only the app shell, manifest, icon, and built JS/CSS. Offline
  reload rendered the login shell and offline status. Demo Portal and Demo
  Teacher entry worked. The synthetic install-prompt event displayed the
  install action; this did not install the application on a device. At
  375 × 667, the Demo Overview had no horizontal overflow.
- `supabase start` could not run because Docker and Podman are unavailable.
  Database migrations, pgTAP tests, Edge Function execution, and real Auth or
  attendance flows were not run. No remote migration or deployment occurred.
