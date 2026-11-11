# Student Monitoring System

This is a mock system for presenting an academic capstone concept. It is not an
approved or deployed school system.

## Target architecture

- **Frontend:** the existing Vanilla JavaScript, HTML, CSS, and Vite application.
- **Hosting/deployment:** Vercel builds and hosts the frontend; GitHub is the
  source repository and can trigger Preview and Production deployments.
- **Backend:** Supabase provides Auth, Edge Functions, Storage, optional
  Realtime, and Supabase-managed PostgreSQL. PostgreSQL is part of Supabase,
  not a separate database host to purchase or configure.
- **Authorization:** PostgreSQL grants and RLS are the required data boundary;
  frontend visibility and a publishable key do not authorize access.
- **Distribution:** the target is an installable PWA. IndexedDB, service-worker
  caching, and controlled synchronization are future capabilities, not current
  functionality.
- **Optional backups:** Google Drive may be a secondary, workspace-authorized
  export destination; Supabase PostgreSQL remains the transactional source of
  truth.

Vercel and Supabase have separate responsibilities: Vercel hosts and deploys
the frontend; Supabase provides backend services and managed PostgreSQL. The
architecture target does not mean either provider is connected or deployed.

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
  startup. When no generic-key record exists, validated data from the prior
  application storage namespace is restored and copied to the generic key;
  legacy values are retained as a recovery source.
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
- Existing browser-local roster, attendance, academic, support, and demo
  session records are migrated from the previous application storage keys
  only when the corresponding generic key is absent and the data validates.
  The original values are left in place as a recovery source.
- Demo account selection and client-side navigation presets are available.
  Settings shows a data-free System Administration status page; account
  administration and school configuration are not operational.
- The production login can use Supabase Auth password sign-in and password
  recovery when `VITE_SUPABASE_URL` and a Supabase publishable key are configured.
  Authenticated accounts are kept out of the browser-local demo data until a
  workspace membership backend exists. Registration, workspace access, and
  student-record authorization are not implemented by this connection alone.
- The official `@supabase/supabase-js` dependency and public-client integration
  exist in source. No Supabase project credentials are configured in this
  repository, so remote sign-in and password recovery have not been tested.
- Production registration remains disabled until registration invitations can
  be validated by trusted backend code. No complete application schema, RLS
  policies, or workspace authorization backend exists.
- Local demo registration and workspace access are available in-browser: users can
  sign in with seeded workspace accounts or create an account using a registration
  invitation code, then create a workspace when a valid grant is supplied.
  Workspace switching remains a browser-local prototype only; it does not
  connect to a live Supabase backend or enforce real authorization.
- The demo navigation presets are provisional and not approved for deployment.
  Supabase Auth can authenticate accounts when configured, but assignment-level
  enforcement, workspace authorization, RLS, external messaging, and a shared
  student-record database are not configured. Client-side navigation restrictions
  do not protect records from direct browser/API access. Attendance, academic,
  and support demo data remain in this browser.
- Vercel hosting/deployment, Supabase/Vercel project integration, Production
  and Preview environment mapping, and PWA installation have not been
  configured or verified.
- A provisional role-permission proposal for teachers, advisers, guidance
  counselors, parents, and system administration is documented in
  `docs/ACCESS-CONTROL-MATRIX.md`. It is not approved for deployment or enforced as
  data authorization; only demo-level client-side navigation restrictions
  exist.
- Use fictitious data only. Do not enter real learner information or credentials.
- Institution-configurable fields, roles, thresholds, and procedures remain
  provisional until reviewed for the intended deployment.
- No legal or policy compliance is claimed.

## Product identity

The application is the **Student Monitoring System**. It is not branded for,
owned by, or approved by a particular institution.

## System implementation direction

The target is a complete connected system, not isolated mock screens. Core
identity, workspace boundaries, record workflows, and integrations must work
together before the system is represented as operational. Continue validating
the connected flows as they are built, and keep deployment-specific policy
decisions provisional until reviewed against official sources and by authorized
representatives.

## Local development

Requirements: Node.js `^20.19.0` or `>=22.12.0` and npm, matching the
installed Vite version's engine requirement.

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
```

Vite's local server URL is printed by `npm.cmd run dev`. The preview command
serves the most recent build.

### Supabase public client configuration

Copy `.env.example` to `.env.local` for local work and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Vite embeds `VITE_` variables in browser code. Use only a Supabase publishable
key here. Never expose a secret/service-role key through a `VITE_` variable,
frontend source, browser storage, or build output. A publishable key is not a
substitute for grants, RLS, or backend authorization.

### GitHub, Vercel, and Supabase setup

Provider accounts, project creation, and deployment are external setup tasks;
none have been performed or verified for this repository.

1. Create/manage the Supabase organization and project through Supabase.
2. Create a Vercel project and import this existing GitHub repository. Keep the
   current Vite framework; use the Vite build output (`dist`) and default Vite
   build command unless project settings require a documented change.
3. Install the official Supabase Vercel integration and connect the existing
   Supabase project to this Vercel project.
4. Configure the integration's public environment-variable prefix for Vite or
   explicitly map its public URL and publishable key to
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Inspect every variable the integration supplies before exposing it to the
   client. Never prefix Supabase secret, service-role, JWT, database-password,
   or other privileged values with `VITE_`, `NEXT_PUBLIC_`, or another public
   prefix. Store required privileged values only in trusted server-side
   environments such as Edge Functions.
6. Configure and verify the variables separately for Vercel **Production** and
   **Preview**. Preview deployments must use an isolated Supabase preview
   branch/project or other non-production target; do not let untrusted preview
   code use production data.
7. Verify Supabase Auth redirect URLs for the exact local, Preview, and
   Production origins before testing confirmation or recovery links.

Official setup references:

- [Supabase and Vercel integration](https://supabase.com/docs/guides/integrations/vercel)
- [Supabase Vercel Preview branches](https://supabase.com/docs/guides/integrations/vercel-preview-branches)
- [Supabase Vercel Marketplace](https://supabase.com/docs/guides/integrations/vercel-marketplace)
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel Git integration](https://vercel.com/docs/git)

Provider integration available, provider integration configured, application
connected and tested, and application deployed and verified are separate status
claims. Only claim each after checking evidence for that state.

## Project records

- [Master system build prompt](MASTER_SYSTEM_BUILD_PROMPT.md)
- [Requirements reconciliation](docs/REQUIREMENTS-RECONCILIATION.md)
- [Decision log](docs/DECISIONS.md)
