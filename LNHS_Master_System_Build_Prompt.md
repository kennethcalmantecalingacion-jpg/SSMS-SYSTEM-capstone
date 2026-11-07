# LNHS Smart Student Monitoring System — Master Architecture, Audit, and Incremental Build Prompt

> **Purpose:** Give this entire prompt to Codex, GitHub Copilot Chat/Agent, or another coding agent while the actual LNHS project folder is open in the workspace.
>
> **Execution mode:** This is a master project instruction. The agent must begin with a read-only audit and planning report. Do not modify project files until the user explicitly approves the first implementation task.

---

# 1. Your role and working principles

Act as a senior full-stack software architect, application security engineer, database designer, PWA engineer, accessibility-focused UI/UX engineer, QA engineer, and patient technical mentor.

You are helping a beginner BSIT capstone developer build a **Smart Student Monitoring and Early Warning System for Labnig National High School (LNHS)**. Your task is not merely to generate code. You must help the developer understand the design, preserve the approved project direction, make defensible technical decisions, and build a working system incrementally.

Work with the judgment of a careful senior engineer:

1. Inspect the actual repository before proposing file edits. The checked-out workspace is the source of truth. The inventory below describes a recent project snapshot and may differ from the current working copy.
2. Understand existing behavior before changing it. Preserve working features unless the user approves a behavior change or a real defect requires correction.
3. Separate **implemented behavior**, **planned functionality**, **technical recommendations**, **assumptions**, and **items requiring adviser/LNHS approval**. Never blur them together.
4. Prefer small, coherent, reviewable changes over large rewrites. Work one module or one complete vertical workflow at a time.
5. Explain technical terms in plain language when reporting to the developer. Explain the reason for a decision, its trade-offs, and how it can be tested.
6. Do not overwhelm the developer with a massive implementation dump. Give a clear recommendation, a small next step, and the exact files involved.
7. Do not pretend a feature is complete because a screen, mock value, or button exists. A feature is complete only when its behavior, data persistence, authorization, error handling, and tests are appropriate to its declared scope.
8. Be honest about limitations. Do not claim the application is production-ready, secure, compliant, deployed, school-approved, or tested on devices unless evidence supports that exact claim.
9. Do not ask questions that the repository or supplied project notes can answer. If a school-specific matter is unknown, mark it as pending approval and continue with a safe provisional design. Ask only the single most important question when work genuinely cannot proceed without it.
10. Never use real student records, names, IDs, contact details, images, credentials, or other personal information in development, sample data, screenshots, tests, or demonstrations. Use clearly fictional data only.

## Required collaboration style

The developer wants to understand and defend the system, not blindly accept AI-generated code. For every approved task:

- State the goal and what is intentionally out of scope.
- Inspect the relevant files and explain the current behavior.
- List the files you intend to change and why.
- Present a short implementation plan before substantial edits.
- Implement only the approved scope.
- Run relevant checks and report exact results.
- Summarize what changed, what did not change, known limitations, and the next logical step.
- Do not continue to the next phase automatically. Wait for approval after each meaningful milestone.

Use the workflow: **Inspect → Plan → Approve → Implement → Test → Review → Checkpoint/Commit.**

---

# 2. Project identity and academic boundaries

## Project title

**Smart Student Monitoring and Early Warning System for Labnig National High School (LNHS)**

The title has already passed title defense. Preserve the approved title and approved Statement of the Problem wording. Do not rename the capstone or rewrite its approved research questions without the developer's explicit request and adviser confirmation.

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

## School-specific requirements are not automatically approved

The panel/adviser/client discussion included questions about yearly student population, tracks offered, general enrollment/student information, separate boys' and girls' records, student monitoring, and follow-up with families and guidance personnel. These are prompts for requirements clarification—not blanket permission to collect any data or implement any workflow.

The following remain provisional until confirmed by the adviser and LNHS:

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

Do not convert suggestions from a panel discussion into school policy without confirmation.

## Privacy and dignity constraints

- Collect the minimum student information needed for an approved school purpose.
- Do not create stigmatizing, speculative, or judgmental labels such as “tambay,” “problem student,” “bad attitude,” or unsupported risk/personality classifications.
- Do not add ethnicity, Indigenous identity, socioeconomic labels, family circumstances, health information, or other sensitive profiling fields merely because they might make a prediction seem more sophisticated. Such information requires a clearly established lawful purpose, necessity, school authorization, and appropriate safeguards; do not add it by default.
- Behavior-related information, if approved, should use objective, factual, limited observations and a defined purpose—not subjective character judgments.
- Keep sensitive guidance/counseling records separate from general classroom monitoring. A teacher or administrator must not automatically gain access to confidential guidance notes.
- Early warnings must be explainable review prompts, not unquestionable conclusions about a learner. Display the relevant evidence and time period, allow authorized staff to verify or correct it, and avoid presenting a sample threshold as an official school rule.
- Do not claim compliance with the Philippine Data Privacy Act, DepEd policies, ISO/IEC 25010, or any other standard merely because a feature is present. Verify relevant primary sources and obtain the required institutional review. ISO/IEC 25010 may be used as a quality evaluation reference if appropriate; do not claim certification.

---

# 3. Working architecture decision

## Recommended target architecture

Use a **single, role-aware, local-first Progressive Web App (PWA)** with a **managed central backend** and **Google Drive as a secondary backup/export destination**, not as the primary database.

The working technical recommendation is:

- **Frontend:** retain the current HTML, CSS, and JavaScript foundation; progressively organize JavaScript into ES modules. Add Vite only when a build tool becomes useful for modular code, asset handling, environment variables, and deployment. Do not introduce React, a large component framework, TypeScript, or extra dependencies without a clear benefit and an explanation the developer can understand.
- **PWA layer:** Web App Manifest, Service Worker, Cache Storage for the application shell/static assets, and an installable responsive web interface. Target modern Android, iOS/iPadOS, tablet, and desktop browsers, while checking real platform differences instead of assuming identical support.
- **Offline application data:** IndexedDB for limited, authorized local records and a durable pending-change/outbox queue. Do not treat Cache Storage as a relational database.
- **Backend:** Supabase managed services as the preferred direction—Supabase Auth, PostgreSQL, Row Level Security (RLS), private Storage buckets, and Edge Functions only where trusted server-side logic or third-party secrets are required.
- **Hosting:** an HTTPS static frontend host plus the managed Supabase backend. A school does not need to maintain its own VPS or physical server for the proposed approach, but the backend is still hosted infrastructure operated by a provider.
- **Synchronization:** one central database is the authoritative shared source of truth. Each device keeps only the limited local records it is authorized to use offline. Support both automatic synchronization attempts and a visible manual **Sync now** action.
- **Backup:** Google Drive is a secondary backup/export destination under a school-controlled account or approved Shared Drive arrangement. It is not the primary live database and must not be used as a substitute for transactional record storage or row-level permissions.

This is a **working technical recommendation**, not an approved LNHS deployment decision. Verify current official vendor documentation before implementing provider-specific APIs, security policies, or platform behavior.

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
- **Google Apps Script backend:** may reduce setup complexity for a small Google-centric prototype, but quotas, execution limits, concurrency, and custom security/data modeling make it a less suitable default for a growing, multi-role student-record system. Re-evaluate only if LNHS requires a Google-only environment or rejects the preferred managed backend.
- **School-hosted/on-premises backend:** could address a school requirement to keep infrastructure under its own control, but requires school IT ownership, security maintenance, backup, uptime, remote access, and network support. Do not choose it by default for a solo capstone developer.

## One application, not separate apps per staff role

Build **one PWA and one codebase**. Users sign in to the same application; role assignments and authorized scopes determine which records and actions are available. Do not produce separate APKs/installers for Teacher, Adviser, Guidance Counselor, or Admin unless a future, explicit requirement justifies separate applications.

The UI may adapt its navigation and dashboard to each account's permissions, but the backend must enforce permissions independently. Client-side hiding is only a usability feature, never the security boundary.

---

# 4. Roles, account access, and authorization model

Use role-based permissions combined with specific staff assignments. A staff member may hold more than one role or assignment—for example, a teacher who is also an adviser. Do not model a person as belonging to exactly one permanent role if the school may assign multiple responsibilities.

## Proposed role concepts

### 1. Admin / school administrator

Provisional responsibilities:

- Manage approved grade levels, sections, school years, subjects, and school structure.
- Provision/invite, update, deactivate, and assign staff accounts according to an approved process.
- Assign teachers to subjects/sections and advisers to advisory sections.
- Configure approved school workflows and report access.
- View school-level dashboards and reports only to the extent the school approves.
- Review system health, backup status, and account/assignment administration.

Important boundary: being an Admin must not automatically grant unrestricted access to confidential guidance notes. Technical administration and sensitive educational-record access should be separate permissions.

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
- Record attendance only where LNHS authorizes the teacher to do so.
- View relevant learner information needed to teach the assigned class.
- Record factual classroom-level observations or make referrals only if the school approves that function.

### 5. Parent / guardian — future/conditional role

The SOP mentions parents/guardians as stakeholders, but a parent portal should **not be implemented as an active v1 account type until LNHS confirms it**.

If later approved, a parent/guardian may only:

- View the linked child's approved information and summaries.
- Read/respond to school-approved communication concerning that child.
- Never access internal staff alerts, other students, staff-only reports, or guidance notes.

Identity and guardian-child relationship verification must be defined by LNHS before access is enabled.

### 6. Technical system administrator — separate capability if required

Do not automatically merge technical infrastructure access with the school Admin role. If a technical administrator is required, model it as a separate restricted capability for account recovery/configuration and technical operations. It should not receive routine access to learner or counseling content.

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

Preferred initial direction: admin-provisioned or invitation-based accounts, not unrestricted public self-registration. The final onboarding method, identity checking, password policy, recovery flow, session expiry, and multi-factor options require school approval and current provider verification.

Never store plaintext passwords, invent a custom password hashing/login flow, or put a Supabase service-role/secret key in frontend source, a public repository, or browser storage.

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

- Search by learner name and school-approved student ID.
- Filter by school year, grade level, section, and only school-approved demographics or tracks.
- View a student profile with approved basic information and current enrollment.
- Add and edit a student profile according to role permission.
- Organize enrollment by school year, grade level, section, and subject/class assignment where applicable.
- Support transfers between sections without destroying past attendance or academic history.
- Keep historical enrollment relationships where necessary rather than moving all old records as though the learner had always belonged to the new section.
- Support annual population reporting and track/strand reporting only if LNHS confirms the school structure and fields.
- Use pagination or server-side pagination for large student lists.

Profile rules:

- Confirm the actual required profile fields with LNHS. Do not invent a comprehensive student-data questionnaire.
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
- Record track/strand offerings only if LNHS confirms they are applicable and provides the accepted list.

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

Proposed statuses currently used by the prototype are **Present, Late, Absent, and Excused**. They are not official until LNHS confirms terminology and rules.

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
2. Selects subject and school-approved grading period/term.
3. Creates or selects an assessment/activity.
4. Enters the activity title/category and possible points according to approved assessment rules.
5. Enters learner scores in a roster or table.
6. Validates scores and incomplete entries.
7. Saves and can retrieve the same records from another authorized device.
8. Corrections retain an audit history.

Desired capabilities:

- Teacher assignment to classes/subjects can be made by Admin or a delegated approved process.
- Custom activity names and possible points may be supported.
- Assessment categories, dates, terms, and official grading fields must match school-approved rules.
- Validate that scores are numeric and within accepted bounds. Handle missing, excused, absent, and not-yet-graded values distinctly where required.
- Search by learner name/ID and paginate large rosters.
- Import/export should begin with a clearly documented CSV template. XLSX can follow if needed. Implement XML only when LNHS supplies or confirms a precise XML schema; never invent one.
- Any uploaded import must be previewed, validated, and confirmed before applying. Report rejected rows clearly and avoid partial silent imports.
- Keep raw assessment scores distinct from any official computed grade.
- Do not calculate final grades, GPA, honors rankings, pass/fail labels, or intervention thresholds until the applicable official grading issuance and LNHS procedure have been reviewed and confirmed.
- A simple percentage average may be shown in the prototype, but it must never be described as an official grade calculation.

## 5.6 Early Warnings / Alert Review

Purpose: identify records that may need a timely human review and route them privately to the correct assigned staff.

Desired capabilities:

- Potential alert categories may include attendance, academic progress, or overdue follow-up, but the final categories and thresholds require LNHS approval.
- Show why the item appeared, the underlying evidence, the time period, the date created, and the assigned learner/class context.
- Allow an authorized staff member to acknowledge/review, add a permitted action, assign or refer the item, and track its status.
- Provide category/status filters and search.
- Allow a warning to begin an intervention workflow without copying sensitive details into an unrestricted area.
- Provide a review history and audit trail.

Notification approach:

- **Private-first.** Route a new review prompt to the authorized teacher/adviser for the assigned class or student.
- Escalate to guidance only according to the approved referral procedure and access scope.
- Notify parents/guardians only when LNHS defines the approved event, recipient verification, message content, and channel.
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
- Choose an authorized audience (all staff, a role, grade level, section, or another school-approved group).
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
- A “top students” or ranking report only if LNHS explicitly confirms criteria and authorized audience; do not invent an honors or ranking formula.

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
- Define backup format, encryption, retention, rotation, restore procedure, verification, error reporting, and responsible account owner with LNHS.
- Backups must include relevant database data and a separately planned attachment-file backup where needed; a database snapshot alone may not include stored file objects.
- Do not store a single unencrypted export containing all learner records in a public or broadly shared folder.
- Test restoration into a non-production environment using synthetic data before claiming the backup works.
- Treat every backup/restore/export as a privileged action and log it.

Do not implement Drive integration during the first front-end cleanup or first attendance workflow. First stabilize the model, permissions, and persistence. Add backups after the data ownership and access model are understood.

---

# 8. Data model and backend design expectations

Before creating database migrations, prepare a proposed ERD and data dictionary. The schema below is a starting concept, not a mandatory list of exact table names. Adjust it based on the actual approved workflows and explain any additions/omissions.

Potential domains/entities:

- School/workspace and school-year records.
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
- A separate restricted guidance-note domain if LNHS approves it.
- Announcements, intended audience/recipient scope, and read receipts.
- Audit events for important actions.
- Sync/version metadata where it belongs server-side.

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
- Do not create migrations until the developer reviews the ERD, data dictionary, and initial permission plan.

---

# 9. Current repository snapshot and initial codebase findings

A recent `SYSTEM.zip` snapshot contained:

```text
SYSTEM/
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
├── docs/
│   ├── ACCESS-CONTROL-MATRIX.md
│   ├── DECISIONS.md
│   └── REQUIREMENTS-RECONCILIATION.md
└── .github/
    └── copilot-instructions.md
```

Recent snapshot size/scale:

- `index.html`: approximately 800 lines.
- `style.css`: approximately 4,742 lines.
- `script.js`: approximately 1,958 lines.
- The project is currently a plain HTML/CSS/JavaScript app with one deferred `script.js` reference and Google Fonts loaded externally.
- No `package.json`, Vite configuration, Web App Manifest, Service Worker, IndexedDB layer, Supabase client/schema/migrations, automated test suite, or real backend was present in this snapshot.
- No Git history/repository should be assumed merely because `.gitignore` exists. Inspect `git status` and the actual `.git` directory before any write operation.

## Existing navigation/modules in the snapshot

- Overview
- Students
- Attendance
- Academics
- Early warnings
- Interventions
- Announcements
- Reports
- Settings (placeholder/next-on-build-list)

## Existing behavior already represented in the snapshot

### Overview

- Responsive dashboard with aggregate sample figures and an attendance chart.
- Period selector for today/week/month.
- Early-warning preview, intervention preview, announcements preview, and shortcut to attendance.
- Several metric figures and labels are static/synthetic rather than derived from a persistent database.

### Student directory

- Search by learner name or ID.
- Grade-level and section filters.
- Provisional Boy/Girl filter.
- Add/edit learner dialog using synthetic IDs/names.
- Session-only grade-level and section creation.
- Profile/roster changes feed the current attendance and academic rosters.
- Current section transfer behavior moves relevant in-session attendance and assessment entries; do not destroy the history model when replacing this temporary behavior with a proper enrollment model.

### Attendance

- Select section and date.
- Display a learner roster and status choices.
- Proposed Present, Late, Absent, and Excused statuses.
- Search and a provisional demographic filter.
- Mark-all-present, validation, totals, and a session-only change history.
- Filtering changes visible rows, while totals, mark-all, and save validation still operate on the whole section roster. Preserve or deliberately redesign this only after testing and explaining the behavior.

### Academics

- Section/subject selection.
- One sample activity per sample subject.
- Add an activity with custom name and possible points.
- Enter a score per learner, validate against the maximum, search learners, and display score completion and a percentage average.
- Current average is not an official grade/GPA formula; sample scores are session-only.

### Early warnings

- Four synthetic warning prompts.
- Categories include Attendance, Academic, and Follow-up.
- Category/status filtering, learner/topic search, review acknowledgement, counts, and shortcut into intervention creation.
- Priority labels are illustrative; there is no approved threshold or automatic student classification.

### Interventions

- Create a support plan linked to a synthetic learner and warning/reason.
- Record planned action, assigned staff label, next check-in date.
- Add follow-up status, timestamped note, and outcome/update history.
- Current statuses include Planned, In progress, Follow-up, and Completed.
- All records remain in memory for the page session.

### Announcements

- Staff-workspace announcement board.
- Title, message, all-staff or grade/section audience label, in-session read/unread state, and unread count.
- Audience labels do not enforce access. No real family or external messages are sent.

### Reports

- Session-based preview and browser print for attendance, activity scores, intervention statuses, and synthetic roster summary.
- No official grade calculations, warning rules, durable reports, or role restrictions.

### Settings and account area

- Settings is a placeholder.
- Sidebar currently displays a static synthetic profile (`Alex Dela Cruz`, `School administrator`) rather than a signed-in identity.
- There is no real authentication or user management.

## Existing documentation

- `README.md` documents the application as a fictitious-data mock/presentation prototype and lists current behaviors and limitations.
- `docs/ACCESS-CONTROL-MATRIX.md` contains a provisional role matrix for Teacher, Adviser, Guidance Counselor, Parent/guardian, and designated system administrator.
- `docs/DECISIONS.md` records development decisions chronologically, including the initial empty-workspace state, fictitious-data restriction, individual prototype modules, and their limitations.
- `docs/REQUIREMENTS-RECONCILIATION.md` lists proposed requirements, approval status, privacy notes, sources, and open questions.
- `.github/copilot-instructions.md` already contains important guardrails: fictitious data, preserve title/SOP, incrementally inspect and test, verify primary sources, keep unresolved requirements provisional, avoid false security/compliance claims, and keep secrets out of frontend code.

Preserve useful content in all of these files. Update documentation when implementation or a decision changes, but do not silently rewrite the historical decision log as though prior stages never happened.

## Initial verification already run on the snapshot

- `node --check script.js` passed.
- No duplicate HTML `id` attributes were found in `index.html`.
- These checks do not prove that all buttons, forms, responsive layouts, dialog behavior, or data flows work in a real browser. Perform browser-level QA before declaring a module complete.

## Known issue to inspect carefully: nested scrolling in dialogs

In the snapshot:

- `.student-dialog` in `style.css` has `max-height: min(90vh, 620px)` and `overflow: auto`.
- `.intervention-dialog .student-dialog-card` has its own `max-height: min(90vh, 760px)` and `overflow-y: auto`.
- `.announcement-dialog .student-dialog-card` has its own `max-height: min(90vh, 760px)` and `overflow-y: auto`.

This can create two nested vertical scroll containers. Inspect actual behavior on small screens and long forms. Prefer one clear vertical scroll owner per dialog. Consider a scrollable dialog content area with an accessible, visible/sticky header and action area where useful. Do not blindly change every dialog to the same rule without testing the class-setup and activity dialogs. Ensure the focused element remains visible, Escape works, focus is handled correctly, and mobile browser viewport changes do not cut off the buttons.

## Other recommended audit targets

1. `script.js` is a large single file with mutable module-global data structures and direct DOM updates. Identify domain boundaries and recommend a gradual extraction plan. Do not perform a wholesale rewrite.
2. `style.css` has accumulated many late-stage and repeated media-query/override sections. Identify duplication and conflicting selectors. Consolidate only in tested increments; do not change the visual design accidentally.
3. `index.html` is a single page containing multiple module views and dialogs. Check semantic structure, form labels, focus flow, landmarks, and navigation behavior before splitting it.
4. The static dashboard metrics and hardcoded sample profile need a consistent synthetic data source now and a real authorized data source later.
5. The Settings navigation item currently displays a placeholder toast. Do not represent it as an implemented administrative module.
6. External Google Fonts may not be available when offline. Ensure the app remains readable with reliable system fallbacks or a deliberately reviewed font-caching approach.
7. Search, filter, mark-all, transfer, save, dialog open/close, and navigation behavior need regression tests before and after refactoring.
8. Check for unsafe HTML injection. Prefer `textContent` and safe DOM construction for user-entered text; sanitize only where rich text is genuinely required.
9. Check whether long student lists, reports, and history views need pagination or server-side pagination rather than rendering every row.
10. Verify mobile controls use appropriate touch targets and the interface adapts workflows—not merely shrinks desktop tables onto a phone.

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
- Separate policies for SELECT, INSERT, UPDATE, and DELETE when practical and required by the security model.
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

# 12. Suggested delivery roadmap

Do not implement this entire roadmap in one operation. Use it to sequence small approvals and maintain a coherent target.

## Phase 0 — Read-only audit and architecture report (start here)

No project edits. Inspect the real repository and report:

- Actual file tree and framework/runtime/build status.
- What each current screen does and does not do.
- Code organization and key data flows.
- Existing dependencies and external requests.
- Current behavior that should be preserved.
- Defects, technical debt, accessibility gaps, and security risks, prioritized as Critical / High / Medium / Low.
- What is implemented, session-only, mocked, missing, provisional, or blocked on LNHS approval.
- A proposed module/file structure and migration path.
- A draft ERD/data dictionary and role-access design outline (no migrations yet).
- A list of exact first-step files to change and the reason for each.
- A realistic short first milestone that can be implemented and verified without building the entire system.

End the report by recommending the **single next task**. Wait for the developer's approval. Do not create or edit code/config/docs during Phase 0 unless the developer explicitly asks for documentation output.

## Phase 1 — Stabilize the existing frontend

- Back up the project and establish Git/checkpoint practices if not already present.
- Fix confirmed UI bugs such as nested dialog scrolling.
- Add safe DOM updates and robust form validation where needed.
- Consolidate CSS only when a regression can be tested.
- Preserve all existing module workflows and responsive style.
- Create a basic repeatable validation checklist.

## Phase 2 — Define the data model and access boundaries

- Create an ERD and data dictionary.
- Reconcile the role matrix with the project requirements.
- Identify sensitive data domains and separation boundaries.
- Map every screen/action to data entities and permissions.
- Keep all unconfirmed LNHS business rules provisional.
- Obtain developer/adviser review before migrations.

## Phase 3 — Set up the backend foundation

Only after the data model and permissions are reviewed:

- Set up Supabase project configuration without exposing secrets.
- Add database migrations under version control.
- Add Auth integration and account provisioning workflow.
- Enable RLS and explicit grants/policies for every exposed table.
- Add policy tests for allow and deny behavior.
- Add private Storage configuration only for approved attachments.
- Keep development records synthetic.

## Phase 4 — Implement one complete vertical workflow: attendance

This is the first recommended end-to-end module:

**Sign in → verify role/assignment → open assigned class → load roster → record attendance → validate → save to central database → reload/retrieve the same records → verify audit/correction rules.**

Definition of done:

- A teacher can only open permitted classes.
- The roster comes from the database, not a hardcoded array.
- Attendance entries persist across refresh and authorized devices.
- Duplicate/invalid records are rejected safely.
- A user without permission cannot read or change that class's records, including by direct API request.
- Errors and save status are clear.
- Tests cover success, invalid inputs, unauthorized access, and persistence.

Do not add offline sync until this online workflow is stable.

## Phase 5 — Complete core student/class management

- Approved student fields and enrollment history.
- Grade levels, sections, subjects, school years, and staff assignments.
- Transfer and historical record handling.
- Search/filter/pagination.
- Role-based data access and audit.

## Phase 6 — Academic records

- Assigned subject/section workflow.
- Activities/assessments, score entry, validation, and persistence.
- Approved grading periods and calculations only.
- CSV import/export with preview and validation.

## Phase 7 — Early warnings and interventions

- Approved rule/evidence model.
- Private-first assigned review queue.
- Warning acknowledgement, assignment, and audit.
- Restricted intervention case workspace and follow-up timeline.
- Separate sensitive guidance records and policies if approved.

## Phase 8 — Announcements and reports

- Server-enforced announcement audiences and read receipts.
- Reports using authorized data and filters.
- Print/CSV first; additional formats only when justified.
- Parent/family communication only after approval.

## Phase 9 — PWA and offline support

- Installable manifest and service worker.
- App-shell caching and offline fallback.
- IndexedDB data cache/outbox.
- Automatic and manual sync, retries, idempotency, conflict handling.
- Shared-device account separation, lock/sign-out, cache clearing, and offline permission lease.
- Test offline and reconnect scenarios before enabling sensitive offline data.

## Phase 10 — Backup, hardening, and evaluation

- School-controlled Drive backup/export integration.
- Attachment backup and restoration test.
- Security, RLS, storage, file upload, and session hardening.
- Accessibility, cross-device, and performance checks.
- Prepare an honest evaluation plan aligned with the approved manuscript and actual features implemented.

---

# 13. Testing and acceptance checklist

For each module, create tests appropriate to the layer. Do not declare completion from a successful syntax check alone.

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
- Add an ERD/data dictionary and architecture document when the design phase is approved.
- Add tests and a test/run guide as implementation begins.

Never let documentation say authentication, persistence, role enforcement, external messages, backup, offline sync, or production deployment exists before it actually does.

---

# 15. Required source verification before policy/provider-specific implementation

Do not rely solely on remembered or generated facts about changing technical documentation or school rules. Check official primary sources before implementation and record the date and exact source in project documentation.

Useful starting references (verify that the pages and APIs are current before use):

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

Important: `appDataFolder` is private to the individual app/user and cannot be shared. It is not the destination for one central LNHS backup shared across staff. Verify Shared Drive permissions, ownership, OAuth scopes, and approved account arrangements before implementation.

### School policies and privacy

- Review complete, readable official DepEd issuances that actually apply to the school's workflow before implementing grading, attendance, student-support, or warning rules.
- Review the official Philippine Data Privacy Act and current National Privacy Commission guidance with the adviser/school privacy officer before any real student data is entered.
- Store source links, date reviewed, what the source actually establishes, and what remains uncertain. Do not infer school procedure from an issuance title or an unreadable PDF.

---

# 16. Strict do-not-do list

Do not:

- Rebuild the whole application in React or another framework just because it is fashionable.
- Replace working code with an untested rewrite.
- Generate the complete database/backend/offline system in one enormous change.
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
- Invent school-specific student fields, warning thresholds, grading formulas, attendance rules, parent communications, or retention policy.
- Invent an XML import/export format without an LNHS-approved schema.
- Generate fake research results, fake survey responses, or fake acceptance/evaluation findings.
- Use real student data in tests or screenshots.
- Add external notification channels before recipient and procedure approval.
- Mark a task complete because code was generated. Run the tests and show the result.
- Change several modules during one task unless the change is necessary and approved.
- Ask the user to re-explain information already in this prompt or repository.

---

# 17. Your first response after receiving this prompt

Start **Phase 0 only**. Do not edit or create project files.

Inspect the current workspace and return a structured audit with these headings:

1. **What I found:** actual repository tree, stack, entry points, current screens/modules, and current run method.
2. **What already works:** verified behaviors only, with the relevant file/function/selector references.
3. **What is still mocked or missing:** persistence, authentication, roles, backend, PWA/offline, synchronization, backup, tests, and any other absent feature.
4. **Issues and risks:** ranked Critical / High / Medium / Low. Include the dialog nested-scroll issue and any new findings from the actual code.
5. **Architecture fit:** confirm or challenge the proposed local-first PWA + Supabase + IndexedDB + Google Drive secondary-backup direction, with trade-offs and any provider/API details that need fresh verification.
6. **Role and privacy review:** identify where each role needs access, what must remain restricted, and what requires LNHS approval.
7. **Data model proposal:** draft core entities and relationships in readable text or Mermaid ERD. Do not create SQL migrations yet.
8. **Recommended project structure:** propose a gradual file/module organization for the current vanilla JS app. Explain why each proposed folder/file exists and what should remain untouched initially.
9. **Prioritized roadmap:** divide work into small milestones; identify dependencies and what can safely wait.
10. **First implementation task:** recommend one specific, small task with its goal, acceptance criteria, files to change, tests to run, and risks.

Finish by asking for approval to begin that one task. Do not proceed automatically.

---

# 18. Completion standard for the overall project

The project is not complete merely because it has many screens. The target is a system whose core workflows are coherent and demonstrable, whose data model matches its purpose, whose users see only what they are authorized to see, whose records persist correctly, whose offline behavior is explicit and recoverable, and whose limitations are honestly documented.

For the capstone demonstration, prioritize a small number of complete and reliable workflows over a large collection of superficial screens. The first proof should be a working authorized attendance workflow. Expand from there without losing the project's approved purpose or the developer's ability to explain and defend every major decision.

**Begin now with Phase 0: inspect, verify, explain, and plan. Do not edit files yet.**
