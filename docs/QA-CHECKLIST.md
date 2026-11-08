# QA Checklist

Manual checks for the generic presentation prototype. This is a reusable
checklist, not an automated test suite. Use fictional data only; never enter
real learner information or credentials. Record each test run with the template
at the end.

## 1. Pre-test checks

- [ ] Open the existing `index.html` application in a browser and select a
  fictional demo account.
- [ ] Confirm the account's permitted landing screen appears.
- [ ] Open the browser console and check for errors during load and testing.
- [ ] Use fictional names, IDs, notes, and messages exclusively.

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
- [ ] **School Administrator:** Do not enable until the deployment institution approves this
  separate proposed role and its scope.
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
- There is no backend or central database.
- Offline record synchronization is not implemented.
- Settings displays data-free technical/account capability status; no account
  administration function is operational.
- School-specific rules, fields, roles, and permissions remain provisional.
- Dialog Escape-key dismissal still needs manual verification in Chrome.

Attendance backend authorization, database integrity, and RLS checks above are
future tests and have not been implemented or run. These are known prototype
limitations, not results of a new test run. The prototype is for
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
