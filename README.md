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
- **Distribution:** the target is an installable PWA. Static application-shell
  and same-origin versioned assets are cached by the service worker. IndexedDB
  and record synchronization are not implemented.
- **Optional backups:** Google Drive may be a secondary, workspace-authorized
  export destination; Supabase PostgreSQL remains the transactional source of
  truth.

Vercel and Supabase have separate responsibilities: Vercel hosts and deploys
the frontend; Supabase provides backend services and managed PostgreSQL.
Provider setup below is user-confirmed; it has not been independently audited
and no Auth or backend workflow has been remotely tested during this
implementation. The public application URL was opened and returned its
account sign-in page.

The user-confirmed application URL is
[https://pwassms.vercel.app](https://pwassms.vercel.app). The user reports
that the existing `ssms_front` Vercel project is linked to this GitHub
repository and the Supabase integration supplies Vite-compatible public
variables in Production, Preview, and Development. Preview isolation from
production data, Auth redirect settings, and migrations still require
verification. Do not enter real learner data.

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
- The production shell uses Supabase Auth and keeps real accounts separate
  from the browser-local Demo Portal. Trusted invitation registration and
  grant-based workspace creation are implemented as Edge Functions, but the
  remote Auth configuration and flows have not been tested.
- Versioned migrations define account/workspace authorization, workspace
  structure, assignments, attendance, and data foundations for gradebook,
  warning review, support, guidance, and announcements. RLS and grants are
  implemented in source, but migrations have not been applied to a database
  and their policies have not been executed or security-tested.
- The real-account workspace UI supports workspace listing/selection,
  grant-based creation, assigned-roster attendance save/reload/correction,
  scoped learner-directory reads, and manager-only learner creation with an
  initial enrollment, profile corrections with restricted history, grade/
  section setup, and enrollment transfer. Learner creation, profile correction,
  and transfer use atomic backend functions; profile changes record prior
  values, reason, actor, and an audit event. Transfer closes rather than
  overwrites the prior enrollment and rejects dates that conflict with saved
  attendance. These features depend on the
  migrations and authorized backend data being deployed and have not been
  tested against a database. Learner deactivation and the other monitoring
  modules, reports, and dashboard are not connected for real accounts.
- Workspace member/invitation/join-request administration, ownership transfer,
  guidance workflows, private file storage, and Google Drive backup are not
  complete. No external messages are sent. Full offline data synchronization
  is not implemented.
- `public/manifest.webmanifest`, the SVG icon, and a service worker implement
  the static app shell, cached same-origin versioned assets, online status,
  browser-triggered install prompt, and user-controlled update handling.
  Authenticated API responses and learner records are not cached. The local
  browser preview loaded its shell, JS, and CSS after an offline reload; device
  installation and hosted acceptance remain unverified.
- Local demo registration and workspace access remain browser-local
  simulations. Demo navigation is not real authorization; demo records remain
  synthetic and separate from real accounts.
- A provisional role-permission proposal for teachers, advisers, guidance
  counselors, parents, and system administration is documented in
  `docs/ACCESS-CONTROL-MATRIX.md`. It is not approved for deployment or enforced as
  data authorization; only demo-level client-side navigation restrictions
  exist.
- Use fictitious data only. Do not enter real learner information or credentials.
- Institution-configurable fields, roles, thresholds, and procedures remain
  provisional until reviewed for the intended deployment. No legal or policy
  compliance is claimed.

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

### Local Supabase development

The Supabase CLI is pinned in the project dependencies. Local database
commands require Docker; `supabase start` was attempted during this work but
could not run because Docker and Podman are unavailable in the environment.
Database migrations and pgTAP tests have therefore not been executed.

```powershell
npm.cmd run db:start
npm.cmd run db:reset
npm.cmd run db:test
```

`db:reset` resets only the local CLI database and loads the synthetic
`supabase/seed.sql` fixtures. Never point a reset command at hosted data.
Copy `supabase/functions/.env.example` to
`supabase/functions/.env` and adjust only local callback origins before
serving Edge Functions:

```powershell
npm.cmd run functions:serve
```

Keep local environment files and all privileged keys out of version control.
Never put a Supabase secret/service-role key in a `VITE_` variable.

### GitHub, Vercel, and Supabase setup

The user reports that the existing GitHub-to-Vercel connection, Vercel
project `ssms_front`, Supabase integration, and public Vite variables are
already configured. Do not recreate those projects or integrations. The
reported public application URL is
[https://pwassms.vercel.app](https://pwassms.vercel.app); the provider state
and deployed workflows have not been independently verified during this task.

1. Before using real data or running a sensitive test, verify that Preview
   targets an isolated Supabase branch/project and Production targets the
   intended production project. Environment variables being present in both
   environments do not prove isolation.
2. Verify the integration's public environment-variable prefix for Vite or
   explicitly map its public URL and publishable key to
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Inspect every variable the integration supplies before exposing it to the
   client. Never prefix Supabase secret, service-role, JWT, database-password,
   or other privileged values with `VITE_`, `NEXT_PUBLIC_`, or another public
   prefix. Store required privileged values only in trusted server-side
   environments such as Edge Functions.
4. Verify Supabase Auth redirect URLs for the exact local, Preview, and
   Production origins before testing confirmation or recovery links.

### Safe remote migration and function deployment

No hosted database was changed and no function was deployed. First run the
build, tests, and local migrations against a local Supabase stack; review the
SQL and take an appropriate backup. Local application of migrations is
currently blocked until Docker is available. Remote deployment requires
separate explicit authorization; do not run the mutating commands below
without it.

From the repository root, after obtaining the project ref through the
provider UI (do not put credentials in chat):

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref <PROJECT_REF>
npx.cmd supabase db push --dry-run
```

Review the dry-run output and confirm the linked project and its backup before
an explicitly approved migration deployment:

```powershell
npx.cmd supabase db push
```

The four Edge Functions are
`register-with-invitation`, `create-workspace-with-grant`,
`issue-platform-registration-invitation`, and
`issue-workspace-creation-grant`. After reviewing each function and preparing
its server-side origin settings for the intended environment, deploy them
individually to the matching isolated Supabase project:

```powershell
npx.cmd supabase functions deploy register-with-invitation --project-ref <PROJECT_REF>
npx.cmd supabase functions deploy create-workspace-with-grant --project-ref <PROJECT_REF>
npx.cmd supabase functions deploy issue-platform-registration-invitation --project-ref <PROJECT_REF>
npx.cmd supabase functions deploy issue-workspace-creation-grant --project-ref <PROJECT_REF>
```

Set `APP_SITE_URL` and `ALLOWED_APP_ORIGINS` as trusted function environment
configuration for each environment; replace each placeholder with values for
that isolated project and its exact Vercel origin:

```powershell
npx.cmd supabase secrets set --project-ref <PRODUCTION_PROJECT_REF> APP_SITE_URL=https://pwassms.vercel.app ALLOWED_APP_ORIGINS=https://pwassms.vercel.app
npx.cmd supabase secrets set --project-ref <PREVIEW_PROJECT_REF> APP_SITE_URL=https://<PREVIEW_HOST> ALLOWED_APP_ORIGINS=https://<PREVIEW_HOST>
```

In Supabase Auth, set the exact Site URL and allowlist only the local,
Production, and isolated Preview callback URLs that are required. Under
**Authentication → Providers → Email**, disable public sign-ups before
enabling invitation-based registration; test `inviteUserByEmail` with those
exact settings. Configure an approved email delivery provider if real
invitation/recovery emails are expected; no email delivery was tested here.

Bootstrap the first Platform Operator out of band: a trusted project owner
creates/invites the pre-identified account through Supabase Auth, verifies the
identity, and uses the SQL Editor to assign the existing Auth UUID after the
migrations have been applied. Do not make a public bootstrap code or enable
public signup to do this. Example, after replacing both placeholders:

```sql
insert into public.platform_user_roles (user_id, role_key)
select id, 'platform_operator'
from auth.users
where id = '<AUTH_USER_UUID>'::uuid
  and lower(email) = lower('<VERIFIED_OPERATOR_EMAIL>')
on conflict (user_id, role_key) do nothing;
```

Record the out-of-band approval in the provider's authorized administrative
process. Then issue bounded registration invitations and separate
workspace-creation grants through their trusted functions. Neither is a
universal frontend admin code. Verify registration, membership, attendance,
and cross-workspace denials with synthetic users before any real-data use.

Run database tests only after starting the local stack:

```powershell
npm.cmd run db:test
```

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
