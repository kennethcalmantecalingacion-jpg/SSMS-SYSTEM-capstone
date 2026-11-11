create table public.school_years (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  name text not null check (length(btrim(name)) between 1 and 80),
  starts_on date not null,
  ends_on date not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, name),
  check (ends_on >= starts_on)
);

create unique index school_years_one_active_per_workspace
  on public.school_years (workspace_id)
  where status = 'active';

create table public.grade_levels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  label text not null check (length(btrim(label)) between 1 and 80),
  sort_order integer not null default 0,
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, label)
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  grade_level_id uuid not null,
  label text not null check (length(btrim(label)) between 1 and 100),
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, grade_level_id, label),
  foreign key (workspace_id, grade_level_id)
    references public.grade_levels (workspace_id, id) on delete restrict
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  code text check (code is null or length(btrim(code)) between 1 and 32),
  name text not null check (length(btrim(name)) between 1 and 100),
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, name)
);

create unique index subjects_workspace_code_key
  on public.subjects (workspace_id, code)
  where code is not null;

create table public.subject_offerings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  section_id uuid not null,
  subject_id uuid not null,
  school_year_id uuid not null,
  label text not null check (length(btrim(label)) between 1 and 100),
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, id, section_id, school_year_id),
  unique (workspace_id, section_id, subject_id, school_year_id, label),
  foreign key (workspace_id, section_id)
    references public.sections (workspace_id, id) on delete restrict,
  foreign key (workspace_id, subject_id)
    references public.subjects (workspace_id, id) on delete restrict,
  foreign key (workspace_id, school_year_id)
    references public.school_years (workspace_id, id) on delete restrict
);

create table public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  learner_identifier text not null check (length(btrim(learner_identifier)) between 1 and 64),
  display_name text not null check (length(btrim(display_name)) between 1 and 120),
  is_active boolean not null default true,
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, learner_identifier)
);

create table public.learner_profile_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  learner_id uuid not null,
  changed_by uuid not null references auth.users (id) on delete restrict,
  old_learner_identifier text not null,
  new_learner_identifier text not null,
  old_display_name text not null,
  new_display_name text not null,
  reason text not null check (length(btrim(reason)) between 3 and 500),
  changed_at timestamptz not null default now(),
  foreign key (workspace_id, learner_id)
    references public.learner_profiles (workspace_id, id) on delete restrict
);

create index learner_profile_history_learner_time_idx
  on public.learner_profile_history (workspace_id, learner_id, changed_at desc);

create trigger learner_profiles_set_updated_at
  before update on public.learner_profiles
  for each row execute function public.set_updated_at();

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  learner_id uuid not null,
  section_id uuid not null,
  school_year_id uuid not null,
  starts_on date not null,
  ends_on date,
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, id, learner_id, section_id, school_year_id),
  foreign key (workspace_id, learner_id)
    references public.learner_profiles (workspace_id, id) on delete restrict,
  foreign key (workspace_id, section_id)
    references public.sections (workspace_id, id) on delete restrict,
  foreign key (workspace_id, school_year_id)
    references public.school_years (workspace_id, id) on delete restrict,
  check (ends_on is null or ends_on >= starts_on)
);

create index enrollments_roster_lookup_idx
  on public.enrollments (workspace_id, section_id, school_year_id, starts_on, ends_on);

create table public.teaching_assignments (
  workspace_id uuid not null,
  subject_offering_id uuid not null,
  section_id uuid not null,
  school_year_id uuid not null,
  user_id uuid not null,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (workspace_id, subject_offering_id, user_id),
  foreign key (workspace_id, subject_offering_id, section_id, school_year_id)
    references public.subject_offerings (workspace_id, id, section_id, school_year_id)
    on delete restrict,
  foreign key (workspace_id, user_id)
    references public.workspace_memberships (workspace_id, user_id) on delete restrict
);

create index teaching_assignments_user_idx
  on public.teaching_assignments (workspace_id, user_id, subject_offering_id);

create table public.advisory_assignments (
  workspace_id uuid not null,
  section_id uuid not null,
  school_year_id uuid not null,
  user_id uuid not null,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (workspace_id, section_id, school_year_id, user_id),
  foreign key (workspace_id, section_id)
    references public.sections (workspace_id, id) on delete restrict,
  foreign key (workspace_id, school_year_id)
    references public.school_years (workspace_id, id) on delete restrict,
  foreign key (workspace_id, user_id)
    references public.workspace_memberships (workspace_id, user_id) on delete restrict
);

create table public.guidance_assignments (
  workspace_id uuid not null,
  learner_id uuid not null,
  user_id uuid not null,
  starts_on date not null default current_date,
  ends_on date,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (workspace_id, learner_id, user_id, starts_on),
  foreign key (workspace_id, learner_id)
    references public.learner_profiles (workspace_id, id) on delete restrict,
  foreign key (workspace_id, user_id)
    references public.workspace_memberships (workspace_id, user_id) on delete restrict,
  check (ends_on is null or ends_on >= starts_on)
);

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  section_id uuid not null,
  school_year_id uuid not null,
  attendance_date date not null,
  session_key text not null check (length(btrim(session_key)) between 1 and 80),
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, id, section_id, school_year_id, attendance_date),
  unique (workspace_id, section_id, school_year_id, attendance_date, session_key),
  foreign key (workspace_id, section_id)
    references public.sections (workspace_id, id) on delete restrict,
  foreign key (workspace_id, school_year_id)
    references public.school_years (workspace_id, id) on delete restrict
);

create index attendance_sessions_scope_date_idx
  on public.attendance_sessions (workspace_id, section_id, attendance_date desc);

create table public.attendance_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  attendance_session_id uuid not null,
  learner_id uuid not null,
  enrollment_id uuid not null,
  section_id uuid not null,
  school_year_id uuid not null,
  attendance_date date not null,
  status text not null check (status in ('present', 'late', 'absent', 'excused')),
  correction_reason text,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete restrict,
  updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, attendance_session_id, enrollment_id),
  foreign key (
    workspace_id, attendance_session_id, section_id, school_year_id, attendance_date
  ) references public.attendance_sessions (
    workspace_id, id, section_id, school_year_id, attendance_date
  ) on delete restrict,
  foreign key (
    workspace_id, enrollment_id, learner_id, section_id, school_year_id
  ) references public.enrollments (
    workspace_id, id, learner_id, section_id, school_year_id
  ) on delete restrict
);

create index attendance_entries_session_status_idx
  on public.attendance_entries (workspace_id, attendance_session_id, status);

create table public.attendance_change_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  attendance_entry_id uuid not null,
  section_id uuid not null,
  school_year_id uuid not null,
  changed_by uuid not null references auth.users (id) on delete restrict,
  old_status text not null check (old_status in ('present', 'late', 'absent', 'excused')),
  new_status text not null check (new_status in ('present', 'late', 'absent', 'excused')),
  reason text not null check (length(btrim(reason)) between 3 and 500),
  changed_at timestamptz not null default now(),
  foreign key (workspace_id, attendance_entry_id)
    references public.attendance_entries (workspace_id, id) on delete restrict,
  foreign key (workspace_id, section_id)
    references public.sections (workspace_id, id) on delete restrict,
  foreign key (workspace_id, school_year_id)
    references public.school_years (workspace_id, id) on delete restrict
);

create index attendance_change_history_entry_time_idx
  on public.attendance_change_history (workspace_id, attendance_entry_id, changed_at desc);

create or replace function private.can_manage_workspace(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_workspace_role(
    p_workspace_id,
    array['workspace_owner', 'workspace_administrator']::text[]
  );
$$;

create or replace function private.can_access_section(
  p_workspace_id uuid,
  p_section_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_active_workspace_member(p_workspace_id)
    and (
      private.can_manage_workspace(p_workspace_id)
      or (
        private.has_workspace_role(p_workspace_id, array['teacher']::text[])
        and exists (
          select 1
          from public.teaching_assignments as assignment
          join public.subject_offerings as offering
            on offering.workspace_id = assignment.workspace_id
            and offering.id = assignment.subject_offering_id
          where assignment.workspace_id = p_workspace_id
            and assignment.section_id = p_section_id
            and assignment.user_id = (select auth.uid())
        )
      )
      or (
        private.has_workspace_role(p_workspace_id, array['adviser']::text[])
        and exists (
          select 1
          from public.advisory_assignments as assignment
          where assignment.workspace_id = p_workspace_id
            and assignment.section_id = p_section_id
            and assignment.user_id = (select auth.uid())
        )
      )
    );
$$;

create or replace function private.can_record_attendance(
  p_workspace_id uuid,
  p_section_id uuid,
  p_school_year_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_active_workspace_member(p_workspace_id)
    and private.has_workspace_role(p_workspace_id, array['teacher']::text[])
    and exists (
      select 1
      from public.teaching_assignments as assignment
      join public.subject_offerings as offering
        on offering.workspace_id = assignment.workspace_id
        and offering.id = assignment.subject_offering_id
      where assignment.workspace_id = p_workspace_id
        and assignment.section_id = p_section_id
        and offering.school_year_id = p_school_year_id
        and assignment.user_id = (select auth.uid())
    );
$$;

create or replace function private.can_access_learner(
  p_workspace_id uuid,
  p_learner_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can_manage_workspace(p_workspace_id)
    or exists (
      select 1
      from public.enrollments as enrollment
    join public.school_years as school_year
      on school_year.workspace_id = enrollment.workspace_id
      and school_year.id = enrollment.school_year_id
    where enrollment.workspace_id = p_workspace_id
      and enrollment.learner_id = p_learner_id
      and school_year.status = 'active'
      and current_date between school_year.starts_on and school_year.ends_on
      and enrollment.starts_on <= current_date
      and (enrollment.ends_on is null or enrollment.ends_on >= current_date)
      and private.is_active_workspace_member(p_workspace_id)
      and (
        (
          private.has_workspace_role(p_workspace_id, array['teacher']::text[])
          and exists (
            select 1
            from public.teaching_assignments as assignment
            where assignment.workspace_id = enrollment.workspace_id
              and assignment.section_id = enrollment.section_id
              and assignment.school_year_id = enrollment.school_year_id
              and assignment.user_id = (select auth.uid())
          )
        )
        or (
          private.has_workspace_role(p_workspace_id, array['adviser']::text[])
          and exists (
            select 1
            from public.advisory_assignments as assignment
            where assignment.workspace_id = enrollment.workspace_id
              and assignment.section_id = enrollment.section_id
              and assignment.school_year_id = enrollment.school_year_id
              and assignment.user_id = (select auth.uid())
          )
        )
      )
    )
    or (
      private.has_workspace_role(p_workspace_id, array['guidance_counselor']::text[])
      and exists (
        select 1
        from public.guidance_assignments as assignment
        where assignment.workspace_id = p_workspace_id
          and assignment.learner_id = p_learner_id
          and assignment.user_id = (select auth.uid())
          and assignment.starts_on <= current_date
          and (assignment.ends_on is null or assignment.ends_on >= current_date)
      )
    );
$$;

create or replace function public.save_attendance_session(
  p_workspace_id uuid,
  p_section_id uuid,
  p_school_year_id uuid,
  p_attendance_date date,
  p_session_key text,
  p_entries jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  session_id uuid;
  submitted_count integer;
  distinct_learner_count integer;
  eligible_count integer;
  expected_count integer;
begin
  if auth.uid() is null
    or not private.can_record_attendance(
      p_workspace_id, p_section_id, p_school_year_id
    ) then
    raise exception 'not authorized for this attendance section' using errcode = '42501';
  end if;

  if length(btrim(coalesce(p_session_key, ''))) not between 1 and 80
    or jsonb_typeof(p_entries) <> 'array'
    or jsonb_array_length(p_entries) = 0 then
    raise exception 'invalid attendance session' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.school_years as school_year
    where school_year.workspace_id = p_workspace_id
      and school_year.id = p_school_year_id
      and school_year.status = 'active'
      and p_attendance_date between school_year.starts_on and school_year.ends_on
  ) then
    raise exception 'attendance date is outside an active school year' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_entries) as item(value)
    where jsonb_typeof(item.value) <> 'object'
      or coalesce(item.value ->> 'learnerId', '') !~
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      or coalesce(item.value ->> 'status', '') not in ('present', 'late', 'absent', 'excused')
  ) then
    raise exception 'attendance entries contain invalid values' using errcode = '22023';
  end if;

  select count(*), count(distinct (item.value ->> 'learnerId'))
  into submitted_count, distinct_learner_count
  from jsonb_array_elements(p_entries) as item(value);

  if submitted_count <> distinct_learner_count then
    raise exception 'duplicate learner in attendance entries' using errcode = '22023';
  end if;

  select count(*) into expected_count
  from public.enrollments as enrollment
  where enrollment.workspace_id = p_workspace_id
    and enrollment.section_id = p_section_id
    and enrollment.school_year_id = p_school_year_id
    and enrollment.starts_on <= p_attendance_date
    and (enrollment.ends_on is null or enrollment.ends_on >= p_attendance_date);

  select count(*) into eligible_count
  from jsonb_array_elements(p_entries) as item(value)
  join public.enrollments as enrollment
    on enrollment.workspace_id = p_workspace_id
    and enrollment.section_id = p_section_id
    and enrollment.school_year_id = p_school_year_id
    and enrollment.learner_id = (item.value ->> 'learnerId')::uuid
    and enrollment.starts_on <= p_attendance_date
    and (enrollment.ends_on is null or enrollment.ends_on >= p_attendance_date);

  if expected_count = 0 or submitted_count <> expected_count
    or eligible_count <> expected_count then
    raise exception 'attendance must include every learner enrolled in the section on that date'
      using errcode = '22023';
  end if;

  insert into public.attendance_sessions (
    workspace_id, section_id, school_year_id, attendance_date, session_key, created_by
  )
  values (
    p_workspace_id, p_section_id, p_school_year_id, p_attendance_date,
    btrim(p_session_key), auth.uid()
  )
  returning id into session_id;

  insert into public.attendance_entries (
    workspace_id, attendance_session_id, learner_id, enrollment_id,
    section_id, school_year_id, attendance_date, status, created_by
  )
  select
    p_workspace_id, session_id, enrollment.learner_id, enrollment.id,
    p_section_id, p_school_year_id, p_attendance_date,
    item.value ->> 'status', auth.uid()
  from jsonb_array_elements(p_entries) as item(value)
  join public.enrollments as enrollment
    on enrollment.workspace_id = p_workspace_id
    and enrollment.section_id = p_section_id
    and enrollment.school_year_id = p_school_year_id
    and enrollment.learner_id = (item.value ->> 'learnerId')::uuid
    and enrollment.starts_on <= p_attendance_date
    and (enrollment.ends_on is null or enrollment.ends_on >= p_attendance_date);

  return session_id;
end;
$$;

create or replace function public.prepare_attendance_correction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if auth.uid() is null or length(btrim(coalesce(new.correction_reason, ''))) not between 3 and 500 then
      raise exception 'a correction reason and authenticated actor are required'
        using errcode = '22023';
    end if;
    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create or replace function public.record_attendance_correction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.attendance_change_history (
      workspace_id, attendance_entry_id, section_id, school_year_id, changed_by,
      old_status, new_status, reason
    )
    values (
      new.workspace_id, new.id, new.section_id, new.school_year_id, new.updated_by,
      old.status, new.status, new.correction_reason
    );
  end if;
  return new;
end;
$$;

create trigger attendance_entries_prepare_correction
  before update on public.attendance_entries
  for each row execute function public.prepare_attendance_correction();

create trigger attendance_entries_record_correction
  after update on public.attendance_entries
  for each row execute function public.record_attendance_correction();

create or replace function public.correct_attendance_entry(
  p_workspace_id uuid,
  p_entry_id uuid,
  p_status text,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  attendance_entry public.attendance_entries%rowtype;
begin
  if auth.uid() is null or p_status not in ('present', 'late', 'absent', 'excused')
    or length(btrim(coalesce(p_reason, ''))) not between 3 and 500 then
    raise exception 'invalid correction request' using errcode = '22023';
  end if;

  select * into attendance_entry
  from public.attendance_entries
  where workspace_id = p_workspace_id and id = p_entry_id
  for update;

  if not found or not private.can_record_attendance(
    attendance_entry.workspace_id,
    attendance_entry.section_id,
    attendance_entry.school_year_id
  ) then
    raise exception 'not authorized for this attendance entry' using errcode = '42501';
  end if;

  if attendance_entry.status = p_status then
    return true;
  end if;

  update public.attendance_entries
  set status = p_status, correction_reason = btrim(p_reason)
  where workspace_id = p_workspace_id and id = p_entry_id;
  return true;
end;
$$;

create or replace function public.correct_attendance_session(
  p_workspace_id uuid,
  p_session_id uuid,
  p_corrections jsonb,
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  attendance_session public.attendance_sessions%rowtype;
  correction record;
  changed_count integer := 0;
  submitted_count integer;
  distinct_entry_count integer;
begin
  if auth.uid() is null
    or jsonb_typeof(p_corrections) <> 'array'
    or length(btrim(coalesce(p_reason, ''))) not between 3 and 500 then
    raise exception 'invalid attendance correction request' using errcode = '22023';
  end if;

  select * into attendance_session
  from public.attendance_sessions
  where workspace_id = p_workspace_id and id = p_session_id
  for update;
  if not found or not private.can_record_attendance(
    p_workspace_id, attendance_session.section_id,
    attendance_session.school_year_id
  ) then
    raise exception 'not authorized for this attendance session' using errcode = '42501';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_corrections) as item(value)
    where jsonb_typeof(item.value) <> 'object'
      or coalesce(item.value ->> 'entryId', '') !~
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      or coalesce(item.value ->> 'status', '') not in ('present', 'late', 'absent', 'excused')
  ) then
    raise exception 'attendance corrections contain invalid values' using errcode = '22023';
  end if;

  select count(*), count(distinct (item.value ->> 'entryId'))
  into submitted_count, distinct_entry_count
  from jsonb_array_elements(p_corrections) as item(value);
  if submitted_count <> distinct_entry_count then
    raise exception 'duplicate attendance entry in correction request' using errcode = '22023';
  end if;

  for correction in
    select (item.value ->> 'entryId')::uuid as entry_id,
      item.value ->> 'status' as status
    from jsonb_array_elements(p_corrections) as item(value)
  loop
    update public.attendance_entries
    set status = correction.status, correction_reason = btrim(p_reason)
    where workspace_id = p_workspace_id
      and attendance_session_id = p_session_id
      and id = correction.entry_id
      and status is distinct from correction.status;
    if found then
      changed_count := changed_count + 1;
    elsif not exists (
      select 1 from public.attendance_entries
      where workspace_id = p_workspace_id
        and attendance_session_id = p_session_id
        and id = correction.entry_id
    ) then
      raise exception 'attendance entry does not belong to this session'
        using errcode = '22023';
    end if;
  end loop;

  return changed_count;
end;
$$;

create or replace function public.create_learner_with_enrollment(
  p_workspace_id uuid,
  p_learner_identifier text,
  p_display_name text,
  p_section_id uuid,
  p_school_year_id uuid,
  p_starts_on date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  learner_id uuid;
begin
  if auth.uid() is null or not private.can_manage_workspace(p_workspace_id) then
    raise exception 'not authorized to manage learners in this workspace'
      using errcode = '42501';
  end if;

  if length(btrim(coalesce(p_learner_identifier, ''))) not between 1 and 64
    or length(btrim(coalesce(p_display_name, ''))) not between 1 and 120 then
    raise exception 'learner name and identifier are required'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.sections as section
    join public.school_years as school_year
      on school_year.workspace_id = section.workspace_id
    where section.workspace_id = p_workspace_id
      and section.id = p_section_id
      and school_year.id = p_school_year_id
      and school_year.status = 'active'
      and p_starts_on between school_year.starts_on and school_year.ends_on
  ) then
    raise exception 'section or active school year is invalid for the enrollment date'
      using errcode = '22023';
  end if;

  insert into public.learner_profiles (
    workspace_id, learner_identifier, display_name, created_by
  )
  values (
    p_workspace_id, btrim(p_learner_identifier), btrim(p_display_name), auth.uid()
  )
  returning id into learner_id;

  insert into public.enrollments (
    workspace_id, learner_id, section_id, school_year_id, starts_on, created_by
  )
  values (
    p_workspace_id, learner_id, p_section_id, p_school_year_id, p_starts_on, auth.uid()
  );

  insert into public.workspace_audit_events (
    workspace_id, actor_user_id, event_key, subject_user_id, metadata
  )
  values (
    p_workspace_id,
    auth.uid(),
    'learner.created',
    null,
    jsonb_build_object('learner_id', learner_id, 'section_id', p_section_id)
  );

  return learner_id;
end;
$$;

create or replace function public.update_learner_profile(
  p_workspace_id uuid,
  p_learner_id uuid,
  p_learner_identifier text,
  p_display_name text,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  learner public.learner_profiles%rowtype;
begin
  if auth.uid() is null or not private.can_manage_workspace(p_workspace_id) then
    raise exception 'not authorized to update learners in this workspace'
      using errcode = '42501';
  end if;

  if length(btrim(coalesce(p_learner_identifier, ''))) not between 1 and 64
    or length(btrim(coalesce(p_display_name, ''))) not between 1 and 120
    or length(btrim(coalesce(p_reason, ''))) not between 3 and 500 then
    raise exception 'invalid learner profile update' using errcode = '22023';
  end if;

  select * into learner
  from public.learner_profiles
  where workspace_id = p_workspace_id and id = p_learner_id
  for update;

  if not found then
    raise exception 'learner not found in this workspace' using errcode = '42501';
  end if;

  if learner.learner_identifier = btrim(p_learner_identifier)
    and learner.display_name = btrim(p_display_name) then
    return true;
  end if;

  insert into public.learner_profile_history (
    workspace_id, learner_id, changed_by,
    old_learner_identifier, new_learner_identifier,
    old_display_name, new_display_name, reason
  )
  values (
    p_workspace_id, p_learner_id, auth.uid(),
    learner.learner_identifier, btrim(p_learner_identifier),
    learner.display_name, btrim(p_display_name), btrim(p_reason)
  );

  update public.learner_profiles
  set learner_identifier = btrim(p_learner_identifier),
      display_name = btrim(p_display_name)
  where workspace_id = p_workspace_id and id = p_learner_id;

  insert into public.workspace_audit_events (
    workspace_id, actor_user_id, event_key, subject_user_id, metadata
  )
  values (
    p_workspace_id,
    auth.uid(),
    'learner.profile_updated',
    null,
    jsonb_build_object('learner_id', p_learner_id)
  );

  return true;
end;
$$;

create or replace function public.transfer_learner_enrollment(
  p_workspace_id uuid,
  p_learner_id uuid,
  p_current_enrollment_id uuid,
  p_new_section_id uuid,
  p_new_school_year_id uuid,
  p_starts_on date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_enrollment public.enrollments%rowtype;
  new_enrollment_id uuid;
begin
  if auth.uid() is null or not private.can_manage_workspace(p_workspace_id) then
    raise exception 'not authorized to manage learner enrollments in this workspace'
      using errcode = '42501';
  end if;

  select * into current_enrollment
  from public.enrollments
  where workspace_id = p_workspace_id
    and learner_id = p_learner_id
    and id = p_current_enrollment_id
  for update;

  if not found or current_enrollment.ends_on is not null
    or p_starts_on <= current_enrollment.starts_on then
    raise exception 'current enrollment is not transferable on the selected date'
      using errcode = '22023';
  end if;

  if current_enrollment.section_id = p_new_section_id
    and current_enrollment.school_year_id = p_new_school_year_id then
    raise exception 'select a different section or school year'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.attendance_entries as entry
    join public.attendance_sessions as session
      on session.workspace_id = entry.workspace_id
      and session.id = entry.attendance_session_id
    where entry.workspace_id = p_workspace_id
      and entry.enrollment_id = p_current_enrollment_id
      and session.attendance_date >= p_starts_on
  ) then
    raise exception 'transfer date cannot invalidate a saved attendance session'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.enrollments as enrollment
    where enrollment.workspace_id = p_workspace_id
      and enrollment.learner_id = p_learner_id
      and enrollment.id <> p_current_enrollment_id
      and (
        enrollment.starts_on >= p_starts_on
        or enrollment.ends_on is null
        or enrollment.ends_on >= p_starts_on
      )
  ) then
    raise exception 'transfer overlaps or precedes another enrollment'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.sections as section
    join public.school_years as school_year
      on school_year.workspace_id = section.workspace_id
    where section.workspace_id = p_workspace_id
      and section.id = p_new_section_id
      and school_year.id = p_new_school_year_id
      and school_year.status = 'active'
      and p_starts_on between school_year.starts_on and school_year.ends_on
  ) then
    raise exception 'destination section or active school year is invalid for the transfer date'
      using errcode = '22023';
  end if;

  update public.enrollments
  set ends_on = p_starts_on - 1
  where workspace_id = p_workspace_id
    and id = p_current_enrollment_id;

  insert into public.enrollments (
    workspace_id, learner_id, section_id, school_year_id, starts_on, created_by
  )
  values (
    p_workspace_id, p_learner_id, p_new_section_id, p_new_school_year_id,
    p_starts_on, auth.uid()
  )
  returning id into new_enrollment_id;

  insert into public.workspace_audit_events (
    workspace_id, actor_user_id, event_key, subject_user_id, metadata
  )
  values (
    p_workspace_id,
    auth.uid(),
    'enrollment.transferred',
    null,
    jsonb_build_object(
      'learner_id', p_learner_id,
      'previous_enrollment_id', p_current_enrollment_id,
      'new_enrollment_id', new_enrollment_id,
      'new_section_id', p_new_section_id
    )
  );

  return new_enrollment_id;
end;
$$;

create or replace function public.search_workspace_learners(
  p_workspace_id uuid,
  p_search text default null,
  p_page_size integer default 50,
  p_page_offset integer default 0
)
returns table (
  id uuid,
  learner_identifier text,
  display_name text,
  is_active boolean,
  total_count bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_page_size is null or p_page_offset is null
    or p_page_size not between 1 and 100
    or p_page_offset < 0
    or length(coalesce(p_search, '')) > 120 then
    raise exception 'invalid learner search pagination' using errcode = '22023';
  end if;

  return query
    select learner.id, learner.learner_identifier, learner.display_name,
      learner.is_active, count(*) over ()
    from public.learner_profiles as learner
    where learner.workspace_id = p_workspace_id
      and (
        nullif(btrim(p_search), '') is null
        or position(lower(btrim(p_search)) in lower(learner.display_name)) > 0
        or position(lower(btrim(p_search)) in lower(learner.learner_identifier)) > 0
      )
    order by learner.display_name, learner.id
    limit p_page_size offset p_page_offset;
end;
$$;

alter table public.school_years enable row level security;
alter table public.grade_levels enable row level security;
alter table public.sections enable row level security;
alter table public.subjects enable row level security;
alter table public.subject_offerings enable row level security;
alter table public.learner_profiles enable row level security;
alter table public.learner_profile_history enable row level security;
alter table public.enrollments enable row level security;
alter table public.teaching_assignments enable row level security;
alter table public.advisory_assignments enable row level security;
alter table public.guidance_assignments enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_entries enable row level security;
alter table public.attendance_change_history enable row level security;

revoke all on public.school_years, public.grade_levels, public.sections,
  public.subjects, public.subject_offerings, public.learner_profiles,
  public.learner_profile_history, public.enrollments,
  public.teaching_assignments, public.advisory_assignments,
  public.guidance_assignments, public.attendance_sessions,
  public.attendance_entries, public.attendance_change_history
  from public, anon, authenticated;

grant select on public.school_years, public.grade_levels, public.sections,
  public.subjects, public.subject_offerings, public.learner_profiles,
  public.learner_profile_history, public.enrollments,
  public.teaching_assignments, public.advisory_assignments,
  public.guidance_assignments, public.attendance_sessions,
  public.attendance_entries, public.attendance_change_history to authenticated;

grant insert (workspace_id, name, starts_on, ends_on, status, created_by)
  on public.school_years to authenticated;
grant update (name, starts_on, ends_on, status)
  on public.school_years to authenticated;
grant insert (workspace_id, label, sort_order, created_by)
  on public.grade_levels to authenticated;
grant update (label, sort_order) on public.grade_levels to authenticated;
grant insert (workspace_id, grade_level_id, label, created_by)
  on public.sections to authenticated;
grant update (grade_level_id, label) on public.sections to authenticated;
grant insert (workspace_id, code, name, created_by) on public.subjects to authenticated;
grant update (code, name) on public.subjects to authenticated;
grant insert (
  workspace_id, section_id, subject_id, school_year_id, label, created_by
) on public.subject_offerings to authenticated;
grant update (section_id, subject_id, school_year_id, label)
  on public.subject_offerings to authenticated;
grant all on public.school_years, public.grade_levels, public.sections,
  public.subjects, public.subject_offerings, public.learner_profiles,
  public.learner_profile_history, public.enrollments,
  public.teaching_assignments, public.advisory_assignments,
  public.guidance_assignments, public.attendance_sessions,
  public.attendance_entries, public.attendance_change_history to service_role;

create policy school_years_select_workspace_members
  on public.school_years for select to authenticated
  using (private.is_active_workspace_member(workspace_id));
create policy school_years_insert_managers
  on public.school_years for insert to authenticated
  with check (private.can_manage_workspace(workspace_id) and created_by = (select auth.uid()));
create policy school_years_update_managers
  on public.school_years for update to authenticated
  using (private.can_manage_workspace(workspace_id))
  with check (private.can_manage_workspace(workspace_id));

create policy grade_levels_select_workspace_members
  on public.grade_levels for select to authenticated
  using (private.is_active_workspace_member(workspace_id));
create policy grade_levels_insert_managers
  on public.grade_levels for insert to authenticated
  with check (private.can_manage_workspace(workspace_id) and created_by = (select auth.uid()));
create policy grade_levels_update_managers
  on public.grade_levels for update to authenticated
  using (private.can_manage_workspace(workspace_id))
  with check (private.can_manage_workspace(workspace_id));

create policy sections_select_workspace_members
  on public.sections for select to authenticated
  using (private.can_access_section(workspace_id, id));
create policy sections_insert_managers
  on public.sections for insert to authenticated
  with check (private.can_manage_workspace(workspace_id) and created_by = (select auth.uid()));
create policy sections_update_managers
  on public.sections for update to authenticated
  using (private.can_manage_workspace(workspace_id))
  with check (private.can_manage_workspace(workspace_id));

create policy subjects_select_workspace_members
  on public.subjects for select to authenticated
  using (private.is_active_workspace_member(workspace_id));
create policy subjects_insert_managers
  on public.subjects for insert to authenticated
  with check (private.can_manage_workspace(workspace_id) and created_by = (select auth.uid()));
create policy subjects_update_managers
  on public.subjects for update to authenticated
  using (private.can_manage_workspace(workspace_id))
  with check (private.can_manage_workspace(workspace_id));

create policy subject_offerings_select_assigned_sections
  on public.subject_offerings for select to authenticated
  using (private.can_access_section(workspace_id, section_id));
create policy subject_offerings_insert_managers
  on public.subject_offerings for insert to authenticated
  with check (private.can_manage_workspace(workspace_id) and created_by = (select auth.uid()));
create policy subject_offerings_update_managers
  on public.subject_offerings for update to authenticated
  using (private.can_manage_workspace(workspace_id))
  with check (private.can_manage_workspace(workspace_id));

create policy learner_profiles_select_authorized_scope
  on public.learner_profiles for select to authenticated
  using (private.can_access_learner(workspace_id, id));
create policy learner_profiles_insert_managers
  on public.learner_profiles for insert to authenticated
  with check (private.can_manage_workspace(workspace_id) and created_by = (select auth.uid()));
create policy learner_profiles_update_managers
  on public.learner_profiles for update to authenticated
  using (private.can_manage_workspace(workspace_id))
  with check (private.can_manage_workspace(workspace_id));
create policy learner_profile_history_select_managers
  on public.learner_profile_history for select to authenticated
  using (private.can_manage_workspace(workspace_id));

create policy enrollments_select_authorized_scope
  on public.enrollments for select to authenticated
  using (
    private.can_access_learner(workspace_id, learner_id)
    and private.can_access_section(workspace_id, section_id)
  );
create policy enrollments_insert_managers
  on public.enrollments for insert to authenticated
  with check (
    private.can_manage_workspace(workspace_id)
    and created_by = (select auth.uid())
  );
create policy enrollments_update_managers
  on public.enrollments for update to authenticated
  using (private.can_manage_workspace(workspace_id))
  with check (private.can_manage_workspace(workspace_id));

create policy teaching_assignments_select_self_or_managers
  on public.teaching_assignments for select to authenticated
  using (
    (user_id = (select auth.uid()) and private.is_active_workspace_member(workspace_id))
    or private.can_manage_workspace(workspace_id)
  );
create policy advisory_assignments_select_self_or_managers
  on public.advisory_assignments for select to authenticated
  using (
    (user_id = (select auth.uid()) and private.is_active_workspace_member(workspace_id))
    or private.can_manage_workspace(workspace_id)
  );
create policy guidance_assignments_select_self_or_managers
  on public.guidance_assignments for select to authenticated
  using (
    (user_id = (select auth.uid()) and private.is_active_workspace_member(workspace_id))
    or private.can_manage_workspace(workspace_id)
  );

create policy attendance_sessions_select_assigned_scope
  on public.attendance_sessions for select to authenticated
  using (private.can_record_attendance(workspace_id, section_id, school_year_id));
create policy attendance_entries_select_assigned_scope
  on public.attendance_entries for select to authenticated
  using (private.can_record_attendance(workspace_id, section_id, school_year_id));
create policy attendance_history_select_assigned_scope
  on public.attendance_change_history for select to authenticated
  using (private.can_record_attendance(workspace_id, section_id, school_year_id));

grant execute on function private.can_manage_workspace(uuid) to authenticated;
grant execute on function private.can_access_section(uuid, uuid) to authenticated;
grant execute on function private.can_record_attendance(uuid, uuid, uuid) to authenticated;
grant execute on function private.can_access_learner(uuid, uuid) to authenticated;
revoke all on function public.save_attendance_session(uuid, uuid, uuid, date, text, jsonb)
  from public, anon;
revoke all on function public.correct_attendance_entry(uuid, uuid, text, text)
  from public, anon;
revoke all on function public.correct_attendance_session(uuid, uuid, jsonb, text)
  from public, anon;
revoke all on function public.create_learner_with_enrollment(uuid, text, text, uuid, uuid, date)
  from public, anon, authenticated;
revoke all on function public.update_learner_profile(uuid, uuid, text, text, text)
  from public, anon, authenticated;
revoke all on function public.transfer_learner_enrollment(uuid, uuid, uuid, uuid, uuid, date)
  from public, anon, authenticated;
revoke all on function public.search_workspace_learners(uuid, text, integer, integer)
  from public, anon;
revoke all on function public.prepare_attendance_correction() from public, anon, authenticated;
revoke all on function public.record_attendance_correction() from public, anon, authenticated;
grant execute on function public.save_attendance_session(uuid, uuid, uuid, date, text, jsonb)
  to authenticated;
grant execute on function public.correct_attendance_entry(uuid, uuid, text, text)
  to authenticated;
grant execute on function public.correct_attendance_session(uuid, uuid, jsonb, text)
  to authenticated;
grant execute on function public.create_learner_with_enrollment(
  uuid, text, text, uuid, uuid, date
) to authenticated;
grant execute on function public.update_learner_profile(uuid, uuid, text, text, text)
  to authenticated;
grant execute on function public.transfer_learner_enrollment(
  uuid, uuid, uuid, uuid, uuid, date
) to authenticated;
grant execute on function public.search_workspace_learners(uuid, text, integer, integer)
  to authenticated;
