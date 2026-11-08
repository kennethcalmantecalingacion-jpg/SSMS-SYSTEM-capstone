# TASK 2 — SEPARATE PRODUCTION LOGIN AND BUILD THE DEMO PORTAL / SANDBOX

Act as a senior frontend engineer, application architect, and UI/UX engineer.

Work directly inside the existing Student Monitoring System repository.

## 1. OBJECTIVE

Separate the production-facing login experience from the existing browser-local demonstration system.

Build a dedicated **Demo Portal** where visitors can explore the application using existing demo accounts, sign in with previously created demo accounts, or create new simulated accounts.

The Demo Portal must become the interactive testing and tutorial environment for the future real system. It should allow users to simulate account registration, workspace creation, joining, invitations, membership management, and role assignment.

This is a local demonstration environment only. Do not claim that it provides real authentication or production-grade authorization.

The desired experience is:

**Main Login → Enter Demo Mode → Demo Portal → Choose an account or create one → Join or create a workspace → Explore and test the application.**

## 2. EXECUTION RULES

- Inspect the current implementation and relevant files before editing.
- Use the existing `Multi-workspace-and-login-register-feature.md` as a requirements reference.
- Reuse the current Vanilla JavaScript, HTML, CSS, and Vite architecture.
- Preserve the existing dashboard, student directory, attendance, academic, warning, intervention, report, and other working prototype functionality.
- Do not migrate frameworks or introduce unnecessary dependencies.
- Do not create another master prompt, roadmap, audit report, or duplicate feature document.
- Implement the connected workflow in this task; do not stop after an audit or plan.
- Avoid unrelated refactoring and repeated repository-wide scans.
- Preserve existing browser-local records and backward compatibility.
- Do not commit or push.

## 3. MAIN APPLICATION LOGIN PAGE

The main login page must become a dedicated, clean production-facing entry point.

### Remove from the main login page

- Demo account cards.
- Demo account selection.
- Demo registration codes.
- Demo workspace creation grants.
- Demo account registration and simulated authentication controls.
- Any demonstration-only account information.

### Keep the main login experience focused on

- Email and password sign-in.
- Forgot-password entry point.
- Create-account entry point.
- A clear **Enter Demo Mode** button.

Important: Supabase Auth is not implemented yet. Do not make the main login page pretend that real authentication or registration is operational.

Provide a truthful, visually clear not-configured state for production sign-in and registration. The controls can be presented as the future production interface, but must not authenticate using local demo accounts or create fake production accounts.

Clicking **Enter Demo Mode** must navigate to the separate Demo Portal.

Provide a clear way to return to the main login page from the Demo Portal.

## 4. BUILD THE DEDICATED DEMO PORTAL

Create a distinct Demo Portal page or application view using the existing Vite architecture. Choose the simplest maintainable routing approach compatible with the existing application. It must be a genuinely separate screen, not merely another tab mixed into the main login form.

Display:

**Student Monitoring System — Demo Environment**

Explain briefly that:
- This environment uses fictional accounts and synthetic data.
- Changes are limited to this browser-based sandbox.
- It is intended for demonstrations, tutorials, and feature testing.
- It is not connected to real accounts, institutions, or student records.

### Provide three clear entry paths

**A. Explore with an existing demo account**

Display the preconfigured Boter School demo accounts as selectable cards:

- Workspace Owner.
- Teacher.
- Adviser.
- Guidance Counselor.

Selecting an account should provide a convenient demo sign-in experience. Preserve the existing role-specific demo functionality and sample assignments.

Correct the existing seeded administrator terminology: distinguish Workspace Owner from Platform Operator. The Boter School demonstration account should not be represented as a Platform Operator.

Correct the existing Boter School ownership reference so that the designated demo Workspace Owner actually matches its seeded account ID.

**B. Sign in to an existing demo account**

Provide a normal simulated login form using the email/username and password of accounts previously created inside Demo Mode.

Validate the credentials against the demo account registry only.

Provide helpful validation, loading, empty, and error states.

Do not allow production account sign-in through this demo form.

**C. Create a new demo account**

Provide a simulated registration form with:
- Username.
- Email.
- Password.
- Confirm password.
- Demo registration invitation code.

Simulate email verification with a clearly labeled demonstration step. Do not send real emails.

Validate required fields, email format, password confirmation, unique username, unique email, invitation validity, expiration, and redemption limits.

Upon successful creation, allow the user to sign in to the newly created demo account.

Never automatically put a newly registered account into Boter School.

## 5. DEMO ACCOUNT ONBOARDING

After a newly created demo account signs in, check whether it has any workspace memberships.

If it has no membership, display an onboarding screen rather than opening Boter School or showing its records.

The onboarding screen should offer:

### Join an existing workspace

Provide:
- Join through a simulated workspace invitation code.
- Request membership in a workspace using its demo workspace identifier or another appropriate private discovery method.
- Clear pending, accepted, rejected, invalid, and expired states.

A pending join request must not grant workspace access until an authorized member approves it.

### Create a new workspace

Provide:
- Workspace name.
- Optional description.
- Simulated Workspace Creation Grant.

A successfully created workspace must:
- Be saved in the demo workspace registry.
- Assign the creator the Workspace Owner role.
- Add the creator as its first active member.
- Start with its own empty workspace data.
- Not inherit Boter School's users, student records, or assignments.

Keep registration invitations and workspace creation grants as separate simulated authorization types.

The Boter School demo workspace must only be accessible to accounts with explicit membership.

## 6. SIMULATED WORKSPACE MANAGEMENT

Expand the demo sandbox so users can test the membership workflows that the real system will eventually implement.

Provide an appropriate workspace administration screen for authorized demo Workspace Owners and Administrators.

Support:

- View workspace members.
- Generate simulated workspace invitation codes.
- Invite existing demo accounts.
- Display pending join requests.
- Approve or reject join requests.
- Assign and change workspace roles.
- Configure basic simulated teaching/advisory assignments.
- Remove or deactivate workspace memberships.
- Switch between workspaces where the account has membership.

Use these workspace roles:

- Workspace Owner.
- Workspace Administrator.
- Teacher.
- Adviser.
- Guidance Counselor.
- Parent/Guardian — remain disabled until the appropriate guardian-link workflow is implemented.

### Simulated authorization rules

- Only the Workspace Owner or an authorized Workspace Administrator can manage ordinary workspace membership.
- Ordinary members cannot change their own role or grant themselves administrative access.
- Workspace Administrators cannot promote themselves to Owner.
- Only an Owner can transfer ownership using an explicit simulated process.
- Prevent accidental removal or demotion of the only active Workspace Owner.
- A workspace invitation cannot grant Platform Operator privileges or Owner privileges.
- A user must have an actual membership before entering a workspace.
- Keep the existing restricted guidance-access boundary. Workspace ownership must not automatically provide access to confidential guidance records.

These rules are simulated frontend behavior only. Keep the limitations visible and do not describe them as server-enforced security.

## 7. FIX THE EXISTING IMPLEMENTATION ISSUES

Correct the following issues found in the current repository:

**A. Incorrect default workspace fallback**

The existing `createSession()` behavior can place accounts without a workspace membership into Boter School.

Remove this fallback. Accounts without a membership must stay in account onboarding.

**B. Invalid workspace switching**

The existing `switchWorkspace()` can fall back to another membership when the requested workspace is invalid or the account is not a member.

Reject invalid workspace switches. Require an explicit active membership.

**C. Workspace session persistence**

Persist the active demo workspace ID alongside the demo account session.

On refresh, restore the same active workspace only after validating that the account is still an active member.

**D. Boter School ownership**

Correct the mismatched owner account ID and role. The seeded Workspace Owner must be an actual member with the correct Workspace Owner role.

**E. Unsafe HTML rendering**

The existing workspace switcher interpolates user-created workspace names into `innerHTML`.

Replace unsafe interpolation of user-controlled names, labels, invitation details, and other values with safe DOM creation and `textContent`. Do not allow workspace names or usernames to inject HTML.

**F. Demo account/session separation**

Use clearly separated demo session and demo account storage boundaries. Do not reuse or overwrite future production authentication state.

Preserve existing synthetic records and legacy migration sources.

## 8. WORKSPACE DATA ISOLATION IN THE DEMO ENVIRONMENT

The existing prototype contains browser-local roster, attendance, academic, and support records.

Inspect how these records are loaded and saved.

The intended sandbox behavior is:

- Boter School retains the existing synthetic demonstration dataset.
- Newly created workspaces start with empty student-monitoring records.
- Switching workspaces must not accidentally display another workspace's student data.
- All synthetic records must remain clearly separate from real production data.

Where practical, scope demo workspace-owned local records by workspace ID. Migrate existing unscoped synthetic records to Boter School only when their destination is empty, retaining the original keys as a recovery source.

If a module cannot yet safely support workspace-specific data, clearly disable or label that module as not connected for newly created workspaces. Do not falsely claim complete data isolation.

## 9. MAKE THE DEMO A USEFUL TUTORIAL

This environment should teach users how the system works while allowing them to explore.

Include a concise introduction explaining the available demo paths.

Provide an optional guided walkthrough covering:

1. Signing in using a demo account.
2. Creating a simulated account.
3. Joining a workspace.
4. Creating a workspace.
5. Inviting or approving members.
6. Assigning roles.
7. Switching workspaces.
8. Exploring the student-monitoring modules.

Use practical instructions and contextual tips. Do not overwhelm users with technical terminology or force a lengthy tutorial every time they enter Demo Mode.

Provide a persistent, unobtrusive indication that the user is inside the sandbox:

**DEMO ENVIRONMENT — Fictional data · Browser-local · Not connected to real accounts**

### Demo reset

Provide an explicit reset option for authorized demo/testing use.

- Require confirmation before resetting.
- Clear only the intended demo-created accounts, workspace records, invitations, grants, sessions, and demo-specific data.
- Preserve unrelated application data and legacy recovery sources.
- Restore the original Boter School synthetic demonstration environment.
- Do not silently reset users' data during normal startup.

## 10. ARCHITECTURE AND DOCUMENTATION

Keep demo authentication and workspace simulation clearly separated from the future Supabase authentication and real workspace backend.

Organize the code so that future production services can implement equivalent workflows without depending on the demo account registry or demo localStorage as real authentication.

Avoid premature abstraction or a full rewrite.

Update the existing README, master blueprint, and QA checklist only where necessary to document:
- The production-facing login state.
- The separate Demo Portal.
- The simulated demo account and workspace workflows.
- Demo storage boundaries.
- Existing limitations.
- What remains unimplemented for real Supabase authentication and authorization.

Do not claim that demo behavior is production authentication, database security, RLS, or actual email verification.

## 11. ACCEPTANCE TESTS

Verify the following using the browser where available:

**Entry and navigation**
- Main login page has no demo account cards or demo registration controls.
- Enter Demo Mode opens the separate Demo Portal.
- Return to main login works.
- Production login does not accept demo credentials.

**Demo accounts**
- Existing Boter School demo accounts can enter their intended workspace.
- A previously created demo account can sign in.
- New demo account registration validates all required fields.
- Invalid or expired invitation codes are rejected.
- Registration does not automatically grant Boter School membership.

**Workspace onboarding**
- An account without a workspace sees onboarding.
- A valid workspace grant creates a workspace and assigns its creator Owner.
- A valid workspace invitation grants only the intended membership.
- Join requests remain pending until approved.
- Unauthorized members cannot approve requests or assign roles.

**Workspace management**
- Workspace Owner/Admin can manage permitted members.
- Users cannot self-promote.
- Owner transfer/removal safeguards work.
- Switching workspaces works and persists across refresh.
- Invalid workspace IDs and non-member access are rejected.

**Data isolation**
- Existing Boter School synthetic records remain intact.
- Newly created workspaces do not see Boter School records.
- Reset affects only demo data.
- Real account state and legacy recovery records are not overwritten.

**Technical checks**
- `npm.cmd run build`
- `node --check` on modified JavaScript files.
- `git diff --check`
- Run all relevant existing tests.
- Add focused tests or reusable browser QA steps for the new flows.

Do not report tests as passed unless they were actually executed.

## 12. COMPLETION REPORT

Provide a concise report containing:
1. What changed.
2. Main files modified.
3. Which demo workflows work.
4. Tests actually executed and results.
5. Known limitations or unfinished flows.

Do not commit or push.

Do not expand into real Supabase integration or Google Drive implementation in this task.

**BEGIN IMPLEMENTATION NOW. Implement the complete approved demo portal and sandbox workflow instead of returning only a plan or audit.**