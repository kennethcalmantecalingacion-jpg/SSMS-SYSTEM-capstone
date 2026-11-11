# Offline synchronization and data ownership design

## Status and scope

This is the future offline design, not an implemented feature or approved
deployment policy. Supabase Auth password sign-in/recovery is integrated in
source but has no configured project. There is no shared application
database, workspace authorization, offline synchronization, or enforced
record access. Monitoring records remain synthetic and browser-local. Use
synthetic data only while designing and testing.

The target deployment uses Vercel for the Vite frontend and Supabase for
backend services and Supabase-managed PostgreSQL. IndexedDB, a service worker,
and controlled sync remain future work.

The design follows the provisional data model and access boundaries in
[DATA-MODEL-ERD.md](./DATA-MODEL-ERD.md),
[DATA-DICTIONARY.md](./DATA-DICTIONARY.md), and
[ACCESS-CONTROL-MATRIX.md](./ACCESS-CONTROL-MATRIX.md). It does not add schema
entities, fields, roles, or permissions. Where synchronization needs data not
represented by those documents, it is identified as a design gap for later
review.

### Current prototype limitations

These are known current behaviors, not fixes made by this design:

- Attendance and academic changes overwrite saved values without complete
  correction history.
- Saved attendance and academic records remain browser-local and are not tied
  to a backend enrollment-history model.
- Announcement read status is global rather than per user.

The target design below describes safeguards a future authorized,
server-backed workflow would need; it does not imply these limitations are
already resolved.

## 1. Authoritative ownership and synchronization metadata

The future Supabase-managed PostgreSQL database is the authoritative shared source of truth.
IndexedDB may hold a limited cache and durable pending-operation outbox, but a
browser or device never owns shared school records. Local records are
provisional until the server accepts them.

Every operation must keep these concepts distinct:

- **Record subject and context:** the affected record and its applicable
  relationship—for example, an attendance entry tied to its attendance
  session and historical `ENROLLMENT`.
- **Acting user:** the authenticated account responsible for the action.
- **Approved assignment and scope:** the assignment that permits the
  operation, such as a `TEACHING_ASSIGNMENT`, `ADVISORY_ASSIGNMENT`, or
  approved case assignment. A role alone is not authority.
- **Submitting device:** a source identifier for operational attribution,
  where approved. It does not identify the user or establish permission.

Local-only metadata may include a locally generated operation ID, local
queueing timestamp, retry count, local sync status, and a minimal device
installation identifier. The server must independently record the authenticated
actor, validation/authorization result, acceptance time, resulting record
version, and operation acknowledgement as approved. Local timestamps are
useful for display and diagnosis, not authoritative ordering or audit time.

The current ERD does not model an outbox, operation-receipt ledger, workspace
entity, per-record server version, or device registry. Treat these as
synchronization/backend design gaps. Do not silently add them to existing
entities or use a client-supplied workspace, role, assignment, or owner value
as trusted authorization evidence.

## 2. Local data and eligibility

Cache only the minimum fields and records required for a specifically
approved offline task. Partition cached data and queued operations by
authenticated account and workspace so different accounts or workspaces
cannot see one another's local records on a shared browser. A selected
workspace context does not itself grant access; the server rechecks current
membership and assignments for every synchronization operation.

The least-sensitive starting candidate is **assigned attendance**: a small,
approved roster and the attendance session/entry context needed to record
attendance for the user's active assignment. The applicable historical
enrollment must remain attached; a section transfer must not move old
attendance into the new enrollment context. Even this starter workflow
requires deployment institution approval of offline fields, scope, session rules, duration, and
device protections.

Guidance records and guidance-only content are unavailable offline by
default. General support data must not be used to smuggle guidance content
into a cache. Parent/guardian offline access is conditional on future verified
links and approved visibility; it is not assumed by this design.

Browser storage may be cleared or evicted, and persistent-storage requests
may be denied. IndexedDB is not a permanent record store or backup. Explain
pending-change risk to users and provide an approved recovery path before
relying on offline entry.

## 3. Pending-operation/outbox design

An outbox item represents an intended operation to be validated and applied
by the server, not a trusted copy of a server record. Its proposed envelope
contains:

| Attribute | Purpose |
|---|---|
| Unique operation/idempotency ID | Identifies one logical operation across retries so replay cannot create a duplicate. |
| Acting user/account and relevant workspace | Describes the account/context under which the operation was queued; the server must replace or verify it from the current authenticated session. |
| Record type and record identifier | Identifies the target, or indicates that a new record is being proposed. The server validates the type and target. |
| Operation type | Describes the requested create, update, correction, or approved append-only event. |
| Local change timestamp | Helps display queue order and diagnose offline activity; it is not trusted server time. |
| Base/server version | Identifies the server version the user viewed when making an edit, enabling optimistic concurrency checks. |
| Sync status and acknowledgement/result | Tracks pending, in-progress, accepted, rejected, or conflict outcomes; success requires a server response. |
| Device/source attribution | Helps identify the submitting installation where approved; it is not an identity credential or permission. |

The exact envelope and its server-side operation ledger are not entities in
the ERD or fields in the dictionary. Define them during backend design rather
than changing the conceptual model implicitly. Do not store credentials,
refresh tokens, secret keys, or trusted permission claims in the outbox.

For every queued operation, the server must recheck the authenticated
identity, account status, approved role and current assignment, record-level
scope, input validation, referential integrity, applicable enrollment/section
context, and expected record version. It must reject stale or unauthorized
work explicitly. Never trust queue-provided role, ownership, assignment, or
permission claims.

The server must make accepting an operation and recording its idempotency
result atomic. Reusing the same operation ID with the same logical request
returns the prior result; reuse with a different payload is rejected. This
prevents retry from creating duplicate attendance entries, assessments,
interventions, or announcements. It does not replace record-level uniqueness
constraints such as the candidate attendance-session/enrollment and
assessment/enrollment uniqueness rules, which still require review.

## 4. Synchronization lifecycle

Attempt synchronization when the app starts, network connectivity returns,
the app returns to the foreground, or valid queued work is available. Provide
a visible **Sync now** action. These are attempts, not a promise of continuous
background work: a closed or suspended browser may not run them.

Show plain-language states:

- **Pending:** saved on this device and waiting to send.
- **Syncing:** being submitted; do not imply it is already saved centrally.
- **Succeeded:** the server acknowledged and applied the operation.
- **Failed:** the server rejected it or it could not be submitted; explain
  whether user action or a retry is appropriate.
- **Conflict:** the server found a changed version or incompatible state that
  needs an approved resolution.

Only a server acknowledgement marks an operation synchronized. Retry
transient network/service failures with bounded backoff and the same
idempotency ID. Require explicit user-visible handling for permanent
validation or authorization failures. Process a batch per operation: retain
accepted results, report failed/conflicting items individually, show when a
batch is partially successful, and do not claim the entire batch succeeded
if only part did. Preserve dependency order for multiple queued operations on
one record; if an earlier operation fails, pause dependent operations for
review or an approved rebase.

If a session expires, pause protected sync and require reauthentication.
Recheck account status and assignments online before processing. If an
account is deactivated, a role or assignment is revoked, or the user's scope
changes, reject or hold affected operations for review; do not broaden access
or silently discard unsynchronized work. Explain the outcome and preserve a
safe, approved recovery path. Policy for rejected work and user support
requires deployment institution approval.

## 5. Conflicts, validation, and history

Use server-side record versions or equivalent optimistic concurrency checks.
Do not use last-write-wins for consequential attendance, grading, enrollment,
or support-history changes. Append-only history events are preferable where
the ERD provides them; history rows themselves are not rewritten to hide
conflicting attempts.

| Data area | Conflict and validation needed | Retry, event, or review | Never silently overwrite |
|---|---|---|---|
| Attendance entries and corrections | Same `ATTENDANCE_ENTRY` changed elsewhere; validate current `ATTENDANCE_SESSION`, enrollment/section match, effective enrollment context, allowed status, and base version. Confirm session uniqueness rules. | New entry may retry with its same operation ID if still valid and unique. A correction must append attributable `ATTENDANCE_CHANGE` history after version check; a stale correction needs review. | Another user's status, historical enrollment context, or correction event. |
| Assessment definitions and scores | `ASSESSMENT` or `ASSESSMENT_SCORE` changed; validate assigned offering, applicable enrollment, score bounds and base version. Grading and ungraded-state rules remain unapproved. | A score creation may retry idempotently if unique. A correction must preserve `ASSESSMENT_SCORE_CHANGE`; stale definition/score changes require review. | A score, maximum points, or prior score-change history; do not treat ungraded as zero. |
| Warning reviews | Multiple reviewers may review the same `WARNING_RECORD`; the ERD does not define review action or state transitions. | A distinct, approved review can be appended as `WARNING_REVIEW_EVENT`; duplicate operation IDs are idempotent. Conflicting review state or unsupported action requires review. | Prior review events or warning evidence/state not included in the operation. |
| Support cases and updates | Concurrent changes to `SUPPORT_CASE` status/action or updates; validate current case scope and actual `source_warning_id`. | Independent `SUPPORT_UPDATE` may append if authorized and valid. Competing case status/action updates require version check and, if stale, review. | Existing updates, warning links, or another user's case changes. Do not reduce the warning relationship to display text. |
| `GUIDANCE_RECORD` | Restricted content, assignments, and concurrent edits; the content schema and offline policy are not approved. | No offline queue or retry for guidance records by default. Any future workflow requires separate approval and restricted conflict handling. | Guidance content or access boundaries through general support data, logs, or queue payloads. |
| `ANNOUNCEMENT`, `ANNOUNCEMENT_READ_RECEIPT` | Concurrent announcement edits and audience/section changes; receipts may arrive from multiple devices for one user. | Receipt creation can be idempotent and scoped to the authorized user. Announcement edits require version checks and an approved edit-history process; stale edits need review. | Announcement audience authorization, prior content, or another user's receipt. A shared/global read flag is not an acceptable replacement. |
| Learner, enrollment, section, and assignment changes | Transfer, structure, role, or assignment changes may invalidate cached roster scope and queued work. Effective dates and assignment history are not fully modeled. | Revalidate online before applying. Hold queued operations against obsolete scope for review; only retry if historical context remains valid. | Historical enrollment, prior section context, or the assignment basis for an earlier operation. |

Conflict authority, user-visible choices, and correction procedures are
unresolved deployment decisions. A system may detect and present a conflict, but
must not invent who may resolve it or alter a record silently.

## 6. Shared-device and offline security

- Require individual accounts; do not use a shared staff login. Provide clear
  lock and sign-out controls and an inactivity-lock policy for approval.
- Partition cache and outbox by account and school/workspace. Check the
  authenticated session before displaying protected cached data and again
  before syncing.
- On sign-out or account switch, hide and lock the prior user's cache
  immediately. Do not delete pending operations silently. Keep them isolated
  and inaccessible to the next account while following an approved recovery,
  retention, and purge process.
- Use a short-lived offline authorization/session lease where feasible.
  Require reauthentication when it expires before reopening protected offline
  content. The authorization lease duration and allowed offline functions
  need deployment institution approval.
- A disconnected device cannot receive account deactivation or role/assignment
  revocation instantly. Minimize cached fields and offline duration; reject
  stale-scope operations when connectivity returns.
- Client-side encryption may help protect data at rest, but does not by
  itself protect a compromised device, an unlocked shared OS/browser profile,
  or content exposed to an active user with local access. Prefer separate
  operating-system/browser profiles on truly shared devices where feasible.

## 7. Data protection and boundaries

Offline cache, queue, sync response, logs, reports, print views, exports, and
derived summaries must preserve the same record-level restrictions as the
underlying data in [ACCESS-CONTROL-MATRIX.md](./ACCESS-CONTROL-MATRIX.md).
Offline mode is not a permission bypass. The server rechecks authorization
for every operation and data download.

Do not place guidance content in general support records, routine sync
payloads, error logs, or ordinary administrative views. Guidance records are
not available offline by default. Keep operational logs minimal and free of
sensitive record content.

Reports and exports inherit source-record restrictions; offline report data
must not reveal records the user could not read online. Google Drive is a
secondary backup/export destination, not the transactional database, live
source of truth, or synchronization mechanism. Any backup/export remains a
separately approved and audited process.

## 8. Proposed sequence and decisions

Offline work should wait until the authorized online attendance workflow is
stable. The online path must first establish identity, assignment-based
authorization, durable persistence, attendance uniqueness and validation,
historical enrollment context, correction history, and reliable audit
behavior. Otherwise offline replay would multiply unresolved data-integrity
and access problems.

Recommended staged path:

1. Stabilize and review the authorized online attendance workflow, including
   server validation, scope checks, history, and duplicate prevention.
2. Pilot limited offline attendance for approved assignments with minimal
   cached data, partitioned storage, an idempotent outbox, explicit sync
   status, server version checks, and conflict review.
3. Review pilot failures, shared-device protection, recovery, retention, and
   authorization behavior before expanding to other approved records.
4. Consider broader offline support only after each workflow, data class,
   authorization boundary, and conflict procedure is separately approved.

The following decisions remain for the deployment institution; this document does not settle them:

- Which data and fields, if any, are eligible for offline cache and for which
  roles and assignments.
- Offline authorization/session lease duration and reauthentication policy.
- Who may review or resolve each conflict and what correction evidence is
  required.
- Local cache/outbox retention, purge, backup, sign-out, account-switch, and
  device-loss recovery behavior.
- Handling of pending operations after account deactivation or role/assignment
  revocation.
- Approved guardian verification, visibility, communication, and any future
  offline access.
- Attendance session uniqueness, assignment lifecycle, and history/retention
  rules needed for safe synchronization.
- Server-side operation-ledger, version metadata, workspace partitioning, and
  acknowledgement/audit design; these are not currently modeled ERD fields
  or entities.

These are proposed design choices and open questions, not approved for a
deployment. Supabase Auth integration is present but unconfigured; do not claim
database persistence, workspace authorization, offline synchronization, or
these offline security controls are implemented.
