# MASTER IMPLEMENTATION TASK — MULTI-WORKSPACE STUDENT MONITORING SYSTEM

Act as a senior full-stack engineer, application security engineer, Supabase/PostgreSQL architect, and UI/UX engineer.

You are working directly inside the existing Student Monitoring System repository in VS Code with full access to its source files and development tools.

Your task is to evolve the current single-demo-workspace prototype into a secure, multi-workspace Student Monitoring System with controlled account registration, workspace creation, membership management, workspace-specific roles and assignments, and isolated student records.

**This is an implementation instruction, not an architecture-planning exercise. Inspect the existing code, make the necessary architecture/documentation corrections, implement the working features, test them, and update the existing blueprints to reflect what was actually implemented. Do not stop after producing a plan or audit.**

---

# 1. EXECUTION RULES — CREDIT EFFICIENCY

- Inspect the current Git status and actual source before editing. Preserve existing user changes.
- Read the existing master blueprint and relevant ERD, data dictionary, access matrix, README, and offline design sections. Do not repeatedly scan the entire repository.
- Reuse existing modules and working UI wherever practical.
- Follow the existing vanilla JavaScript + Vite architecture. Do not migrate frameworks.
- Use the existing architecture and documentation as the starting point, updating only what the new multi-workspace model requires.
- Do not create another master prompt, roadmap, audit report, or duplicate documentation.
- Do not use subagents.
- Avoid unrelated refactoring, repeated explanations, unnecessary dependencies, and broad rewrites.
- Implement the complete connected foundation in this task. Work in logical internal stages, but do not stop to ask for approval between stages.
- Run relevant tests as implementation proceeds, fix failures, and then perform final validation.
- If a required external credential or manual provider setting is unavailable, continue implementing and testing everything that does not depend on it. Clearly identify the manual setup requirement without pretending the integration works.
- Do not commit or push.

Use concise completion reporting. Do not print an enormous implementation essay.

# 2. PRODUCT AND ARCHITECTURE TARGET

The product is:

**Student Monitoring System**

It must be institution-independent and support multiple independent workspaces.

The system has three distinct security scopes:

### A. Platform scope

The platform operator manages the software-level authorization system, including:
- Account registration invitations/authorization codes.
- Workspace creation grants.
- Platform-level technical configuration.
- Platform security and operational controls.

A Platform Operator is not automatically a member of every workspace and must not receive routine access to student records, academic records, attendance, interventions, or confidential guidance content.

The initial Platform Operator must be established using a secure, out-of-band bootstrap process. Never allow ordinary registration, workspace ownership, or frontend role selection to create a Platform Operator.

### B. Workspace scope

Each workspace is an independent student-monitoring environment.

Examples:
- Boter School — fictional demo workspace.
- Other workspaces created by authorized users.

A workspace has its own:
- Name and settings.
- Owner and members.
- Member invitations and join requests.
- Roles and staff assignments.
- Grade levels, sections, school years, and subjects.
- Learner profiles and enrollment history.
- Attendance, academic, warning, intervention, announcement, and report records as those modules become backend-enabled.
- Backup destination configuration.

A user may belong to several workspaces and have different roles and assignments in each.

### C. Account scope

An account represents one authenticated human user.

The account identity is global, but workspace membership and permissions are separate.

Never treat account ownership, workspace membership, and application role as interchangeable.

# 3. ACCOUNT REGISTRATION AND AUTHENTICATION

Replace fictional account selection as the actual authentication method with real Supabase Auth.

Use the supported Supabase JavaScript client and verify the current official Supabase documentation before implementation.

## Registration must be controlled

There must be no unrestricted public account creation.

A person needs a valid platform-issued **Registration Invitation Code** before they can request account creation.

The registration form should initially collect only:
- Username.
- Email address.
- Registration invitation code.

The person must establish their password through the secure invitation/verification flow.

Do not require a real/full name during account creation. Users can complete appropriate optional account-profile information after signing in.

The username is an application profile field, not a replacement for Supabase Auth identity. Enforce uniqueness and normalize it safely.

Use the trusted backend to:
1. Validate the registration code.
2. Check its expiration, redemption limit, revocation state, and optional email restriction.
3. Prevent repeated or concurrent redemption.
4. Create/send the Supabase Auth invitation using the supported server-side Admin API.
5. Record the invitation and audit event.
6. Ensure an invited account receives no workspace membership, role, or student-record access merely by registering.

Use email verification and secure password establishment. Configure the actual signup flow so users cannot bypass the registration-invitation requirement by directly calling the public Auth signup endpoint.

Prefer Supabase's supported invitation flow where appropriate. Admin invitation operations must execute in a trusted server-side environment, never from browser code.

Registration codes must:
- Be cryptographically random.
- Be stored as hashes, not plaintext.
- Be displayed only when generated.
- Support expiration, revocation, optional email binding, and bounded redemption.
- Have rate limits and brute-force protection.
- Be purpose-specific. A registration invitation must not authorize workspace creation.

## Sign-in

Provide a professional login form with:
- Email and password.
- Show/hide password.
- Remember-session behavior consistent with Supabase Auth.
- Loading, validation, and error states.
- Forgot-password/recovery flow.
- Email verification and invitation completion handling.
- Clear signed-out and expired-session behavior.

Do not include a role selector. The user signs in first; their workspace memberships determine their available workspaces and permissions.

## Account profile

After registration, users may complete their profile.

Keep the account profile separate from workspace membership. Do not require unnecessary personal or sensitive information. Store optional profile details in an application-owned profile table with appropriate access restrictions rather than trusting editable authentication metadata as authorization data.

# 4. WORKSPACE CREATION AUTHORIZATION

Creating an account must not automatically grant the ability to create unlimited workspaces.

A second, independent authorization is required:

**Workspace Creation Grant**

Only the Platform Operator can issue these grants.

A grant must:
- Be generated securely by the backend.
- Be stored as a hash.
- Support expiration, revocation, and single-use or explicitly limited redemption.
- Be consumed atomically.
- Never be a hardcoded developer code in frontend source.
- Never be issued automatically to every new user.

A new user who has no grant may still sign in and join a workspace through a valid invitation or approved join request.

When an authorized user redeems a workspace creation grant:
1. Validate the authenticated identity.
2. Validate and atomically consume the grant.
3. Create the workspace.
4. Create the creator's membership.
5. Assign the creator the Workspace Owner role.
6. Record the operation in an audit event.

The client must never be allowed to set its own `owner_user_id`, platform role, or privileged membership role through an untrusted request.

# 5. WORKSPACE MEMBERSHIP AND INVITATIONS

Implement these workspace membership paths:

## Invitation

A Workspace Owner or authorized Workspace Administrator can invite an existing or new account.

Support:
- Invitation link/token.
- Invitation code where useful.
- Optional email restriction.
- Expiration.
- Revocation.
- Intended workspace.
- Intended role or proposed membership permissions.
- One-time or bounded redemption.

The role assigned during redemption must be validated against the inviter's authority. A workspace invitation can never grant Platform Operator or Workspace Owner privileges.

For an existing account, the invitation joins the account to that workspace.

For a new account, the person must first complete platform registration authorization and email verification before accepting the workspace invitation.

## Join request

Allow users to request membership in a workspace using an invitation link, workspace identifier, or approved discovery method.

Default workspace discovery must be private/unlisted. Do not expose a public directory of student institutions or workspace data without an explicit setting.

Join requests remain pending until approved by an authorized workspace administrator.

A pending request is not membership and grants no access to workspace records.

Workspace settings may allow or disable join requests.

## Workspace selection

After sign-in:
- If the user has one workspace, allow them to enter it.
- If the user has multiple workspaces, show a workspace selection/switching screen.
- If the user has no workspace, show a useful onboarding screen with available actions:
  - Join a workspace.
  - Redeem a workspace creation grant, when authorized.
  - View account/profile settings.
- Never show Boter School to ordinary registered users unless they have an explicit membership or are using the isolated demo environment.

Switching workspaces must change the active application context and reload only records authorized for that workspace.

# 6. WORKSPACE ROLES AND ADMINISTRATION

Implement a clean distinction between platform roles and workspace roles.

## Platform role

- Platform Operator: controls registration invitations and workspace creation grants, and handles platform-level administration without automatic access to workspace learner data.

## Workspace roles

- Workspace Owner: creator or formally transferred owner. Manages workspace configuration, membership, invitations, roles, and approved operational administration.
- Workspace Administrator: authorized to manage workspace settings, members, roles, assignments, and approved school structure.
- Teacher.
- Adviser.
- Guidance Counselor.
- Parent/Guardian: remain disabled or conditional until a proper guardian-link and identity-verification workflow exists.

Users can hold multiple workspace roles when authorized.

Role and assignment data must be scoped to the relevant workspace. A user may be an Adviser in one workspace and a Teacher in another.

The Workspace Owner should have broad administrative authority over their own workspace, including managing staff, school structure, and normal operational records. However, administrative ownership must not automatically expose confidential guidance/counseling content. Keep the existing restricted guidance-access boundary.

Do not let:
- Workspace Admins issue platform registration codes or workspace creation grants.
- Workspace members promote themselves.
- Workspace Admins grant themselves Owner or Platform Operator.
- A user gain access to another workspace by changing an ID or query.
- A workspace role imply access to every learner or record without the required scope.

Provide an auditable ownership-transfer process. Prevent accidental loss of the only active Owner.

The old Designated System Administrator concept must not be confused with Workspace Owner or Workspace Administrator. Reconcile or retire the old role in the documentation and actual access model without granting unintended access.

# 7. DATABASE AND MULTI-WORKSPACE ISOLATION

Use Supabase PostgreSQL as the authoritative shared database.

Google Drive is not the transactional database.

Update the conceptual data model and implement versioned SQL migrations. At minimum, review and add the following entities where appropriate:

### Global account/platform entities
- `USER_PROFILE`
- `PLATFORM_ROLE`
- `PLATFORM_USER_ROLE`
- `PLATFORM_REGISTRATION_INVITE`
- `WORKSPACE_CREATION_GRANT`

### Workspace entities
- `WORKSPACE`
- `WORKSPACE_MEMBERSHIP`
- `WORKSPACE_MEMBER_ROLE`
- `WORKSPACE_INVITE`
- `WORKSPACE_JOIN_REQUEST`
- `WORKSPACE_AUDIT_EVENT` or a properly workspace-scoped audit design

### Existing student-monitoring entities
Preserve and workspace-scope the current entities:
- `GRADE_LEVEL`
- `SECTION`
- `SCHOOL_YEAR`
- `LEARNER`
- `ENROLLMENT`
- `SUBJECT`
- `SUBJECT_OFFERING`
- `TEACHING_ASSIGNMENT`
- `ADVISORY_ASSIGNMENT`
- `ATTENDANCE_SESSION`
- `ATTENDANCE_ENTRY`
- `ATTENDANCE_CHANGE`
- `ASSESSMENT`
- `ASSESSMENT_SCORE`
- `ASSESSMENT_SCORE_CHANGE`
- `WARNING_RECORD`
- `WARNING_REVIEW_EVENT`
- `SUPPORT_CASE`
- `SUPPORT_UPDATE`
- `GUIDANCE_RECORD`
- `GUIDANCE_CASE_ASSIGNMENT`
- `ANNOUNCEMENT`
- `ANNOUNCEMENT_READ_RECEIPT`
- `AUDIT_EVENT`

Use appropriate foreign keys and unique constraints. Add `workspace_id` to workspace-owned records where needed, including child records when required to enforce tenant-safe relationships. Use composite foreign keys/constraints where appropriate so a record in Workspace A cannot reference a learner, enrollment, offering, or parent record from Workspace B.

Do not use a client-supplied workspace ID as proof of permission.

## Row Level Security

Enable RLS and appropriate PostgreSQL grants for all exposed workspace-owned tables.

Build authorization around:
- Authenticated Supabase identity.
- Active workspace membership.
- Membership status.
- Workspace-specific role.
- Applicable class, subject, advisory, or case assignment.
- Entity and action.
- Restricted data classification.

Use `auth.uid()` and safe server/database authorization helpers. Avoid recursive RLS policy designs. If using `SECURITY DEFINER` helper functions, set a safe `search_path`, restrict execution grants, and ensure they only return the current user's authorized membership/scope.

Write separate policies for SELECT, INSERT, UPDATE, and DELETE. Use deny-by-default rules.

The `service_role`/secret key must never be in frontend code, public files, build output, browser storage, or logs.

Test RLS for anonymous, authenticated, and privileged trusted-server operations. Test both successful and forbidden operations.

A member of Workspace A must not:
- Read Workspace B records.
- Insert records into Workspace B.
- Update or delete Workspace B records.
- Reference Workspace B learners or assignments.
- Access Workspace B invitations, join requests, audit logs, or Drive configuration.

Test these restrictions using direct database/API requests, not only frontend visibility.

# 8. FIRST WORKSPACE DATA WORKFLOW

The user explicitly needs Workspace Owners and authorized Workspace Administrators to create and manage the actual student-monitoring workspace.

Implement the initial workspace configuration and student/class management workflow:

1. Create and configure workspace.
2. Create grade levels.
3. Create sections.
4. Configure the approved school-year structure.
5. Create student profiles using the existing approved minimal fields.
6. Enroll students in the appropriate section while preserving enrollment history.
7. Invite staff.
8. Approve memberships.
9. Assign workspace roles.
10. Create teaching/advisory assignments.
11. Verify each member can access only records allowed by their role and assignment.

Preserve existing student directory functionality where practical, but persist real workspace records through Supabase and enforce permissions in PostgreSQL.

Do not invent additional sensitive learner fields or institutional policies.

## Existing modules that are not yet backend-enabled

The current attendance, academic, warning, intervention, announcement, and report interfaces rely on browser-local or synthetic data.

Do not accidentally expose those local records to real workspace accounts.

Keep the existing Boter School demonstration workflows operational in their isolated demo environment. For newly created real workspaces, expose only modules whose records and permissions have actually been implemented through the workspace backend. Clearly disable or identify other modules as not yet connected instead of presenting localStorage as secure shared persistence.

Preserve the existing blueprint's attendance-first implementation direction after the account/workspace foundation and required roster setup. Do not silently claim that all modules are now backend-enabled.

# 9. BOTER SCHOOL DEMONSTRATION WORKSPACE

Preserve a ready-to-use fictional demo workspace named:

**Boter School**

It must demonstrate the workspace model with multiple demo accounts sharing the same workspace, each with different workspace roles and permissions.

Seed fictional accounts such as:
- `admin` — Workspace Owner.
- `teacher` — Teacher.
- `adviser` — Adviser.
- `counselor` — Guidance Counselor.

The demo accounts must share Boter School's synthetic data while remaining restricted by their respective roles and assignments.

A predictable test password such as `password` may be used only in a clearly isolated local development/test environment. Never seed these credentials into a production database or deploy them as universal administrator credentials.

Use local Supabase seed/bootstrap scripts or equivalent environment-specific fixtures. Do not hardcode demo identities or privileged credentials in browser JavaScript as a substitute for Auth.

The Boter School demo must:
- Contain synthetic records only.
- Never receive real user data.
- Never have platform registration-code or workspace-creation authority.
- Never access another workspace.
- Never connect or back up real data to a user's Google Drive.

Keep a clearly marked demo sign-in option available for capstone demonstrations where configured.

# 10. GOOGLE DRIVE WORKSPACE BACKUP CONNECTION

Implement Google Drive as a workspace-specific backup/export integration, not as the master transactional database.

A Workspace Owner or explicitly authorized Workspace Administrator should eventually be able to:
- Connect an authorized Google account.
- View the connection status.
- Select an appropriate backup folder.
- Create a dedicated backup folder if authorized.
- Disconnect/revoke the connection.
- See whether the backup destination is configured.

Implement the secure OAuth foundation where feasible:
- OAuth authorization flow with state/CSRF protection.
- Minimum appropriate Drive scopes.
- Server-side authorization-code exchange.
- Server-side refresh-token handling.
- Encrypted token storage using a backend-only secret.
- Workspace-scoped connection records.
- Authorization checks on every connect, update, backup, and disconnect action.
- No Google OAuth client secret or refresh token in frontend source, localStorage, or logs.

Do not label a Drive folder as the live master database. PostgreSQL remains authoritative.

Do not implement risky scheduled backups before the workspace database and export format are stable. Prioritize a verified manual export/backup path, clear status, and a restore/test strategy.

If Google OAuth credentials are not configured, implement the secure integration structure and environment templates, but show a clear "Not configured" state. Do not fake a successful connection.

Personal My Drive and Shared Drive availability differ. Verify current official Google documentation and handle the selected destination type appropriately. Do not assume every Gmail account can create a Shared Drive.

# 11. EXISTING LOCAL DATA AND MIGRATION SAFETY

The current prototype has generic browser-local storage keys and legacy migration logic.

Do not automatically upload browser-local records into a newly created real workspace.

Preserve existing synthetic demo records and compatibility logic. Keep legacy data recoverable until a safe migration/export path has been verified.

Do not let localStorage become a cross-account or cross-workspace data source.

Real workspace records must be read from and written to the authenticated backend. Any offline cache introduced later must be partitioned by authenticated account and workspace and protected by server authorization on sync.

Do not implement offline sync as part of this task unless required by already working code. Preserve the blueprint's later offline phase.

# 12. UI AND USER EXPERIENCE

Keep the existing visual style, responsiveness, navigation, and working module designs.

Implement a coherent user journey:

**Login**
- Sign in.
- Create account using a platform registration code.
- Recover password.

**After registration/sign-in**
- Complete optional account profile.
- View workspaces the account belongs to.
- Join a workspace through invitation or approved request.
- Redeem workspace creation grant if authorized.
- Create a workspace only after successful server-side grant validation.

**Workspace**
- Display active workspace name.
- Provide a workspace switcher.
- Workspace settings.
- Member and invitation management.
- Pending join requests.
- Role and assignment management.
- Student/class management.
- Account/profile settings.
- Drive backup configuration for authorized administrators.

Use clear loading, empty, denied, expired invitation, invalid code, already-used code, and network-failure states.

Do not create a huge unrelated administration dashboard. Keep platform controls separate from workspace administration.

# 13. TESTING AND ACCEPTANCE CRITERIA

Run available tests and create the missing targeted tests necessary to validate this implementation.

At minimum verify:

### Authentication and registration
- Valid registration invitation can be redeemed.
- Invalid, expired, revoked, or consumed registration code is rejected.
- Direct public signup cannot bypass the code requirement.
- Duplicate email/username is handled safely.
- Email verification and password setup work in the available environment.
- Sign-in, sign-out, recovery, expired session, and account profile behavior work.
- No ordinary account can become Platform Operator.

### Workspace creation
- User without a grant cannot create a workspace.
- Valid creation grant is consumed once.
- Concurrent redemption cannot create duplicate workspaces.
- Workspace creator becomes the Owner.
- Owner transfer is safe and auditable.

### Membership
- Valid invitations work.
- Expired/revoked invitations fail.
- Email-bound invitation cannot be redeemed by a different email.
- Pending join requests grant no data access.
- Approval creates only the intended membership and role.
- Revoked membership loses access.
- A user can belong to multiple workspaces with different roles.

### Tenant isolation
- Use at least two test workspaces, Workspace A and Workspace B.
- Create separate users and records in each.
- Verify SELECT, INSERT, UPDATE, and DELETE isolation for all exposed workspace data.
- Test direct API and database requests.
- Attempt to forge workspace IDs, membership IDs, role IDs, learner IDs, and related foreign keys.
- Confirm that guidance records remain restricted even from ordinary workspace administrators.

### Boter School demo
- Demo users share the same synthetic workspace.
- Each demo role has the intended limited access.
- Demo users cannot enter other workspaces or platform administration.
- Demo credentials are unavailable outside the local/demo environment.

### Student/class management
- Authorized workspace admins can manage structure and student enrollment.
- Ordinary members cannot self-assign admin roles or modify unauthorized records.
- Historical enrollment and associated records are preserved.
- Data remains after refresh and is isolated between workspaces.

### Drive connection
- Missing credentials show a truthful not-configured state.
- OAuth state is validated.
- Tokens never reach client storage or logs.
- Connections cannot be read or modified by another workspace.
- Disconnect/revocation behavior is handled.

### Final technical checks
- `npm.cmd run build`
- `node --check` on modified JavaScript files.
- `git diff --check`.
- Supabase migration validation.
- `supabase test db` / pgTAP when the local Supabase and Docker environment is available.
- Browser testing when the browser tooling is available.

Do not claim a test passed if it was not run. Do not claim live email, remote Auth, Google Drive, or production deployment works without the required credentials and successful verification.

# 14. UPDATE THE EXISTING MASTER BLUEPRINT AND DOCUMENTATION

After the implementation and tests, update the existing documents to reflect the actual architecture and implementation state:

- `MASTER_SYSTEM_BUILD_PROMPT.md`
- `README.md`
- `docs/DATA-MODEL-ERD.md`
- `docs/DATA-DICTIONARY.md`
- `docs/ACCESS-CONTROL-MATRIX.md`
- `docs/DECISIONS.md`
- `docs/REQUIREMENTS-RECONCILIATION.md`
- `docs/OFFLINE-SYNC-DESIGN.md`
- `docs/QA-CHECKLIST.md`

Reconcile the roadmap and architecture:
- Add platform registration authorization.
- Add workspace creation grants.
- Add multi-workspace account membership.
- Add Workspace Owner and Workspace Administrator.
- Add workspace-level data isolation and RLS.
- Add Boter School demo environment.
- Add workspace-specific Drive backup configuration.
- Move account/workspace foundation ahead of the attendance workflow.
- Preserve attendance as the first complete operational student-monitoring vertical workflow after the required workspace and roster foundation.
- Clearly state which modules are backend-enabled, demo-only, incomplete, or blocked by external configuration.

Do not delete historical decisions. Add a new dated decision entry explaining why the system moved from a single-deployment context to multi-workspace architecture.

Do not create another planning document.

# 15. DEFINITION OF DONE

This task is successful when:

1. The system has real Supabase account authentication rather than client-side role selection.
2. Account registration requires server-validated platform authorization.
3. Workspace creation requires a separate server-validated grant.
4. Workspace membership is invitation/request-based and approved.
5. Workspace Owner/Admin can manage their own workspace's membership, roles, assignments, and student/class setup within the defined permissions.
6. Boter School exists as an isolated synthetic demonstration workspace with multiple role-specific demo accounts.
7. Workspace-owned database records are protected by RLS and tenant-safe relationships.
8. Cross-workspace access tests demonstrate that one workspace cannot read or modify another workspace's records.
9. Existing demo functionality and local records are not silently destroyed.
10. Google Drive is represented only as a secure workspace backup/export destination, never as the transactional database.
11. The existing master blueprint and supporting documentation accurately describe what was implemented and what remains.
12. Build, syntax, diff, migration, and available security tests have been run and their actual results reported.

If an external service requires manual credentials or configuration, finish every independent implementation task, document the exact remaining setup, and do not disguise an unconfigured integration as operational.

**Begin implementation now. Do not respond with only a plan, do not wait for milestone approval, and do not create another master prompt or roadmap file.**