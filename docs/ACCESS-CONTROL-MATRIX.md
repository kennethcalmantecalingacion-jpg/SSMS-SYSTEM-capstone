# Provisional access-control matrix

This is a requirements proposal for the capstone presentation prototype, not
an approved LNHS access policy. It must not be used to authorize real access to
learner records. The current website has no authentication or enforced roles.

## What the sources establish

- The user-provided SOP names advisers, teachers, parents, and guidance
  counselors as people involved in monitoring, alerts, communication, and
  interventions. It does not specify their exact permissions.
- The [DepEd orders listing](https://www.deped.gov.ph/category/issuances/deped-orders/)
  identifies DO_s2026_015r as the revised classroom assessment and grading
  issuance. The complete issuance has not been reviewed for this proposal; it
  is not used here to infer role permissions.
- The [National Privacy Commission Data Privacy Act page](https://privacy.gov.ph/data-privacy-act/)
  and [Official Gazette copy of Republic Act No. 10173](https://www.officialgazette.gov.ph/2012/08/15/republic-act-no-10173/)
  are identified project references. They were not readable during this
  requirements pass. No legal interpretation or compliance conclusion is
  made here.
- [Supabase's Row Level Security guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
  is vendor technical guidance, not school policy. It explains that database
  grants and row-level policies both matter if that technology is selected.
  Any implementation, including a school-local server, must enforce
  authorization at the trusted data layer rather than relying only on hidden
  buttons or client-side role state.

## Draft role matrix

**Legend:** `Own/assigned` means only learners, classes, referrals, or
conversations explicitly assigned to that account. `Proposed` means a
workflow suggestion based on the SOP, not a confirmed LNHS rule.

| Area | Teacher | Adviser | Guidance counselor | Parent/guardian | Designated system administrator |
|---|---|---|---|---|---|
| Learner directory | Read minimum details for own classes; no profile edits by default | Read and update basic details for own advisory section, subject to school process | Read minimum details for an assigned referral | Read only the linked child’s approved profile details | Manage accounts and approved configuration; learner-record access is not automatic |
| Attendance | Record and correct attendance only for assigned classes, with change history | View and record attendance for own advisory section; coordinate corrections | View relevant attendance for an assigned referral; no bulk roster edits | View only linked child’s approved attendance summary | No routine attendance editing; any exceptional support action must be logged |
| Activities and scores | Create activities and enter/correct scores only for assigned classes and subjects | View academic summaries for own advisees; score editing only where also assigned as teacher | View relevant summaries for assigned referrals; no grade edits | View only the linked child’s approved progress summary | No routine score editing; no power to change grading rules without approval |
| Early warnings | Review relevant alerts in assigned classes and refer concerns through an approved process | Review and coordinate alerts for own advisees | Receive and manage referrals assigned to the guidance caseload | Receive only school-approved messages about their own child; never internal alert queues | Configure access and approved system settings; no unilateral authority to set student-risk thresholds |
| Follow-up / interventions | Record classroom-level action or referral; view only related follow-up needed for teaching | Coordinate and track adviser follow-up for own advisees | Create and manage guidance follow-up for assigned referrals; sensitive notes kept separately and tightly restricted | Exchange approved messages about their child; no access to internal staff notes | Technical administration only by default; sensitive case content is not included in routine admin views |
| Announcements and messages | Send or respond within approved school communication scope | Coordinate messages for own advisees/families | Communicate about assigned referrals using school-approved channels | Read/respond only in conversations linked to their child | Maintain messaging configuration; no routine reading of private conversations |
| Reports and exports | Own classes, minimum necessary detail | Own advisory section and approved summary reports | Assigned referral/caseload summaries only | No staff reports or other learners’ information | Operational reports only when authorized; exports restricted, logged, and approved |
| Accounts, roles, structure, sync | No account/role administration | No account/role administration | No account/role administration | No account/role administration | Provision/deactivate accounts and maintain approved grade/section and device/sync configuration; every privileged action logged |

## Boundaries for the prototype

- These are proposed access boundaries, not claims that DepEd or LNHS has
  approved them. Confirm assigned-class and assigned-caseload rules with the
  school.
- A parent account is mentioned in SOP question 2, but the school must decide
  identity verification, who may be linked to a learner, what can be viewed,
  and which communication channels are allowed.
- The SOP mentions boys' and girls' records separately, but does not define the
  field, purpose, categories, or who may view it. Do not create a broad
  sex-based access boundary from that note alone. Keep any approved demographic
  filter limited to its documented purpose.
- Do not put sensitive guidance notes, stigmatizing labels, or speculative
  risk profiles in general teacher or parent views. Referral summaries should
  be limited to what the recipient needs for the approved action.
- Early warnings should be review prompts with explainable evidence, not
  automated conclusions or unrestricted notifications.
- Offline mode does not itself enforce roles. Local device access, encrypted
  storage, backup, account revocation, conflict handling, and sync permissions
  need a school-approved architecture and threat review before real data is
  used.
- Do not implement authentication as a decorative sign-in page or a
  client-side role selector. In a static HTML/JavaScript app, users can inspect
  or alter client code and state. A later login must be backed by trusted
  authentication and authorization on the school-controlled data service.

## Decisions required from LNHS before implementing roles

1. Which staff positions map to Teacher, Adviser, and Guidance Counselor in
   this system, and can one person hold multiple assignments?
2. Who approves accounts, section/subject assignments, parent-child links, and
   role changes? Who is the designated system administrator?
3. Which records may each role read, create, correct, export, or delete, and
   what correction/audit procedure applies?
4. What may parents see, how is guardian identity and learner relationship
   verified, and which communication methods are approved?
5. Which referral fields are needed by teachers, advisers, and guidance staff?
   Which guidance records must remain restricted to guidance personnel?
6. What school-managed local sync model is intended, and what happens to
   offline edits after an account is disabled, a device is lost, or two devices
   change the same record?

## Status

Draft for adviser/client and school privacy-officer review. Do not build
real-data login, role enforcement, parent access, sensitive profiling, or
production sync from this matrix until the decisions above are confirmed.
