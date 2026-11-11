# Student Monitoring System — Authoritative Architecture and Implementation Requirements

> This is the authoritative architecture and implementation reference for the Student Monitoring System. Current project state is documented separately and must be rechecked against the working repository before implementation.

---

# 1. Your role and working principles

Act as a senior full-stack software architect, application security engineer, database designer, PWA engineer, accessibility-focused UI/UX engineer, QA engineer, and patient technical mentor.

You are helping build a **Student Monitoring System**. Explain important technical decisions plainly, preserve the approved project direction, and deliver complete connected workflows without overstating what has been implemented.

Work with the judgment of a careful senior engineer:

1. Inspect the actual repository before editing. The checked-out workspace is the source of truth; supporting documentation may lag the current code.
2. Understand existing behavior before changing it. Preserve working features unless the user approves a behavior change or a real defect requires correction.
3. Separate **implemented behavior**, **planned functionality**, **technical recommendations**, **assumptions**, and **items requiring adviser or deployment institution review**. Never blur them together.
4. Implement the complete scope the user authorized, including connected dependencies and necessary regression fixes. Internal stages are useful, but do not stop for approval between them.
5. Explain important technical terms in plain language when reporting. Keep implementation and reporting focused on the task.
6. Do not pretend a feature is complete because a screen, mock value, or button exists. A feature is complete only when its behavior, data persistence, authorization, error handling, and tests are appropriate to its declared scope.
8. Be honest about limitations. Do not claim the application is production-ready, secure, compliant, deployed, approved for deployment, or tested on devices unless evidence supports that exact claim.
9. Do not ask questions that the repository or supplied project notes can answer. Mark unknown deployment-specific matters as pending and proceed safely. Ask only when a genuine blocker, unresolved requirement, destructive operation, or external authorization prevents safe progress.
10. Never use real student records, names, IDs, contact details, images, credentials, or other personal information in development, sample data, screenshots, tests, or demonstrations. Use clearly fictional data only.
11. Do not commit, push, deploy, create provider accounts, or alter external services without explicit user authorization.

## Required implementation workflow

The active user task defines the authorized scope. Once the user requests implementation:

- Inspect relevant source, configuration, and supporting requirements.
- Implement the requested connected workflow and any necessary dependencies without approval gates between internal stages.
- Run relevant tests, fix defects, and perform regression checks in the same run.
- Update existing documentation to describe actual behavior, validation, and remaining limitations.
- Provide one consolidated completion report with the files changed, checks run, results, and any real blockers.

Use the workflow: **Analyze → Implement → Test → Fix → Verify → Document → Report.**
Do not force every small feature into a separate task, and do not claim the entire system is complete when only part of its connected behavior exists.

---

# 2. Product identity and project boundaries

## Product identity

**Student Monitoring System**

This repository contains an institution-independent application prototype.
Do not brand the application for a particular institution. Keep the separate
capstone manuscript outside this repository and do not edit it as part of
software implementation tasks.

## Current stated problem areas / system purpose

The system is intended to help authorized school personnel monitor student progress and identify concerns early. The problem areas discussed for the capstone include:

- **A. Student management:** basic student information and school/class organization.
- **B. Academic performance tracking:** records of academic activities, assessment results, and progress.
- **C. Attitude and behavioral pattern monitoring:** school-relevant observations or concerns, only where the school approves suitable fields and procedures.
- **D. Attendance monitoring:** recording, reviewing, and reporting attendance.
- **E. Announcements and messaging:** appropriate communication among authorized school personnel and, if approved, parents/guardians.
- Timely notification or routing of early-warning items to the appropriate adviser, teacher, parent/guardian, or guidance counselor according to an approved procedure.
- A digital mechanism for following up and recording actions taken after an alert or referral.
- Evaluation of the system's usability, reliability, and accuracy as required by the approved study.

Do not invent research results, respondent counts, interviews, surveys, system evaluations, test results, approvals, or deployment outcomes. The developer's manuscript and the software implementation must describe the same actual state of the project.

## Deployment-specific requirements are not automatically approved

Project requirement discussions included questions about yearly student
population, tracks offered, enrollment information, demographic reporting,
student monitoring, and follow-up with families and guidance personnel. These
are prompts for deployment review—not blanket permission to collect data or
implement a workflow.

The following remain provisional until reviewed by authorized representatives
for the intended deployment:

- Exact student profile and enrollment fields.
- School-year, grade-level, section, subject, and track/strand structure.
- Whether/how sex or gender is recorded, which terminology the school uses, and the purpose and authorization for any related filter or report.
- Attendance categories, absence reasons, evidence/letter attachments, correction rules, and attendance periods.
- Official academic subjects, assessment categories, grading periods, grading calculations, passing rules, and imports/exports.
- Objective behavior/attitude observation categories, who may enter and view them, and retention/correction procedures.
- Early-warning thresholds, categories, evidence, priority, review, notification, and escalation procedures.
- Intervention statuses, required information, participants, and who can see each type of note.
- Staff assignments and exact permission boundaries.
- Parent/guardian identity verification, child relationship verification, data visibility, and communication channels.
- Account approval, audit, retention, backup, recovery, and lost-device processes.

Do not convert project discussions into institutional policy without
confirmation.

## Privacy and dignity constraints

- Collect the minimum student information needed for an approved school purpose.
- Do not create stigmatizing, speculative, or judgmental labels such as “tambay,” “problem student,” “bad attitude,” or unsupported risk/personality classifications.
- Do not add ethnicity, Indigenous identity, socioeconomic labels, family circumstances, health information, or other sensitive profiling fields merely because they might make a prediction seem more sophisticated. Such information requires a clearly established lawful purpose, necessity, school authorization, and appropriate safeguards; do not add it by default.
- Behavior-related information, if approved, should use objective, factual, limited observations and a defined purpose—not subjective character judgments.
- Keep sensitive guidance/counseling records separate from general classroom monitoring. A teacher or administrator must not automatically gain access to confidential guidance notes.
- Early warnings must be explainable review prompts, not unquestionable conclusions about a learner. Display the relevant evidence and time period, allow authorized staff to verify or correct it, and avoid presenting a sample threshold as an official school rule.
- Do not claim compliance with any education regulation, privacy law, or quality standard merely because a feature is present. Identify the deployment jurisdiction, verify applicable official primary sources, and obtain authorized institutional review. A quality standard may be used as an evaluation reference if appropriate; do not claim certification.

---

# 3. Official target architecture

## Recommended target architecture

Use one institution-independent, role-aware **Progressive Web App (PWA)** with Vercel for frontend hosting and Supabase for backend services.

### Official target architecture

- **Frontend:** retain the existing Vanilla JavaScript, HTML, CSS, and Vite application. Do not migrate to Next.js, React, or another framework solely to deploy on Vercel.
- **Frontend hosting and deployment:** Vercel serves the Vite-built static application over HTTPS and connects to the existing GitHub repository for deployment automation.
- **Source control:** GitHub hosts source and versioned Supabase migrations. Git pushes and pull requests may trigger Vercel Preview deployments; production deployment is associated with the configured production branch.
- **Backend platform:** Supabase provides the backend services and Supabase-managed PostgreSQL database. PostgreSQL is part of the Supabase project; it is not a separately purchased or independently hosted database in this architecture.
- **Authentication:** Supabase Auth authenticates accounts. Authentication alone does not grant workspace membership or access to student records.
- **Authorization and data:** PostgreSQL grants, constraints, and Row Level Security (RLS) enforce access. Every exposed table and Storage object requires an explicit reviewed policy; frontend navigation and publishable keys are not authorization.
- **Trusted operations:** Supabase Edge Functions perform operations that require trusted server-side validation, privileged credentials, or third-party secret handling. Keep service/secret keys server-side only.
- **Files:** Supabase Storage holds approved files in private buckets with object-level authorization. PostgreSQL remains the authoritative source for transactional records.
- **Realtime:** Supabase Realtime is optional and may be used only where a specific workflow needs it and authorization is verified.
- **Application format:** an installable, responsive PWA with a Web App Manifest and service worker. PWA implementation is a target, not a claim about the current code.
- **Future offline capability:** Cache Storage is for application assets; IndexedDB may later hold narrowly scoped, account/workspace-partitioned offline data and a controlled synchronization outbox. The server remains authoritative, and every sync operation must be reauthorized.
- **Optional backup/export:** Google Drive may be a workspace-authorized secondary backup/export destination. It is not a transactional database or a replacement for Supabase backup and restore controls.

Vercel and Supabase are connected services with distinct responsibilities: **Vercel hosts and deploys the frontend; Supabase provides backend services and managed PostgreSQL.** Installing an integration or adding environment variables does not by itself mean the application is configured, connected, tested, or deployed.

For Vite, the current frontend auth client expects `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The Supabase/Vercel integration may use a different public prefix by default; configure a Vite-compatible public prefix or explicitly map these variables. Never prefix a secret, service-role, or privileged key with `VITE_`, `NEXT_PUBLIC_`, or any client-exposed prefix. A publishable key is expected in browser code but does not replace grants, RLS, or server-side authorization.

This architecture is the approved project target. Provider-specific setup must be checked against current official documentation. Deployment environment configuration must keep Production separate from Preview; previews should use an isolated Supabase preview branch/project rather than silently targeting production data.

## Why this architecture fits the stated needs

The developer selected these operating requirements:

1. Synchronization: **both automatic and manual**.
2. Devices: **shared**—multiple staff members use their own phones/computers and may also use shared devices.
3. Security: **both online and offline access must be protected**; role-based access must be more than hiding interface controls.

A central backend is needed for consistent multi-user shared records, authoritative permissions, conflict handling, and cross-device synchronization. A local-only application can work offline on one device, but independent device copies do not automatically become one reliable shared record set. Google Drive file sync alone does not provide safe row-level access, transactional updates, or a proper multi-user database.

## Architecture trade-offs

Use these trade-offs when explaining and defending the recommendation:

- **Managed Supabase backend (preferred):** provides managed PostgreSQL, authentication, database policies, and private file storage. It avoids maintaining a physical server but creates provider, internet, plan/quota, and configuration dependencies. RLS, grants, file policies, and authentication must still be designed and tested correctly.
- **Local-only browser app:** simpler and can work offline, but each device has isolated data. It does not satisfy reliable shared multi-user records without a separate synchronization service.
- **Google Drive as the primary data store:** not recommended. Drive is file-oriented, not a transactional multi-user record database. The Drive `appDataFolder` is per-user application storage and cannot be shared, so it is not suitable as the shared school backup folder. Use an approved school-owned Drive location or Shared Drive for backup/export only after its ownership and permissions are verified.
- **Google Apps Script backend:** may reduce setup complexity for a small Google-centric prototype, but quotas, execution limits, concurrency, and custom security/data modeling make it a less suitable default for a growing, multi-role student-record system. Re-evaluate only if the deployment institution requires a Google-only environment or rejects the preferred managed backend.
- **School-hosted/on-premises backend:** could address a school requirement to keep infrastructure under its own control, but requires school IT ownership, security maintenance, backup, uptime, remote access, and network support. Do not choose it by default for a solo capstone developer.

## One application, not separate apps per staff role

Build **one PWA and one codebase**. Users sign in to the same application; role assignments and authorized scopes determine which records and actions are available. Do not produce separate APKs/installers for Teacher, Adviser, Guidance Counselor, or Admin unless a future, explicit requirement justifies separate applications.

The UI may adapt its navigation and dashboard to each account's permissions, but the backend must enforce permissions independently. Client-side hiding is only a usability feature, never the security boundary.

---

# 4. Account, platform, workspace, and authorization model

Use role-based permissions combined with specific staff assignments. A staff member may hold more than one role or assignment—for example, a teacher who is also an adviser. Do not model a person as belonging to exactly one permanent role if the school may assign multiple responsibilities.

## Separate security scopes

- **Account scope:** Supabase Auth identifies a person globally. A profile is separate from authentication identity and workspace membership.
- **Platform scope:** a Platform Operator may manage platform registration invitations and workspace-creation grants. Platform authority does not automatically grant membership in a workspace or access to student records. Bootstrap the initial operator out of band; never allow frontend role selection, ordinary registration, or workspace ownership to create this role.
- **Workspace scope:** each workspace has its own owner, active members, role assignments, invitations, join requests, configuration, assignments, and student records. A user may hold different roles in different workspaces. Workspace IDs supplied by a client are context, not proof of permission.

## Controlled registration and account authentication

- Use Supabase Auth for email/password sign-in, session persistence, verification, and password recovery. Do not build a parallel password store.
- Do not enable unrestricted public registration. A platform-issued registration invitation must be validated by trusted backend code before Auth invitation/account creation.
- Store invitation tokens as cryptographic hashes; support expiry, revocation, optional email restrictions, bounded redemption, rate limiting, and atomic one-time consumption. Store no token in plaintext after it has been shown to its issuer.
- Use a Supabase Edge Function or another trusted backend operation for Auth Admin invitations and invitation validation. Never use a service-role or secret key in browser code.
- The person may establish a password through the verified invitation flow. Keep profile fields separate from authorization metadata; collect only approved minimum information.
- Registration grants no workspace membership, role, student-record access, or workspace-creation permission.
- A production sign-in does not by itself open a workspace. Until a trusted membership/data backend exists, authenticated accounts must remain isolated from demo/local student records.

## Workspace creation, invitations, and membership

- Require an independent platform-issued **Workspace Creation Grant** to create a workspace. Grants are hashed, expiring/revocable, limited-use, and atomically consumed by trusted backend code. Registration invitations and workspace-creation grants are distinct authorization types.
- Workspace Owners and authorized Workspace Administrators may invite accounts and manage ordinary membership only within their authority. Workspace invitations cannot grant Platform Operator or Workspace Owner privileges.
- Invitations are workspace-bound and may be email-restricted, expiring, revocable, bounded-use, and role-limited. New users complete platform registration and email verification before accepting workspace invitations.
- Workspace discovery is private/unlisted by default. A join request remains pending and grants no membership or data access until an authorized member approves it.
- Workspace settings may enable or disable join requests. Public discovery requires an explicit reviewed setting.
- After sign-in, users with one membership may enter it, users with multiple memberships choose/switch among them, and users with none see onboarding. Never show Boter School to an ordinary account without explicit membership or the isolated demo flow.
- Ownership transfer is explicit and auditable. Prevent loss, demotion, or removal of the only active Workspace Owner.

## Proposed role concepts

### Platform Operator

Manages platform registration authorization, workspace-creation grants, and platform configuration. This is not a workspace role and grants no routine access to learner, attendance, academic, intervention, or guidance content.

### Workspace Owner and Workspace Administrator

Provisional responsibilities within their own workspace:

- Manage approved grade levels, sections, school years, subjects, and school structure.
- Invite and deactivate workspace members and assign permitted workspace roles according to an approved process.
- Assign teachers to subjects/sections and advisers to advisory sections.
- Configure approved school workflows and report access.
- View school-level dashboards and reports only to the extent the school approves.
- Review workspace settings, backup status, and assignment administration.

Workspace administration must not grant platform authority or unrestricted access to confidential guidance notes. Ownership, membership, role, and assignment are distinct.

### 2. Guidance Counselor

Provisional responsibilities:

- Review referrals assigned to the guidance caseload.
- Manage guidance follow-up and confidential support information where approved.
- View the minimum academic/attendance information needed for an assigned referral.
- Record guidance actions and outcomes in a restricted area.

Guidance/counseling notes must have stricter access controls than ordinary intervention summaries. Do not place sensitive guidance notes in a general teacher forum, announcements feed, or ordinary parent-visible record.

### 3. Adviser

Provisional responsibilities:

- View and manage the assigned advisory section, subject to school policy.
- Review attendance and approved academic summaries for assigned advisees.
- Coordinate early-warning review and classroom/student follow-up.
- Track the progress of interventions assigned to or coordinated by the adviser.
- Escalate a concern to guidance through the approved referral process.

### 4. Teacher / subject teacher

Provisional responsibilities:

- View assigned classes, sections, and subjects only.
- Record assessments and scores for assigned classes/subjects.
- Record attendance only where the deployment institution authorizes the teacher to do so.
- View relevant learner information needed to teach the assigned class.
- Record factual classroom-level observations or make referrals only if the school approves that function.

### 5. Parent / guardian — future/conditional role

Project requirements identify parents/guardians as possible stakeholders, but a parent portal should **not be implemented as an active v1 account type until approved for the deployment**.

If later approved, a parent/guardian may only:

- View the linked child's approved information and summaries.
- Read/respond to communication approved for that deployment concerning that child.
- Never access internal staff alerts, other students, staff-only reports, or guidance notes.

Identity and guardian-child relationship verification must be defined by the deployment institution before access is enabled.

### Technical system administration

Provider/project administration is distinct from a workspace role. Technical access must not be used to imply routine permission to view learner or counseling content.

## Authorization requirements

- Use least privilege and deny by default.
- Determine authorization on the server/database for every read, create, update, delete, export, and file request.
- Use Supabase Auth for authentication and server-verified identity/session handling; do not build a decorative login page that simply sets a local role variable.
- Use PostgreSQL RLS with carefully designed table grants and policies. Test both allowed and denied cases for each role and assignment scope.
- Scope access by school, school year, assigned section, subject, advisory assignment, or guidance caseload as applicable.
- Model role assignments and class/subject/caseload assignments as data, not as hardcoded email checks or user IDs in the JavaScript.
- Avoid relying solely on a custom role claim or client state if the underlying assignment can change. Define how policy changes take effect after staff assignments or roles are updated.
- A user must not be able to obtain another user's or another section's data by changing an ID, query parameter, local state, or API request.
- Record privileged actions and sensitive record changes in an audit trail.
- Treat exports as data access: apply the same authorization as the screen and log restricted exports where appropriate.

## Account onboarding

Use invitation-authorized account registration, followed by membership-based workspace selection. The exact deployment identity checks, password/session configuration, and any multi-factor requirement must be verified against current provider documentation and deployment review.

Never store plaintext passwords, invent a custom password hashing/login flow, or put a Supabase service-role/secret key in frontend source, a public repository, or browser storage.

## Isolated synthetic demonstration workspace

The browser-local Demo Portal remains separate from production Auth and workspace data. Where retained, **Boter School** is a fictional demonstration workspace only; it is not the product identity, a real institution, or a platform operator. Seeded demo accounts may have distinct Workspace Owner, Teacher, Adviser, and Guidance Counselor roles only inside the isolated demo environment. They never receive Platform Operator authority.

Demo records and credentials must remain synthetic and must not be copied to production or into another workspace. Predictable demo passwords are allowed only in clearly isolated local development/test fixtures; never seed universal demo credentials into production or use browser-side demo identity as production authentication. Demo users have no platform registration or workspace-creation authority. Newly created real workspaces start with no copied demo student records. Do not automatically upload or migrate unscoped localStorage data to a real workspace; preserve the source as a recovery path until an explicit, validated migration/export flow is authorized and tested. If demo records cannot yet be isolated by workspace, keep authenticated real workspace access to those modules disabled rather than implying isolation.

---

# 5. Main modules and expected behavior

Treat the following as the target system modules. Preserve the useful work already present in the current prototype, but do not mistake prototype behavior for complete functionality.

## 5.1 Overview / Dashboard

Purpose: give each authorized staff member a quick, role-specific view of information requiring attention.

Desired capabilities:

- Show student population counts from actual authorized records, with filters for school year, grade level, section, and approved track/strand dimensions where applicable.
- Display attendance summaries and trends for a selected date range or school period.
- Show academic summaries only for the records that the current user may access.
- Show open early-warning items, pending reviews, intervention follow-ups, and upcoming check-in dates.
- Show relevant announcements and unread counts.
- Provide direct shortcuts to common tasks, especially recording attendance and reviewing a student concern.
- Use clear empty/loading/error states. Distinguish “no records,” “not authorized,” and “not yet configured.”

Rules:

- Do not hardcode numbers such as 1,248 learners, 94.2% attendance, 12 active support plans, or other decorative sample values as though they were live school facts.
- For demonstration, use a consistent synthetic dataset and keep sample values clearly separated from production data in code and documentation.
- Counts, charts, and aggregates must respect the user's permissions; do not accidentally leak school-wide totals to a user who should only see one class.
- A warning count is a count of review items, not proof that a learner has a particular personal trait or risk level.

## 5.2 Student Directory / Student Profiling

Purpose: manage the minimum student information needed for monitoring and enrollment/class organization.

Desired capabilities:

- Search by learner name and deployment-approved student ID.
- Filter by school year, grade level, section, and only demographics or tracks approved for deployment.
- View a student profile with approved basic information and current enrollment.
- Add and edit a student profile according to role permission.
- Organize enrollment by school year, grade level, section, and subject/class assignment where applicable.
- Support transfers between sections without destroying past attendance or academic history.
- Keep historical enrollment relationships where necessary rather than moving all old records as though the learner had always belonged to the new section.
- Support annual population reporting and track/strand reporting only if the deployment institution confirms the school structure and fields.
- Use pagination or server-side pagination for large student lists.

Profile rules:

- Confirm the actual required profile fields with the deployment institution. Do not invent a comprehensive student-data questionnaire.
- The existing prototype has a Boy/Girl filter and sample `gender` values. Keep this strictly synthetic/provisional until school terminology, purpose, legal basis, allowed categories, and access are confirmed. Do not expand it into sensitive profiling.
- Do not add “Indigenous student,” “tambay,” socioeconomic labels, family-problem labels, or speculative behavioral profiles.
- Avoid exposing full student information on a screen when a roster needs only name, ID, and section.
- Distinguish a current enrollment assignment from a student's historical enrollment.

Optional terminology clarification if the school confirms it:

- **Pin:** keep a selected item near the top of a relevant list because it is important in the current workflow.
- **Bookmark:** save an item for later reference without marking it urgent or changing its priority.

Do not build both functions until their intended use is clear; never use a bookmark as an access-control mechanism or an implicit warning status.

## 5.3 Class and School Structure Management

Admin-authorized capabilities:

- Create/manage school years or academic periods.
- Create/manage grade levels and sections.
- Configure subjects and subject offerings by grade/section/school year.
- Assign staff to subjects, sections, advisory classes, or a guidance caseload.
- Enroll learners and preserve enrollment history on transfer or school-year rollover.
- Record track/strand offerings only if the deployment institution confirms they are applicable and provides the accepted list.

Avoid hardcoding only Grade 7 and Grade 8. The prototype may seed these as synthetic examples, but the data model must be configurable.

## 5.4 Attendance

Purpose: let authorized staff record attendance quickly and reliably.

Desired flow:

1. Open Attendance.
2. Select school year/date/session and assigned class or section.
3. Load the authorized roster.
4. Mark all present when appropriate, then change exceptions, or use an equally fast roster workflow.
5. Choose an approved status for each learner.
6. For absences/exceptions, add a reason only if the school approves the field and workflow.
7. Optionally attach a scanned/photo excuse letter using the browser file picker or camera capture where supported, subject to approval and upload restrictions.
8. Review totals and incomplete entries.
9. Save; verify the server accepted the change.
10. Show a useful saved state and a timestamped change/correction history.

Proposed statuses currently used by the prototype are **Present, Late, Absent, and Excused**. They are not official until the deployment institution confirms terminology and rules.

Other requirements:

- Search roster by learner name or ID.
- Filter the visible roster by approved criteria.
- Preserve the current intended behavior that filtering the roster does not silently reduce the section-level totals or validation scope. Confirm whether mark-all should affect the whole roster or only filtered results before changing it; clearly communicate the scope of the action.
- Do not let a filtered screen imply that hidden learners were marked or excluded from the underlying record.
- Validate complete status marking where the school requires it.
- Prevent duplicate attendance records for the same learner/session.
- Allow correction only to authorized staff and record who changed what and when.
- Handle late arrival, excuse documentation, and attendance sessions according to approved procedures—not invented rules.
- Support pagination/virtualization if roster size demands it without making attendance entry cumbersome.

## 5.5 Academics / Gradebook

Purpose: let teachers manage assessments and score entry for assigned classes and subjects.

Desired workflow:

1. Teacher opens assigned class/section.
2. Selects subject and grading period/term approved for deployment.
3. Creates or selects an assessment/activity.
4. Enters the activity title/category and possible points according to approved assessment rules.
5. Enters learner scores in a roster or table.
6. Validates scores and incomplete entries.
7. Saves and can retrieve the same records from another authorized device.
8. Corrections retain an audit history.

Desired capabilities:

- Teacher assignment to classes/subjects can be made by Admin or a delegated approved process.
- Custom activity names and possible points may be supported.
- Assessment categories, dates, terms, and official grading fields must match rules approved for deployment.
- Validate that scores are numeric and within accepted bounds. Handle missing, excused, absent, and not-yet-graded values distinctly where required.
- Search by learner name/ID and paginate large rosters.
- Import/export should begin with a clearly documented CSV template. XLSX can follow if needed. Implement XML only when the deployment institution supplies or confirms a precise XML schema; never invent one.
- Any uploaded import must be previewed, validated, and confirmed before applying. Report rejected rows clearly and avoid partial silent imports.
- Keep raw assessment scores distinct from any official computed grade.
- Do not calculate final grades, GPA, honors rankings, pass/fail labels, or intervention thresholds until the applicable official grading issuance and the deployment institution procedure have been reviewed and confirmed.
- A simple percentage average may be shown in the prototype, but it must never be described as an official grade calculation.

## 5.6 Early Warnings / Alert Review

Purpose: identify records that may need a timely human review and route them privately to the correct assigned staff.

Desired capabilities:

- Potential alert categories may include attendance, academic progress, or overdue follow-up, but final categories and thresholds require deployment institution approval.
- Show why the item appeared, the underlying evidence, the time period, the date created, and the assigned learner/class context.
- Allow an authorized staff member to acknowledge/review, add a permitted action, assign or refer the item, and track its status.
- Provide category/status filters and search.
- Allow a warning to begin an intervention workflow without copying sensitive details into an unrestricted area.
- Provide a review history and audit trail.

Notification approach:

- **Private-first.** Route a new review prompt to the authorized teacher/adviser for the assigned class or student.
- Escalate to guidance only according to the approved referral procedure and access scope.
- Notify parents/guardians only when the deployment institution defines the approved event, recipient verification, message content, and channel.
- Never broadcast an individual student's warning to all teachers or all parents.
- Do not send an external notification merely because a record appears in an in-app queue.

Rules:

- The existing prototype has four synthetic prompts in its JavaScript data, with sample categories and priority labels. They are not automated classifications or real thresholds.
- Do not silently transform sample labels into a risk score or automated conclusion.
- Any rule-based detection must be transparent, versioned, testable, and approved. Show the actual rule/evidence used.
- Allow an authorized person to dismiss, correct, or mark a false positive according to an approved procedure.
- Keep sensitive behavior/guidance information out of ordinary warning text unless the user's role is explicitly authorized to see it.

## 5.7 Interventions / Student Support Workspace

Purpose: track the action taken after a warning, teacher concern, or guidance referral.

The developer wants a **private, case-based workspace with some familiar discussion/thread behavior**, not a public staff forum.

Potential fields and functions:

- Case/support-plan title.
- Linked learner or learners only where the approved workflow requires it.
- Source warning/referral or reason.
- Case category/tag, priority if approved, and current status.
- Assigned staff member and authorized participants.
- Planned action, follow-up date, and next check-in.
- Chronological update/activity timeline.
- Short messages or progress notes within the case.
- Attachments with access control and safe file handling.
- Outcome/resolution and completion date.
- Search and status filters for authorized users.

Potential status examples in the current prototype are Planned, In progress, Follow-up, and Completed. These are provisional.

Security and usability:

- Cases are visible only to approved participants and roles that require access.
- A general teacher should see only the follow-up information necessary for their action.
- Confidential guidance notes must be kept in a distinct, more restricted data area/table and not automatically copied to the general case timeline.
- Parents must not see staff-only notes or internal case discussion.
- Keep notes factual, concise, and limited to the approved purpose. UI hints may remind staff not to put unnecessary sensitive details in ordinary progress updates.
- File attachments must be stored in private storage with authorization on every download. Validate file type and size; do not expose public object URLs for student documents.
- Track who added or edited an update and when.

## 5.8 Announcements and Messaging

Purpose: support approved school/workspace communication.

Initial staff workspace capability:

- Create an announcement with title and message.
- Choose an authorized audience (all staff, a role, grade level, section, or another group approved for the deployment).
- Display posts in a feed with date, author, and read/unread state.
- Show in-app unread counts.
- Support edits/corrections and moderation rules only if approved.

Critical distinction:

- A label such as “All staff” or “Grade 8-A” is not access control. The server must enforce who can retrieve and read the announcement.
- The current prototype does not send real messages to families or external services. Do not represent an in-app announcement as an SMS, email, push, or parent notification.
- External delivery (email/SMS/push/parent messaging) is a later feature requiring a confirmed channel, recipient verification, consent/policy review, delivery status, and error handling.
- Avoid placing sensitive student details inside broad announcements.

## 5.9 Reports

Potential reports:

- Attendance summaries by school year, date/period, grade level, section, and approved category.
- Academic assessment/activity summaries by subject and grading period.
- Early-warning review counts/statuses and trend summaries.
- Intervention status and follow-up summaries.
- Student roster/enrollment summaries.
- School-approved population reports by grade/section/track.
- A “top students” or ranking report only if the deployment institution explicitly confirms criteria and authorized audience; do not invent an honors or ranking formula.

Requirements:

- All report queries must obey the signed-in user's permissions.
- Provide filters, pagination, clear totals, and drill-down to an authorized detail record.
- Make it clear which period and filters were used.
- Export should be staged: printable report and CSV first; other formats only when needed.
- Restrict and log sensitive exports. Do not let reports become a way to bypass RLS.
- Do not label a sample report as an official school report.

## 5.10 Settings and Administration

The current Settings navigation entry is a placeholder. Do not build an enormous settings panel before the core data model is stable.

Later approved settings may include:

- School year, grade/section/subject structure.
- User accounts, invitations, roles, and assignments.
- Approved attendance/assessment/warning configuration.
- Session and device management.
- Local sync status, pending changes, and last successful sync.
- Backup/export settings and backup history.
- Audit log access for authorized administrators.
- Account security and personal preferences.

Never expose service credentials, environment secrets, or database administration controls in the ordinary frontend.

---

# 6. Offline behavior, shared devices, and synchronization

The system must support both personal and shared devices. Offline operation must be useful, but do not promise perfect security or instant revocation while a device is disconnected.

## PWA app shell

- Add a correct Web App Manifest with application name, short name, icons, start URL, scope, display mode, theme colors, and appropriate metadata.
- Add and register a versioned Service Worker.
- Cache only static application-shell assets required to open the interface offline (HTML shell, CSS, JS bundles, approved icons/fonts if license and caching rules allow).
- Do not blindly cache authenticated API responses or sensitive student pages in Cache Storage.
- Include a visible, understandable online/offline state and an offline fallback when data cannot be loaded.
- Handle service-worker updates safely; do not leave users running incompatible old and new application code during a sync operation.
- Verify installation behavior on target platforms. Do not assume iOS and Android offer identical install prompts or background behavior.

## Local data

- Use IndexedDB for limited offline records, locally queued changes, and sync metadata.
- Keep only the minimum data required for the current user's approved offline work.
- Use a clear data partitioning strategy keyed by signed-in user/account and school/workspace. Do not let the next person using a shared browser see the previous person's cached data.
- Avoid storing passwords, refresh tokens, secret keys, or unnecessary sensitive data in local storage or IndexedDB.
- Browser storage can be cleared or evicted. Request persistent storage only where supported and permitted; do not guarantee that it will always be granted. Provide clear backup/sync status and recovery guidance.

## Automatic and manual sync

Implement both:

- Automatic sync attempts when the app starts, regains network connectivity, returns to the foreground, or has queued work and a valid session.
- A visible **Sync now** control for manual retry and user confidence.
- Show pending, syncing, succeeded, failed, and conflict states with plain-language explanations.
- Do not imply that “automatic sync” runs continuously when the app is closed, the browser has suspended it, or the device is offline. Background Sync can be an optional enhancement only after verifying platform support.

## Durable outbox and conflict handling

Design synchronization intentionally:

- Each local mutation must have a unique operation/idempotency ID.
- Keep an outbox of pending operations with owner, record type, local change time, base/server version, and sync status.
- Replaying the same operation must not create duplicate attendance, assessment, intervention, or announcement records.
- Use server-side validation and authorization again when syncing. Never trust the role, ownership, or data permissions stored in the client queue.
- Use optimistic concurrency/version checks for records that can be edited from multiple devices.
- Do not silently overwrite conflicting edits with last-write-wins when doing so could lose attendance, grade, or support history.
- Provide a conflict review/retry path for meaningful conflicts, and explain which version is saved.
- Define behavior for session expiry, user deactivation, revoked role/assignment, deleted records, and partially failed batches.
- Preserve an audit trail for accepted and rejected edits.
- Never mark a change as synchronized until the server confirms it.

## Shared-device protection

Because staff may share a computer or tablet:

- Require individual accounts; never have all teachers share one login.
- Provide an obvious lock/sign-out action and an inactivity lock where appropriate.
- Clear or securely partition user-specific local data when a user signs out or a different user signs in. Do not accidentally clear unsynced changes without warning; provide a safe sync/export/recovery path.
- Re-check the session before showing cached data and before syncing.
- Revalidate permissions online before a new record is downloaded and before each server operation.
- Use short-lived offline authorization/session leases where feasible and require re-authentication after the lease expires before opening protected offline content.
- Do not make confidential guidance records available offline by default. Start with the least-sensitive workflow (such as assigned attendance) and expand only after a threat review and school approval.
- Explain the limitation: an offline device cannot instantly receive an account revocation or permission change. Limit cached content and the offline time window to reduce this risk.
- Recommend separate operating-system/browser user profiles for truly shared computers where possible; application sign-out alone cannot protect data on a compromised or shared OS account from someone with local developer tools or device-level access.

Do not claim that client-side encryption alone makes shared-device offline records fully secure. Explain the threat model and what it does not protect against.

---

# 7. Google Drive backup strategy

Google Drive is a **secondary backup/export destination**, not the live database.

Requirements:

- Establish that the backup destination is owned/controlled by the school or an explicitly approved custodian, not an arbitrary staff member's personal account.
- Use a normal approved Drive folder or Shared Drive arrangement for centrally accessible backups. Do not assume the per-user `appDataFolder` is shareable; it is app-specific and cannot be shared with other users.
- Prefer a trusted server-side/managed function for scheduled backups and third-party secrets. Do not expose privileged Drive credentials or service keys in the browser.
- If Drive OAuth is implemented, validate state/CSRF, exchange codes and refresh tokens server-side, encrypt tokens with backend-only secrets, scope the connection to its workspace, and authorize connect/update/export/disconnect operations. Use minimum necessary Drive scopes.
- Verify current Google documentation for the selected My Drive or Shared Drive destination, supported account type, ownership, permissions, and scopes; do not assume every personal account can create or use a Shared Drive.
- Define backup format, encryption, retention, rotation, restore procedure, verification, error reporting, and responsible account owner with the deployment institution.
- Backups must include relevant database data and a separately planned attachment-file backup where needed; a database snapshot alone may not include stored file objects.
- Do not store a single unencrypted export containing all learner records in a public or broadly shared folder.
- Test restoration into a non-production environment using synthetic data before claiming the backup works.
- Treat every backup/restore/export as a privileged action and log it.

Implement Drive integration only after the workspace data ownership and authorization model can enforce workspace-scoped backup/export access.

---

# 8. Data model and backend design expectations

Before creating database migrations, prepare a proposed ERD and data dictionary. The schema below is a starting concept, not a mandatory list of exact table names. Adjust it based on the actual approved workflows and explain any additions/omissions.

Potential domains/entities:

- Global account/platform: `USER_PROFILE`, `PLATFORM_ROLE`,
  `PLATFORM_USER_ROLE`, `PLATFORM_REGISTRATION_INVITE`, and
  `WORKSPACE_CREATION_GRANT`.
- Workspace: `WORKSPACE`, `WORKSPACE_MEMBERSHIP`, `WORKSPACE_MEMBER_ROLE`,
  `WORKSPACE_INVITE`, `WORKSPACE_JOIN_REQUEST`, and workspace-scoped audit
  events.
- Workspace-owned student/class and monitoring records must carry or
  reference the correct workspace context.
- Grade levels, sections, subjects, and subject/section offerings.
- User profiles tied to authentication identities.
- Role assignments and role scopes.
- Staff assignments: teacher-to-subject/section, adviser-to-section, guidance caseload assignment.
- Learner/student basic profile.
- Enrollment history by school year, grade level, section, and approved track/strand where applicable.
- Guardian identity/link records only if parent access is approved.
- Attendance sessions and attendance entries.
- Approved absence reasons and supporting-document metadata.
- Assessment/activity definitions and student scores.
- Versioned warning rule definitions only after rule approval; warning instances/evidence/review state.
- General intervention/support case, authorized case participants, updates, follow-ups, and restricted attachment metadata.
- A separate restricted guidance-note domain if the deployment institution approves it.
- Announcements, intended audience/recipient scope, and read receipts.
- Audit events for important actions.
- Sync/version metadata where it belongs server-side.

Use composite foreign keys or equivalent constraints where required so child
records cannot reference a parent, learner, enrollment, assignment, or
offering from a different workspace. Workspace IDs supplied by the browser
are never authorization evidence. The first implementation workflow must
cover workspace setup, grade levels, sections, school-year configuration,
minimal student profiles, enrollment history, staff invitations, role
assignments, teaching/advisory assignments, and access verification.

Schema design rules:

- Normalize related entities; avoid copying student name, grade, section, and role text into every row when a foreign key and historical snapshot are more appropriate.
- Use stable UUIDs or equivalent unique identifiers for records; never rely on visible row order or array indexes.
- Add foreign keys, not-null/check/unique constraints, and indexes based on real query patterns.
- Include timestamps and created/updated-by identities where appropriate.
- Consider school-year and enrollment history when designing attendance and gradebook relationships.
- Prevent duplicate attendance entries for a learner/session and duplicate scores for a learner/assessment.
- Define delete/archive behavior. Prefer controlled archival or status changes for records that require history; never cascade-delete educational history casually.
- Separate sensitive guidance data from general student/teacher workflows at the schema and policy level, not only by a hidden tab.
- Design RLS and grants at the same time as table structure. Do not postpone authorization until after the tables are populated.
- Draft an explicit access-policy matrix for every entity and operation: SELECT, INSERT, UPDATE, DELETE, export, attachment read/write, and administrative action.
- Implement versioned migrations as part of an authorized backend scope. Design constraints, grants, RLS, and allow/deny tests together; do not expose tables without a reviewed policy. Keep deployment-specific business rules unresolved and disabled rather than treating documentation review as a blanket approval gate.

---

# 9. Current implementation status — verify against the repository

The repository is a Vite application using Vanilla JavaScript, HTML, and CSS. It currently has a production-login shell, separate browser-local Demo Portal, synthetic roster and monitoring modules, and versioned localStorage for selected records. Always inspect the working tree and relevant code before describing or changing behavior; this status is a summary, not a substitute for source verification.

The Supabase JavaScript client dependency and a public-client Auth integration exist in source. Password sign-in and recovery are implemented against that client when `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are configured. No project credentials are configured in the repository, so remote authentication is not verified. Production registration is blocked because trusted invitation validation is not implemented. Authenticated users are kept out of local demo learner records.

There is no complete application database schema, versioned database migration set, workspace RLS/grants foundation, trusted registration or workspace Edge Functions, or connected workspace backend. Workspace and demo accounts remain browser-local simulation. Student directory, attendance, academic, warning, intervention, report, and announcement functionality remains synthetic/local or session-only as documented in [README.md](README.md) and [REQUIREMENTS-RECONCILIATION.md](docs/REQUIREMENTS-RECONCILIATION.md).

Vercel/GitHub deployment, Supabase/Vercel project integration, Production/Preview environment separation, and PWA installation have not been configured or verified. The Vercel and Supabase roles and setup requirements below describe the approved target, not a deployment claim. There is no service worker, manifest, IndexedDB offline cache/outbox, or synchronization workflow yet.

The current navigation includes Overview, Students, Attendance, Academics, Early Warnings, Interventions, Announcements, Reports, and Settings. Preserve existing behavior when implementing connected equivalents, but do not expose local demo records to a future authenticated workspace account.

## Existing application views

- Overview
- Students
- Attendance
- Academics
- Early warnings
- Interventions
- Announcements
- Reports
- Settings (data-free technical status view)

## Current module behavior

### Overview

- Responsive dashboard with aggregate sample figures and an attendance chart.
- Period selector for today/week/month.
- Early-warning preview, intervention preview, announcements preview, and shortcut to attendance.
- Enrollment, attendance, and support summaries use current browser-local demo records; warning prompts remain synthetic.

### Student directory

- Search, grade/section filtering, add/edit, and class-structure flows use fictional records.
- Roster and class structure persist in this browser; this is not shared backend storage or an authorized real-data workflow.
- Section transfers change current membership without rewriting saved historical attendance or academic records.

### Attendance

- Section/date selection, synthetic roster status entry, filtering, validation, totals, local saved records, and local history are implemented.
- Current status categories and demographic terminology remain provisional. Filtering only affects visible rows; totals, mark-all, and save validation apply to the full section.
- There is no backend authorization, server persistence, or authorized cross-device attendance workflow.

### Academics

- Section/subject selection, synthetic activities, score validation/search, percentage summary, and browser-local activity/score persistence are implemented.
- The displayed average is not an official grade/GPA formula. There is no backend persistence or authorization.

### Early warnings

- Four synthetic warning prompts.
- Categories include Attendance, Academic, and Follow-up.
- Category/status filtering, learner/topic search, review acknowledgement, counts, and shortcut into intervention creation.
- Priority labels are illustrative; there is no approved threshold or automatic student classification.

### Interventions

- Synthetic support plans and their update history persist in browser-local storage. Status and due-date summaries use those records.
- There is no backend persistence, access control, or external messaging.

### Announcements

- Staff-workspace announcement board.
- Title, message, all-staff or grade/section audience label, in-session read/unread state, and unread count.
- Audience labels do not enforce access. No real family or external messages are sent.

### Reports

- Preview and browser print for browser-local attendance, activity scores,
  intervention statuses, and synthetic roster summary.
- No official grade calculations, warning rules, backend-persisted reports,
  or server-enforced report permissions.

### Login and Settings

- Production password sign-in and recovery use Supabase Auth when public project configuration is present; no credentials are configured in this repository.
- Authenticated accounts are not connected to workspace membership or learner records. Registration and account administration are not enabled.
- Demo sign-in, registration, workspace switching, and role navigation are local simulations. Settings does not provide operational administration.

## Existing documentation

- `README.md` documents the application as a fictitious-data mock/presentation prototype and lists current behaviors and limitations.
- `docs/ACCESS-CONTROL-MATRIX.md` contains a provisional role matrix for Teacher, Adviser, Guidance Counselor, Parent/guardian, and designated system administrator.
- `docs/DECISIONS.md` records development decisions chronologically, including the initial empty-workspace state, fictitious-data restriction, individual prototype modules, and their limitations.
- `docs/REQUIREMENTS-RECONCILIATION.md` lists proposed requirements, approval status, privacy notes, sources, and open questions.
- `.github/copilot-instructions.md` contains the short repository-wide conduct rules and instruction priority. This master document remains the architecture reference.

Preserve useful content in all of these files. Update documentation when implementation or a decision changes, but do not silently rewrite the historical decision log as though prior stages never happened.

## Verification state

The application has previously passed a Vite production build and targeted
JavaScript/browser checks. Those results are not a substitute for rerunning
checks on the current diff. No live Supabase, Vercel deployment, workspace RLS,
or PWA acceptance test has been verified.

## Other recommended audit targets

1. Keep changes in the existing modular Vite/Vanilla JS architecture unless a concrete requirement supports a change.
2. Maintain responsive, accessible workflows and safe DOM construction for user-entered text.
3. Add pagination or server-side queries as real datasets grow.
4. Test connected user flows and data authorization, not only page appearance.

---

# 10. UX, responsive layout, and accessibility requirements

The app must be practical for busy teachers who may have limited time to learn a new system.

- Use school-friendly, plain-language labels. Avoid excessive technical jargon in the interface.
- Keep common tasks short and obvious. Attendance should not require navigating through several unrelated settings screens.
- Prefer sensible defaults, clear validation, and helpful empty/error/success states.
- Do not use AI-sounding generic messages. Use natural, concise interface copy that tells the user what happened and what they should do next.
- Avoid unnecessary “prototype,” “demo,” or “sample” labels throughout the presentation UI if the user has chosen a clean presentation interface; however, keep the synthetic-data and non-operational status explicit in project documentation and developer-facing notes. Never misrepresent the system as approved or live.
- Preserve the current calm blue/light-blue visual direction and readability improvements unless a reasoned design review recommends a change.
- Maintain readable typography on laptop and phone. Do not shrink all text to fit more columns.
- **Desktop:** support a persistent sidebar, clear dashboard cards, and data tables where appropriate.
- **Tablet:** use an intermediate layout and touch-friendly controls.
- **Phone:** adapt important screens into compact cards, stacked fields, touch-friendly action areas, and simple navigation. Reconsider table workflows rather than simply forcing a wide desktop table into a narrow viewport.
- Use a practical touch target size (aim for approximately 44 CSS pixels where appropriate), clear focus indicators, accessible labels, keyboard navigation, proper dialog semantics, and sufficient contrast.
- Use `prefers-reduced-motion` and avoid animations that obscure important status changes.
- Ensure dialogs fit the visible viewport when the on-screen keyboard opens on mobile.
- Test at narrow widths, landscape/portrait, tablet, and desktop breakpoints.
- Add pagination, filtering, and drill-down navigation so the application remains usable as the data grows.

---

# 11. Security and reliability requirements

Treat student information as sensitive. Security must be part of the architecture, not a final polish task.

## Authentication and sessions

- Use a supported authentication provider rather than a handcrafted password system.
- Support invitation/admin-provisioned accounts unless the school approves another method.
- Define session expiry, lock, sign-out, account deactivation, password recovery, and device loss behavior.
- Do not place privileged secret keys in frontend files, public repositories, build output, or browser storage.

## Authorization

- RLS and appropriate database grants on every exposed table.
- Private storage buckets with object access rules.
- Define policies for SELECT, INSERT, UPDATE, and DELETE separately and deny by default.
- For any `SECURITY DEFINER` helper, set a safe `search_path`, limit execution grants, and ensure the function only returns the current caller's authorized workspace/scope.
- Include workspace context in tenant-safe constraints and relevant child relationships; prevent cross-workspace foreign-key references.
- Test permitted and forbidden reads/writes for each role and assignment.
- Ensure API functions re-check identity and authorization.
- Never rely solely on hidden controls, route guards, or JavaScript role strings.

## Data integrity

- Use database constraints and transactions for critical workflows.
- Prevent duplicate records and invalid foreign keys.
- Validate all client input again on the server.
- Record meaningful changes and corrections.
- Use safe migrations with a rollback/recovery plan.

## Files

- Validate file type, size, and ownership.
- Store documents in private object storage, not a public bucket.
- Apply authorization on every read/download.
- Avoid leaking student names or sensitive information in filenames, public URLs, or logs.
- Plan malware scanning or safe file handling appropriate to the chosen storage/provider before real document upload is enabled.

## Reliability

- Provide useful error states for network failure, expired session, denied access, validation failure, sync conflict, storage quota, and backup failure.
- Do not swallow errors or show success before the server confirms the operation.
- Use idempotency for retryable sync operations.
- Add automated tests for important calculations and access rules.
- Maintain a backup and restore plan before real-data use.

---

# 12. Connected implementation direction

The target is the complete connected system described in this blueprint. The user-authorized task determines the implementation scope; work may be organized internally into stages, but do not require a separate prompt or approval for each stage. Complete connected dependencies, test, fix, regress, and document them in the same run. If a genuine external service setup or unresolved deployment decision blocks only part of the task, complete the independent work and report the exact blocker without presenting the blocked behavior as operational.

Use this dependency order to keep data and security boundaries sound:

1. Establish and verify the Supabase project integration and safe environment separation without exposing secrets.
2. Complete platform/account authentication, trusted registration-invitation validation, profiles, workspace-creation grants, workspace membership, role assignments, invitations, and workspace selection.
3. Implement the workspace-scoped schema, constraints, grants, RLS policies, trusted Edge Functions, and allow/deny tests together.
4. Implement workspace configuration, approved student/class records, and historical enrollment handling.
5. Deliver attendance as the first complete student-monitoring workflow: authenticated identity → active workspace membership → authorized role and assignment → roster → validated session/entries → durable reload → attributable corrections and direct-API denial tests.
6. Connect academic records, warning review, interventions, announcements, and reports one by one to their approved data models and policies. Keep any module not backend-enabled unavailable to real workspace accounts; do not leak local demo records into those accounts.
7. Implement private Storage only for approved file workflows. Treat Google Drive as an optional secondary backup/export, with a tested restore process.
8. Add PWA installation and offline functionality only with account/workspace-partitioned IndexedDB, explicit sync states, idempotent operations, server-side reauthorization, conflict handling, shared-device protection, and tested recovery.
9. Run full functional, security, accessibility, responsive, performance, migration, and recovery verification appropriate to the completed system.

These are connected implementation dependencies, not milestone approval gates. Preserve the role, privacy, historical data, and deployment-review requirements elsewhere in this blueprint.

---

# 13. Testing and acceptance checklist

For each module, create tests appropriate to the layer. Do not declare completion from a successful syntax check alone.

## Account, workspace, and deployment foundation

- Registration invitation tests cover valid, invalid, expired, revoked,
  email-restricted, exhausted, duplicate-account, rate-limited, and concurrent
  redemption. Direct public Auth signup cannot bypass trusted validation.
- Verify email confirmation, password establishment/recovery, sign-in,
  sign-out, expired sessions, and optional profile completion against the
  configured Auth environment; do not report those remote checks when no
  project is configured.
- Workspace creation without a grant is denied; valid grants are bounded and
  atomically consumed with exactly one workspace and its first Owner.
- Workspace invites are scoped, bounded, and cannot grant Owner or Platform
  Operator. Pending join requests grant no access; only an authorized member
  can approve/reject or assign permitted roles.
- Ownership transfer is explicit, audited, and cannot leave a workspace
  without an active Owner. Revoked membership immediately loses online access.
- Use at least two synthetic workspaces and verify SELECT, INSERT, UPDATE, and
  DELETE isolation using direct database/API calls, including forged
  workspace, membership, role, learner, enrollment, and parent IDs.
- Confirm Workspace Owner/Admin access is limited to their workspace and does
  not automatically reveal confidential guidance records. Platform Operator
  access does not imply learner-record access.
- Test that demo records remain in the isolated demo environment and are
  never implicitly shown to ordinary authenticated accounts or copied into a
  newly created workspace.
- Deployment checks distinguish provider integration availability,
  configuration, application connection/testing, and deployed verification.
  Verify Preview uses an isolated Supabase branch/project and no privileged
  Supabase variable enters browser code or build output.
- If Drive backup is implemented, verify OAuth state, workspace-scoped
  authorization, server-only token handling, disconnect, backup restore, and
  that Drive is not treated as the transactional database.

## Functional

- Main navigation and active screen state.
- Search and filters.
- Add/edit/cancel/save forms.
- Pagination and drill-down.
- Validation and error states.
- Empty and large data states.
- Dialog open/close, Escape, focus handling, and mobile keyboard behavior.
- Attendance totals, mark-all scope, and save validation.
- Score maximum checks and incomplete/missing score handling.
- Warning review state and intervention links.
- Announcement audience/read-state rules.
- Report filter correctness and permissions.

## Data and authorization

- Persistence after refresh.
- Consistent records across authorized devices.
- Role and assignment scoping.
- Direct API attempts to access unauthorized records are denied.
- Row-level policies and grants are both tested.
- Attachments are private and permission-checked.
- User A cannot read User B's local cache on a shared browser after logout/account switch.
- Parent account, if ever enabled, cannot access other children or staff-only data.
- Sensitive guidance data remains invisible to non-authorized roles.

## Offline and sync

- App shell opens offline after a successful online load.
- Offline state is visible.
- Authorized offline changes are queued durably.
- Reconnecting syncs once and does not duplicate records.
- Manual retry works.
- Sync failure does not falsely mark data as saved.
- Conflicts are reported and resolved without silent data loss.
- Expired/deactivated users cannot sync unauthorized changes.
- Browser storage cleared/evicted scenarios are handled honestly.

## Device/browser UX

- Android Chrome.
- iOS Safari/PWA mode where available.
- Tablet widths.
- Desktop Chrome/Edge/Firefox as appropriate.
- Narrow screen, landscape, portrait, and keyboard-open layouts.
- Keyboard-only navigation and visible focus.
- Reduced motion and contrast checks.

## Security and reliability

- No service-role key or secret in client source/build output.
- No real student information in test fixtures.
- No public student-file bucket/object.
- No unvalidated HTML injection from user content.
- Correct session expiry/logout behavior.
- Backups can be restored in a test environment.
- Important actions have audit records.

Report exactly which tests ran, on what environment, and what failed or was not tested.

---

# 14. Documentation that must remain synchronized with the code

Maintain and update these project documents as the system evolves:

- `README.md`: project overview, prerequisites, run/build/test commands, actual implemented modules, setup instructions, architecture overview, and known limitations.
- `.github/copilot-instructions.md`: durable agent rules and project guardrails. Keep this concise enough to be useful; point to the master architecture document rather than duplicating every detail.
- `docs/DECISIONS.md`: append dated decisions with rationale, evidence, consequences, and revisit conditions. Preserve historical entries; do not rewrite the past.
- `docs/REQUIREMENTS-RECONCILIATION.md`: keep a live table of requirement, source, school approval, privacy/policy notes, decision, verification status, and open question.
- `docs/ACCESS-CONTROL-MATRIX.md`: update proposed and approved permissions separately. Do not label a proposal approved unless the developer provides evidence of approval.
- Maintain the existing ERD and data dictionary as working architecture references; update them with implemented schema changes and keep unresolved deployment policy clearly provisional.
- Add tests and a test/run guide as implementation begins.

Never let documentation say authentication, persistence, role enforcement, external messages, backup, offline sync, or production deployment exists before it actually does.

---

# 15. Required source verification before policy/provider-specific implementation

Do not rely solely on remembered or generated facts about changing technical documentation or school rules. Check official primary sources before implementation and record the date and exact source in project documentation.

Useful starting references (verify that the pages and APIs are current before use):

### Vercel and Supabase integration

- Supabase + Vercel: https://supabase.com/docs/guides/integrations/vercel
- Supabase Vercel Preview branches: https://supabase.com/docs/guides/integrations/vercel-preview-branches
- Supabase Vercel Marketplace: https://supabase.com/docs/guides/integrations/vercel-marketplace
- Vite on Vercel: https://vercel.com/docs/frameworks/frontend/vite
- Vercel Git integration: https://vercel.com/docs/git

The integration can supply both public and privileged variables. Inspect and
map only the Vite public Supabase URL and publishable key to `VITE_` names.
Keep secret/service-role, JWT, database-password, and other privileged values
server-side. Keep Preview isolated from Production.

### Supabase

- Database overview: https://supabase.com/docs/guides/database/overview
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Secure data: https://supabase.com/docs/guides/database/secure-data
- Product security: https://supabase.com/docs/guides/security/product-security
- Edge Functions authentication: https://supabase.com/docs/guides/functions/auth

Important: RLS policies and PostgreSQL grants work together. Enable RLS for exposed tables, give only necessary grants, test both allowed and denied actions, and keep the `service_role`/secret key server-side. Storage object permissions also require their own policy review; table RLS does not automatically secure file objects.

### PWA / browser platform

- Progressive Web Apps: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- Service Worker API: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Storage quotas and eviction: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria

Important: service workers and background work are subject to browser/platform behavior. Design a reliable foreground/online/manual sync path rather than depending entirely on background sync.

### Google Drive

- App-specific data folder: https://developers.google.com/workspace/drive/api/guides/appdata
- Drive files and folders: https://developers.google.com/workspace/drive/api/guides/about-files

Important: `appDataFolder` is private to the individual app/user and cannot be shared. It is not the destination for one central the deployment institution backup shared across staff. Verify Shared Drive permissions, ownership, OAuth scopes, and approved account arrangements before implementation.

### School policies and privacy

- Identify the deployment jurisdiction and review complete, readable official education regulations that apply before implementing grading, attendance, student-support, or warning rules.
- Review the applicable official privacy laws and current privacy-regulator guidance with authorized institutional reviewers before any real student data is entered.
- Store source links, date reviewed, what the source actually establishes, and what remains uncertain. Do not infer school procedure from an issuance title or an unreadable PDF.

---

# 16. Strict do-not-do list

Do not:

- Rebuild the whole application in React or another framework just because it is fashionable.
- Replace working code with an untested rewrite.
- Implement every role and module before the permission model is understood.
- Create a fake login form that only changes a local `role` variable.
- Treat frontend navigation visibility as authorization.
- Put database service keys, Drive secrets, OAuth refresh tokens, or other privileged credentials in client code.
- Use Google Drive as the real-time transactional database.
- Assume `appDataFolder` is shareable between staff.
- Claim that browser offline storage is permanent or fully secure on shared devices.
- Claim instant permission revocation while a device is disconnected.
- Expose confidential guidance records to regular teachers, school administrators, or parents by default.
- Add sensitive or stigmatizing student profile fields without explicit approved necessity.
- Invent deployment-specific student fields, warning thresholds, grading formulas, attendance rules, parent communications, or retention policy.
- Invent an XML import/export format without a schema approved for the deployment.
- Generate fake research results, fake survey responses, or fake acceptance/evaluation findings.
- Use real student data in tests or screenshots.
- Add external notification channels before recipient and procedure approval.
- Mark a task complete because code was generated. Run the tests and show the result.
- Ask the user to re-explain information already in this prompt or repository.

---

# 17. Response to an implementation request

When the user provides an implementation task, inspect the relevant repository and requirements, then proceed with the authorized scope. Do not return only an audit or plan, and do not ask for approval to begin work already authorized by the user. Internally organize complex work as needed, but carry its connected implementation, tests, fixes, verification, and documentation through the same run. Ask only for a genuine blocker, unresolved requirement, destructive operation, or external authorization.

---

# 18. Completion standard for the overall project

The project is not complete merely because it has many screens. The target is a system whose core workflows are coherent and demonstrable, whose data model matches its purpose, whose users see only what they are authorized to see, whose records persist correctly, whose offline behavior is explicit and recoverable, and whose limitations are honestly documented.

For the capstone demonstration, prioritize complete and reliable connected workflows over superficial screens. Preserve the project's approved purpose, synthetic-data boundary, and the developer's ability to explain and defend major decisions. Report the exact functionality verified and the remaining work; do not imply that one finished task completes the whole target system.
