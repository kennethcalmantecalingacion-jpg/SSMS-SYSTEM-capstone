# Data Dictionary

## Purpose and status

This dictionary describes the conceptual entities and fields in
[DATA-MODEL-ERD.md](./DATA-MODEL-ERD.md), informed by the Phase 2.1
source-grounded inventory. It is a proposal for review, not a finalized
database schema, school policy, or claim of LNHS approval. The suggested
PostgreSQL-compatible types and nullability must be reviewed before
implementation. No SQL or migrations are included.

**Nullability:** “Required” means the field should be non-null in a future
schema unless noted. “Nullable” means no value can be valid in the described
case. “Conditional” means the field/entity relationship depends on LNHS
approval or a still-unconfirmed workflow. PK and FK labels follow the ERD.
Foreign keys to `USER_PROFILE` also depend on authenticated identities being
implemented. Enumerated values are not fixed here unless explicitly identified
as current prototype values; school-approved values must be confirmed.

## Learner and school structure

### `LEARNER`

Purpose: identify a learner independently of their current section.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `learner_id` | UUID | PK | Required | Stable internal identifier; do not use a visible row index. |
| `learner_identifier` | TEXT | — | Required, provisional | School-facing identifier. Require uniqueness if LNHS confirms its format and lifecycle; prototype IDs are fictional. |
| `name` | TEXT | — | Required | Minimum approved learner display name; exact profile fields remain unconfirmed. |

### `GRADE_LEVEL`

Purpose: configurable grade-level structure.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `grade_level_id` | UUID | PK | Required | Stable internal identifier. |
| `label` | TEXT | — | Required | Display label. Uniqueness scope and accepted naming are unconfirmed. |

### `SECTION`

Purpose: group enrollments and organize offerings and attendance.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `section_id` | UUID | PK | Required | Stable internal identifier. |
| `grade_level_id` | UUID | FK → `GRADE_LEVEL.grade_level_id` | Required | Parent grade level; referenced grade must exist. |
| `label` | TEXT | — | Required | Section label within its grade. Uniqueness within grade and naming rules require confirmation. |

### `SCHOOL_YEAR`

Purpose: optionally scope enrollments and subject offerings to a school year.
Its use and boundaries require LNHS confirmation.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `school_year_id` | UUID | PK | Required | Stable identifier if this entity is approved. |
| `label` | TEXT | — | Required | Display label; exact year naming and dates are not defined. |

### `ENROLLMENT`

Purpose: preserve the learner's section assignment over time. Do not overwrite
prior enrollment when a learner transfers.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `enrollment_id` | UUID | PK | Required | Stable identifier for one enrollment assignment. |
| `learner_id` | UUID | FK → `LEARNER.learner_id` | Required | Learner assigned by this enrollment. |
| `section_id` | UUID | FK → `SECTION.section_id` | Required | Section for this historical assignment. |
| `school_year_id` | UUID | FK → `SCHOOL_YEAR.school_year_id` | Conditional | Required if school-year scoping is approved; otherwise this relationship may not be used. |
| `effective_from` | DATE | — | Required, proposed | Start of assignment validity. Whether dates or another school-defined period governs transfers is unresolved. |
| `effective_to` | DATE | — | Nullable | End of a closed assignment; no value may represent the current assignment. Define boundary inclusivity and overlap rules before use. |

## User profiles, roles, and assignments

These are proposed authorization-supporting records, not evidence that the
prototype has login or role enforcement. A role is distinct from a class,
subject, advisory, or case assignment.

### `USER_PROFILE`

Purpose: application profile linked to a trusted authentication identity.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `user_id` | UUID | PK | Required | Stable application user identifier. |
| `auth_identity_reference` | TEXT | — | Required when provisioned | Reference to the identity managed by the selected authentication provider; exact provider representation is not chosen here. Keep secrets out of this record and frontend. |

### `ROLE`

Purpose: define a school-approved permission grouping; role names and authority
remain provisional.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `role_id` | UUID | PK | Required | Stable identifier for a role definition. |
| `role_name` | TEXT | — | Required | Approved role label. Unique role names are recommended; role list and permission semantics need approval. |

### `USER_ROLE`

Purpose: associate a user with a role, allowing multiple roles per user.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `user_role_id` | UUID | PK | Required | Stable assignment identifier. |
| `user_id` | UUID | FK → `USER_PROFILE.user_id` | Required | User receiving the role. |
| `role_id` | UUID | FK → `ROLE.role_id` | Required | Assigned role. Prevent duplicate user/role pairs; effective dates and assignment authority are not represented in the ERD. |

### `SUBJECT`

Purpose: name a subject offered for instruction. Current subjects are synthetic
examples; the official subject list is unconfirmed.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `subject_id` | UUID | PK | Required | Stable identifier. |
| `name` | TEXT | — | Required | Subject display name. Uniqueness rules and school-approved names require confirmation. |

### `SUBJECT_OFFERING`

Purpose: associate a subject with a section, optionally within a school year.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `subject_offering_id` | UUID | PK | Required | Stable offering identifier. |
| `section_id` | UUID | FK → `SECTION.section_id` | Required | Section receiving the offering. |
| `subject_id` | UUID | FK → `SUBJECT.subject_id` | Required | Offered subject. |
| `school_year_id` | UUID | FK → `SCHOOL_YEAR.school_year_id` | Conditional | Required only if school-year-scoped offerings are approved. |

### `TEACHING_ASSIGNMENT`

Purpose: associate a user with a subject offering for authorization scope.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `teaching_assignment_id` | UUID | PK | Required | Stable assignment identifier. |
| `user_id` | UUID | FK → `USER_PROFILE.user_id` | Required | Assigned staff user. |
| `subject_offering_id` | UUID | FK → `SUBJECT_OFFERING.subject_offering_id` | Required | Class/subject offering assigned. Effective dates, assignment approval, and uniqueness are not represented and require review. |

### `ADVISORY_ASSIGNMENT`

Purpose: associate a user with an advisory section, if that role/scope is
approved.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `advisory_assignment_id` | UUID | PK | Required | Stable assignment identifier. |
| `user_id` | UUID | FK → `USER_PROFILE.user_id` | Required | Assigned staff user. |
| `section_id` | UUID | FK → `SECTION.section_id` | Required | Advisory section. Multiple advisers, dates, and assignment approval are unresolved. |

## Attendance

### `ATTENDANCE_SESSION`

Purpose: group attendance entries for a section and date.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `attendance_session_id` | UUID | PK | Required | Stable session identifier. |
| `section_id` | UUID | FK → `SECTION.section_id` | Required | Section whose roster is recorded. |
| `attendance_date` | DATE | — | Required | Date of the session. Session type, timezone implications, and permitted dates need confirmation. |

### `ATTENDANCE_ENTRY`

Purpose: store one learner's status for an attendance session, linked to the
enrollment context that applied at the time.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `attendance_entry_id` | UUID | PK | Required | Stable entry identifier. |
| `attendance_session_id` | UUID | FK → `ATTENDANCE_SESSION.attendance_session_id` | Required | Parent session. |
| `enrollment_id` | UUID | FK → `ENROLLMENT.enrollment_id` | Required | Applicable historical enrollment. Its section must match the session section, and its effective period must cover the session. |
| `status` | TEXT | — | Required | Attendance result. Prototype examples are Present, Late, Absent, and Excused; approved values and treatment are pending. |

**Integrity review:** candidate uniqueness is one entry per
`attendance_session_id` and `enrollment_id`. The ERD does not decide whether a
section may hold multiple sessions on a date; therefore, do not assume
`section_id + attendance_date` alone is unique.

### `ATTENDANCE_CHANGE`

Purpose: retain the before/after status and actor for an authorized correction.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `attendance_change_id` | UUID | PK | Required | Stable history-event identifier. |
| `attendance_entry_id` | UUID | FK → `ATTENDANCE_ENTRY.attendance_entry_id` | Required | Entry that changed. |
| `actor_user_id` | UUID | FK → `USER_PROFILE.user_id` | Required once authenticated | User responsible for the change. Handling of system-generated changes is not defined. |
| `previous_status` | TEXT | — | Required for a correction | Status before the change; use only approved status values. |
| `new_status` | TEXT | — | Required | Status after the change; use only approved status values. |
| `occurred_at` | TIMESTAMPTZ | — | Required | Time the correction occurred. Time-source and retention rules require review. |

The ERD models correction history, not whether the initial entry is also
recorded as a change event. Define that distinction and immutable-history
expectations before implementation.

## Academic records

### `ASSESSMENT`

Purpose: define an activity/assessment within a subject offering.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `assessment_id` | UUID | PK | Required | Stable assessment identifier. |
| `subject_offering_id` | UUID | FK → `SUBJECT_OFFERING.subject_offering_id` | Required | Offering to which this activity belongs. |
| `title` | TEXT | — | Required | Activity title; current prototype allows a custom title. |
| `possible_points` | NUMERIC | — | Required | Maximum points. Must be positive; accepted precision and assessment rules require LNHS confirmation. |

The ERD does not include category, date, term, or grading-period fields.
Do not infer or add official grading rules from the prototype's percentage
average.

### `ASSESSMENT_SCORE`

Purpose: store a learner's score for an assessment and applicable enrollment.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `assessment_score_id` | UUID | PK | Required | Stable score-record identifier. |
| `assessment_id` | UUID | FK → `ASSESSMENT.assessment_id` | Required | Assessment receiving the score. |
| `enrollment_id` | UUID | FK → `ENROLLMENT.enrollment_id` | Required | Learner/class context for the score. Its section and effective period must agree with the assessment offering. |
| `score` | NUMERIC | — | Required for a recorded score | Numeric result; zero is a valid score, not a missing value. Must be between zero and `ASSESSMENT.possible_points`, inclusive. Precision remains open. |

The ERD currently represents an entered score, not an ungraded state. Do not
encode ungraded as zero. Whether an absent, excused, or ungraded result needs a
separate state or nullable score is an unresolved design question. Candidate
uniqueness: one score per assessment/enrollment.

### `ASSESSMENT_SCORE_CHANGE`

Purpose: retain prior and revised values for authorized score corrections.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `assessment_score_change_id` | UUID | PK | Required | Stable history-event identifier. |
| `assessment_score_id` | UUID | FK → `ASSESSMENT_SCORE.assessment_score_id` | Required | Score record that changed. |
| `actor_user_id` | UUID | FK → `USER_PROFILE.user_id` | Required once authenticated | User responsible for the change. |
| `previous_score` | NUMERIC | — | Required for a correction | Value before correction; must satisfy the assessment's bounds. |
| `new_score` | NUMERIC | — | Required | Value after correction; must satisfy the assessment's bounds. |
| `occurred_at` | TIMESTAMPTZ | — | Required | Time the correction occurred. |

As with attendance, decide separately whether initial score creation creates a
history event.

## Warnings and support

### `WARNING_RECORD`

Purpose: represent a warning/review prompt associated with a learner. Current
prototype records are synthetic and not generated by approved rules.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `warning_id` | UUID | PK | Required | Stable warning identifier. |
| `learner_id` | UUID | FK → `LEARNER.learner_id` | Required | Learner the prompt concerns. |
| `category` | TEXT | — | Required, provisional | Category label; current examples are Attendance, Academic, and Follow-up. Final categories need approval. |
| `priority` | TEXT | — | Conditional | Illustrative sample priority in the prototype; do not treat as a risk score. Whether priority is retained and its approved values are unresolved. |
| `source` | TEXT | — | Required for current display | Human-readable source/reason shown in the prototype. It is not a stable link to source evidence. |

### `WARNING_REVIEW_EVENT`

Purpose: attribute an acknowledgment/review to a user and time.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `warning_review_event_id` | UUID | PK | Required | Stable review-event identifier. |
| `warning_id` | UUID | FK → `WARNING_RECORD.warning_id` | Required | Warning reviewed. |
| `reviewer_user_id` | UUID | FK → `USER_PROFILE.user_id` | Required once authenticated | User who performed the review. |
| `occurred_at` | TIMESTAMPTZ | — | Required | Time of the review action. |

The ERD does not specify review action (acknowledge, dismiss, correct, or
reopen), comments, or assignment. A single mutable reviewed flag in the
prototype cannot provide this attribution/history.

### `SUPPORT_CASE`

Purpose: track a support plan or case for a learner, optionally started from a
warning.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `support_case_id` | UUID | PK | Required | Stable case identifier. |
| `learner_id` | UUID | FK → `LEARNER.learner_id` | Required | Learner associated with the case. |
| `source_warning_id` | UUID | FK → `WARNING_RECORD.warning_id` | Nullable | Optional actual warning reference; null for general follow-up. Preserve this FK rather than only copying the displayed warning text. |
| `planned_action` | TEXT | — | Required for the current plan workflow | Planned support action. Whether this is a case title, action, or multiple actions needs review. |
| `status` | TEXT | — | Required | Current case status. Prototype labels are Planned, In progress, Follow-up, and Completed; approval is pending. |

The ERD permits one warning to be linked to multiple cases and a case to have
at most one source warning. Confirm whether those cardinalities reflect the
approved workflow.

### `SUPPORT_UPDATE`

Purpose: append a dated follow-up update to a support case.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `support_update_id` | UUID | PK | Required | Stable update identifier. |
| `support_case_id` | UUID | FK → `SUPPORT_CASE.support_case_id` | Required | Case receiving the update. |
| `author_user_id` | UUID | FK → `USER_PROFILE.user_id` | Required once authenticated | User who authored the update. |
| `note` | TEXT | — | Required for a note; event-only updates need a decision | Brief update text. The prototype may generate a status-change note when no text is entered. Define whether status-only events need a note. |
| `occurred_at` | TIMESTAMPTZ | — | Required | Time the update occurred. |

Access to cases and updates must be independently authorized. Keep
confidential guidance notes outside this general update stream.

### `GUIDANCE_RECORD`

Purpose: placeholder for a distinct, more restricted guidance/counseling record
domain, only if LNHS approves such records.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `guidance_record_id` | UUID | PK | Required if entity approved | Stable identifier. |
| `learner_id` | UUID | FK → `LEARNER.learner_id` | Required if entity approved | Learner associated with this restricted record. |
| `author_user_id` | UUID | FK → `USER_PROFILE.user_id` | Required once authenticated | Author; approved guidance-role access is required. |
| `occurred_at` | TIMESTAMPTZ | — | Required | Time associated with the record; whether this means created time or event time must be specified. |

**Important gap:** the ERD has no field for guidance-record content, type,
purpose, or retention. Do not store sensitive content in this entity until
the purpose, required fields, authorization, audit, and retention are
approved. Its distinct name alone does not enforce confidentiality.

### `GUIDANCE_CASE_ASSIGNMENT`

Purpose: represent an approved user-to-support-case assignment for restricted
guidance/case work; this relationship is conditional and is not an access
policy by itself.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `guidance_case_assignment_id` | UUID | PK | Required if relationship approved | Stable assignment identifier. |
| `user_id` | UUID | FK → `USER_PROFILE.user_id` | Required if relationship approved | Assigned user. Must be limited by an approved role/caseload policy. |
| `support_case_id` | UUID | FK → `SUPPORT_CASE.support_case_id` | Required if relationship approved | Case assigned. The ERD does not say whether this grants case access, coordination, or both. |

## Announcements and audit

### `ANNOUNCEMENT`

Purpose: publish an in-app announcement with an audience label; the label is
not authorization and does not imply external delivery.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `announcement_id` | UUID | PK | Required | Stable announcement identifier. |
| `author_user_id` | UUID | FK → `USER_PROFILE.user_id` | Required once authenticated | User who created the post. |
| `section_id` | UUID | FK → `SECTION.section_id` | Nullable | Section target when a section audience is selected; otherwise null. |
| `audience_type` | TEXT | — | Required | Audience selector. Prototype values are staff and section; approved audience list and server-side access rules are pending. |
| `title` | TEXT | — | Required | Announcement title. |
| `message` | TEXT | — | Required | Announcement content. Keep sensitive learner details out of broad announcements. |
| `created_at` | TIMESTAMPTZ | — | Required | Creation time. The ERD does not represent edits or edit history. |

### `ANNOUNCEMENT_READ_RECEIPT`

Purpose: track read state separately for each user.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `announcement_read_receipt_id` | UUID | PK | Required | Stable read-receipt identifier. |
| `announcement_id` | UUID | FK → `ANNOUNCEMENT.announcement_id` | Required | Announcement read. |
| `user_id` | UUID | FK → `USER_PROFILE.user_id` | Required | User who read it. |
| `read_at` | TIMESTAMPTZ | — | Required | Time it was marked read. Candidate uniqueness is one receipt per announcement/user; repeated read events require a different history design. |

### `AUDIT_EVENT`

Purpose: record important actions with an actor, target descriptor, and time.
The target relationship is intentionally generic in the ERD.

| Field | Suggested type | Key | Nullability | Description and integrity |
|---|---|---|---|---|
| `audit_event_id` | UUID | PK | Required | Stable audit-event identifier. |
| `actor_user_id` | UUID | FK → `USER_PROFILE.user_id` | Required in the ERD | User responsible for the event. System actions or events without a user need an explicit policy before making this nullable. |
| `action` | TEXT | — | Required | Action name. Define a controlled vocabulary and avoid placing sensitive content in this field. |
| `target_type` | TEXT | — | Required | Entity/type label for the target. Must map to an allowed target type if validated. |
| `target_id` | TEXT | — | Required | Identifier of the target record, represented as text because targets may be different entity types. |
| `occurred_at` | TIMESTAMPTZ | — | Required | Event time. Retention and trusted time source require review. |

The generic `target_type`/`target_id` pair has no ordinary FK to all possible
target tables. Its integrity, deletion behavior, and queryability remain
unresolved; see proposed additions below.

## Proposed additions for review (not part of the ERD)

These fields or records are not silently added to the model. Decide whether
they are necessary before changing the ERD or creating a schema.

| Proposed detail | Reason and open decision |
|---|---|
| Created/updated timestamps and actor attribution on mutable entities | The ERD only includes timestamps on selected events. Confirm which records need creation/update metadata and whether audit events are sufficient. |
| Warning evidence reference, time window, and creation context | The ERD has `source` text but no linked attendance/score evidence or rule/version reference. Needed only if approved warnings are generated from source records; define explainability and correction behavior first. |
| Review action and optional note/assignment | `WARNING_REVIEW_EVENT` records reviewer/time only. Define whether acknowledgment, dismissal, correction, reassignment, or comments are needed and permitted. |
| Guidance-record content schema and case link | `GUIDANCE_RECORD` currently has no content and is deliberately separate. Define minimal approved content and whether it is linked to a guidance case, with strict access and retention, before adding fields. |
| Assignment scope and effective dates | Teaching/advisory/guidance assignments have no dates or assignment provenance. Confirm who grants assignments and how historical scope is represented. |
| Attendance session type/creator | Section/date alone may not identify a session if more than one exists per day. Confirm the school's session model and actor requirements. |
| Ungraded/excused score state | A numeric score distinguishes zero from absence of a score, but there is no explicit ungraded/absent/excused representation. Confirm required score states; do not overload zero. |
| Audit target constraint or per-entity audit tables | Generic target fields do not provide FK integrity. Decide whether to use domain-specific change records, a reviewed target registry, or another explicit design. |
| Enrollment transfer reason or source | No such field is in the ERD. Add only if an approved operational or reporting need exists. |

## Cross-entity integrity and historical rules to resolve

- Enrollment periods must not overlap for the same learner where that would
  create conflicting current assignments; define valid transfer boundaries
  and whether gaps are allowed.
- Attendance and score rows must reference an enrollment matching their
  section/subject context and applicable time. Exact constraints may require
  additional keys or validation not shown in this conceptual ERD.
- Decide the attendance-session uniqueness key before enforcing duplicates.
- Preserve attendance and score corrections with before/after values and
  actor/time; define how initial creation differs from a correction event.
- Distinguish missing/ungraded scores from a numeric zero.
- Retain actual warning references when cases begin from warnings; do not use
  copied display text as the relationship.
- Keep guidance data separate from general support updates and enforce access
  at the trusted data layer. The assignment entity is not itself authorization.
- Keep read receipts per user and enforce announcement audience access
  independently of the visible audience label.
- Define audit-target integrity, retention, archival/deletion behavior, and
  the effect of deleting or deactivating a user referenced by history.

All constraints, access rules, field values, and retention periods remain
subject to review. This dictionary does not authorize real learner data use,
school operation, or schema implementation.
