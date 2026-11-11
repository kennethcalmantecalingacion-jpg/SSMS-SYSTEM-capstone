create table public.gradebook_activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  subject_offering_id uuid not null,
  section_id uuid not null,
  school_year_id uuid not null,
  title text not null check (length(btrim(title)) between 1 and 120),
  possible_points numeric(10, 2) not null check (possible_points > 0),
  due_on date,
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  correction_reason text,
  unique (workspace_id, id),
  unique (workspace_id, id, section_id, school_year_id),
  foreign key (workspace_id, subject_offering_id, section_id, school_year_id)
    references public.subject_offerings (workspace_id, id, section_id, school_year_id)
    on delete restrict
);

create index gradebook_activities_offering_due_idx
  on public.gradebook_activities (workspace_id, subject_offering_id, due_on);

create table public.gradebook_activity_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  activity_id uuid not null,
  section_id uuid not null,
  school_year_id uuid not null,
  changed_by uuid not null references auth.users (id) on delete restrict,
  old_title text not null,
  new_title text not null,
  old_possible_points numeric(10, 2) not null,
  new_possible_points numeric(10, 2) not null,
  reason text not null check (length(btrim(reason)) between 3 and 500),
  changed_at timestamptz not null default now(),
  foreign key (workspace_id, activity_id, section_id, school_year_id)
    references public.gradebook_activities (workspace_id, id, section_id, school_year_id)
    on delete restrict
);

create table public.gradebook_scores (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  activity_id uuid not null,
  learner_id uuid not null,
  enrollment_id uuid not null,
  section_id uuid not null,
  school_year_id uuid not null,
  score numeric(10, 2) not null check (score >= 0),
  correction_reason text,
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete restrict,
  updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  unique (workspace_id, activity_id, learner_id),
  foreign key (workspace_id, activity_id, section_id, school_year_id)
    references public.gradebook_activities (workspace_id, id, section_id, school_year_id)
    on delete restrict,
  foreign key (workspace_id, enrollment_id, learner_id, section_id, school_year_id)
    references public.enrollments (workspace_id, id, learner_id, section_id, school_year_id)
    on delete restrict
);

create index gradebook_scores_activity_idx
  on public.gradebook_scores (workspace_id, activity_id);

create table public.gradebook_score_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  score_id uuid not null,
  activity_id uuid not null,
  learner_id uuid not null,
  enrollment_id uuid not null,
  section_id uuid not null,
  school_year_id uuid not null,
  changed_by uuid not null references auth.users (id) on delete restrict,
  old_score numeric(10, 2) not null,
  new_score numeric(10, 2) not null,
  reason text not null check (length(btrim(reason)) between 3 and 500),
  changed_at timestamptz not null default now(),
  foreign key (workspace_id, score_id)
    references public.gradebook_scores (workspace_id, id) on delete restrict,
  foreign key (workspace_id, activity_id, section_id, school_year_id)
    references public.gradebook_activities (workspace_id, id, section_id, school_year_id)
    on delete restrict,
  foreign key (workspace_id, enrollment_id, learner_id, section_id, school_year_id)
    references public.enrollments (workspace_id, id, learner_id, section_id, school_year_id)
    on delete restrict
);

create table public.warning_review_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  learner_id uuid not null,
  assigned_to uuid references auth.users (id) on delete set null,
  category text not null check (length(btrim(category)) between 1 and 80),
  reason text not null check (length(btrim(reason)) between 1 and 1000),
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence) = 'object'),
  period_start date,
  period_end date,
  status text not null default 'open' check (status in ('open', 'acknowledged', 'dismissed')),
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  foreign key (workspace_id, learner_id)
    references public.learner_profiles (workspace_id, id) on delete restrict,
  foreign key (workspace_id, assigned_to)
    references public.workspace_memberships (workspace_id, user_id) on delete restrict,
  check (period_end is null or period_start is null or period_end >= period_start)
);

create index warning_review_items_assignee_status_idx
  on public.warning_review_items (workspace_id, assigned_to, status, created_at desc);

create table public.warning_review_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  warning_item_id uuid not null,
  actor_user_id uuid not null references auth.users (id) on delete restrict,
  action text not null check (action in ('acknowledged', 'dismissed', 'reopened')),
  note text check (note is null or length(note) <= 1000),
  created_at timestamptz not null default now(),
  foreign key (workspace_id, warning_item_id)
    references public.warning_review_items (workspace_id, id) on delete restrict
);

create table public.support_cases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  learner_id uuid not null,
  source_warning_id uuid,
  title text not null check (length(btrim(title)) between 1 and 160),
  planned_action text not null check (length(btrim(planned_action)) between 1 and 2000),
  assigned_to uuid not null,
  follow_up_on date,
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'follow_up', 'completed')),
  outcome text check (outcome is null or length(outcome) <= 2000),
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  foreign key (workspace_id, learner_id)
    references public.learner_profiles (workspace_id, id) on delete restrict,
  foreign key (workspace_id, source_warning_id)
    references public.warning_review_items (workspace_id, id) on delete restrict,
  foreign key (workspace_id, assigned_to)
    references public.workspace_memberships (workspace_id, user_id) on delete restrict
);

create index support_cases_assignee_status_idx
  on public.support_cases (workspace_id, assigned_to, status, follow_up_on);

create table public.support_case_participants (
  workspace_id uuid not null,
  case_id uuid not null,
  user_id uuid not null,
  added_by uuid not null references auth.users (id) on delete restrict,
  added_at timestamptz not null default now(),
  primary key (workspace_id, case_id, user_id),
  foreign key (workspace_id, case_id)
    references public.support_cases (workspace_id, id) on delete restrict,
  foreign key (workspace_id, user_id)
    references public.workspace_memberships (workspace_id, user_id) on delete restrict
);

create table public.support_case_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  case_id uuid not null,
  actor_user_id uuid not null references auth.users (id) on delete restrict,
  event_key text not null check (length(btrim(event_key)) between 1 and 80),
  note text check (note is null or length(note) <= 2000),
  created_at timestamptz not null default now(),
  foreign key (workspace_id, case_id)
    references public.support_cases (workspace_id, id) on delete restrict
);

create index support_case_events_timeline_idx
  on public.support_case_events (workspace_id, case_id, created_at);

create table public.guidance_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  learner_id uuid not null,
  counselor_user_id uuid not null,
  record_body text not null check (length(btrim(record_body)) between 1 and 10000),
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete restrict,
  updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  foreign key (workspace_id, learner_id)
    references public.learner_profiles (workspace_id, id) on delete restrict,
  foreign key (workspace_id, counselor_user_id)
    references public.workspace_memberships (workspace_id, user_id) on delete restrict
);

create index guidance_records_counselor_learner_idx
  on public.guidance_records (workspace_id, counselor_user_id, learner_id);

create table public.staff_announcements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  section_id uuid,
  author_user_id uuid not null references auth.users (id) on delete restrict,
  audience_scope text not null check (audience_scope in ('workspace', 'section')),
  title text not null check (length(btrim(title)) between 1 and 160),
  body text not null check (length(btrim(body)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  foreign key (workspace_id, section_id)
    references public.sections (workspace_id, id) on delete restrict,
  check ((audience_scope = 'section') = (section_id is not null))
);

create index staff_announcements_workspace_time_idx
  on public.staff_announcements (workspace_id, created_at desc);

create table public.announcement_receipts (
  workspace_id uuid not null,
  announcement_id uuid not null,
  user_id uuid not null references auth.users (id) on delete restrict,
  read_at timestamptz not null default now(),
  primary key (workspace_id, announcement_id, user_id),
  foreign key (workspace_id, announcement_id)
    references public.staff_announcements (workspace_id, id) on delete restrict
);

create table public.guidance_record_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  guidance_record_id uuid not null,
  changed_by uuid not null references auth.users (id) on delete restrict,
  old_body text not null,
  new_body text not null,
  changed_at timestamptz not null default now(),
  foreign key (workspace_id, guidance_record_id)
    references public.guidance_records (workspace_id, id) on delete restrict
);

create or replace function private.can_access_offering(
  p_workspace_id uuid,
  p_offering_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can_manage_workspace(p_workspace_id)
    or (
      private.is_active_workspace_member(p_workspace_id)
      and private.has_workspace_role(p_workspace_id, array['teacher']::text[])
      and exists (
        select 1
        from public.teaching_assignments as assignment
        where assignment.workspace_id = p_workspace_id
          and assignment.subject_offering_id = p_offering_id
          and assignment.user_id = (select auth.uid())
      )
    );
$$;

create or replace function private.has_member_role(
  p_workspace_id uuid,
  p_user_id uuid,
  p_role_keys text[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_memberships as membership
    join public.workspace_member_roles as member_role
      on member_role.workspace_id = membership.workspace_id
      and member_role.user_id = membership.user_id
    where membership.workspace_id = p_workspace_id
      and membership.user_id = p_user_id
      and membership.status = 'active'
      and member_role.role_key = any (p_role_keys)
  );
$$;

create or replace function private.can_access_activity(
  p_workspace_id uuid,
  p_activity_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.gradebook_activities as activity
    where activity.workspace_id = p_workspace_id
      and activity.id = p_activity_id
      and private.can_access_offering(p_workspace_id, activity.subject_offering_id)
  );
$$;

create or replace function private.can_manage_support_case(
  p_workspace_id uuid,
  p_case_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.support_cases as support_case
    where support_case.workspace_id = p_workspace_id
      and support_case.id = p_case_id
      and private.can_access_learner(p_workspace_id, support_case.learner_id)
      and (
        private.can_manage_workspace(p_workspace_id)
        or support_case.assigned_to = (select auth.uid())
      )
  );
$$;

create or replace function private.can_access_warning(
  p_workspace_id uuid,
  p_warning_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.warning_review_items as item
    where item.workspace_id = p_workspace_id
      and item.id = p_warning_id
      and private.can_access_learner(p_workspace_id, item.learner_id)
      and (
        private.can_manage_workspace(p_workspace_id)
        or item.assigned_to = (select auth.uid())
      )
  );
$$;

create or replace function private.can_access_support_case(
  p_workspace_id uuid,
  p_case_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.support_cases as support_case
    where support_case.workspace_id = p_workspace_id
      and support_case.id = p_case_id
      and private.can_access_learner(p_workspace_id, support_case.learner_id)
      and (
        private.can_manage_workspace(p_workspace_id)
        or support_case.assigned_to = (select auth.uid())
        or exists (
          select 1 from public.support_case_participants as participant
          where participant.workspace_id = p_workspace_id
            and participant.case_id = p_case_id
            and participant.user_id = (select auth.uid())
        )
      )
  );
$$;

create or replace function private.can_access_announcement(
  p_workspace_id uuid,
  p_announcement_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_announcements as announcement
    where announcement.workspace_id = p_workspace_id
      and announcement.id = p_announcement_id
      and (
        (
          announcement.audience_scope = 'workspace'
          and private.is_active_workspace_member(p_workspace_id)
        )
        or (
          announcement.audience_scope = 'section'
          and private.can_access_section(p_workspace_id, announcement.section_id)
        )
      )
  );
$$;

create or replace function private.can_access_guidance_record(
  p_workspace_id uuid,
  p_record_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.guidance_records as record
    where record.workspace_id = p_workspace_id
      and record.id = p_record_id
      and record.counselor_user_id = (select auth.uid())
      and private.has_workspace_role(p_workspace_id, array['guidance_counselor']::text[])
      and exists (
        select 1
        from public.guidance_assignments as assignment
        where assignment.workspace_id = record.workspace_id
          and assignment.learner_id = record.learner_id
          and assignment.user_id = record.counselor_user_id
          and assignment.starts_on <= current_date
          and (assignment.ends_on is null or assignment.ends_on >= current_date)
      )
  );
$$;

create or replace function public.update_guidance_record(
  p_record_id uuid,
  p_record_body text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_record public.guidance_records%rowtype;
begin
  if auth.uid() is null or p_record_body is null
    or length(btrim(p_record_body)) not between 1 and 10000 then
    raise exception 'invalid guidance record update' using errcode = '22023';
  end if;

  select * into current_record
  from public.guidance_records
  where id = p_record_id
  for update;

  if not found or not private.can_access_guidance_record(
    current_record.workspace_id,
    current_record.id
  ) then
    raise exception 'not authorized for this guidance record' using errcode = '42501';
  end if;

  if current_record.record_body = p_record_body then
    return true;
  end if;

  insert into public.guidance_record_history (
    workspace_id, guidance_record_id, changed_by, old_body, new_body
  )
  values (
    current_record.workspace_id, current_record.id, auth.uid(),
    current_record.record_body, p_record_body
  );

  update public.guidance_records
  set record_body = p_record_body,
      updated_by = auth.uid()
  where workspace_id = current_record.workspace_id
    and id = current_record.id;

  return true;
end;
$$;

create or replace function public.review_warning(
  p_workspace_id uuid,
  p_warning_id uuid,
  p_action text,
  p_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  item public.warning_review_items%rowtype;
  next_status text;
begin
  if auth.uid() is null or p_action not in ('acknowledged', 'dismissed', 'reopened')
    or length(coalesce(p_note, '')) > 1000 then
    raise exception 'invalid warning review request' using errcode = '22023';
  end if;

  select * into item
  from public.warning_review_items
  where workspace_id = p_workspace_id and id = p_warning_id
  for update;
  if not found or not private.can_access_warning(p_workspace_id, p_warning_id) then
    raise exception 'not authorized for this warning' using errcode = '42501';
  end if;

  if p_action = 'reopened' then
    next_status := 'open';
  else
    next_status := p_action;
  end if;

  update public.warning_review_items
  set status = next_status, updated_at = now()
  where workspace_id = p_workspace_id and id = p_warning_id;

  insert into public.warning_review_events (
    workspace_id, warning_item_id, actor_user_id, action, note
  )
  values (p_workspace_id, p_warning_id, auth.uid(), p_action, nullif(btrim(p_note), ''));

  return true;
end;
$$;

create or replace function public.prepare_gradebook_activity_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.title is distinct from old.title
    or new.possible_points is distinct from old.possible_points
    or new.due_on is distinct from old.due_on then
    if auth.uid() is null
      or length(btrim(coalesce(new.correction_reason, ''))) not between 3 and 500 then
      raise exception 'an authenticated actor and change reason are required'
        using errcode = '22023';
    end if;
    if exists (
      select 1 from public.gradebook_scores as score
      where score.workspace_id = old.workspace_id
        and score.activity_id = old.id
        and score.score > new.possible_points
    ) then
      raise exception 'possible points cannot be lowered below a saved score'
        using errcode = '23514';
    end if;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create or replace function public.record_gradebook_activity_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.title is distinct from old.title
    or new.possible_points is distinct from old.possible_points
    or new.due_on is distinct from old.due_on then
    insert into public.gradebook_activity_history (
      workspace_id, activity_id, section_id, school_year_id, changed_by,
      old_title, new_title, old_possible_points, new_possible_points, reason
    )
    values (
      new.workspace_id, new.id, new.section_id, new.school_year_id, auth.uid(),
      old.title, new.title, old.possible_points, new.possible_points,
      new.correction_reason
    );
  end if;
  return new;
end;
$$;

create or replace function public.prepare_gradebook_score_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  maximum_points numeric(10, 2);
begin
  if new.score is distinct from old.score then
    if auth.uid() is null
      or length(btrim(coalesce(new.correction_reason, ''))) not between 3 and 500 then
      raise exception 'an authenticated actor and correction reason are required'
        using errcode = '22023';
    end if;
    select possible_points into maximum_points
    from public.gradebook_activities
    where workspace_id = new.workspace_id and id = new.activity_id;
    if maximum_points is null or new.score > maximum_points then
      raise exception 'score exceeds possible points' using errcode = '23514';
    end if;
    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create or replace function public.record_gradebook_score_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.score is distinct from old.score then
    insert into public.gradebook_score_history (
      workspace_id, score_id, activity_id, learner_id, enrollment_id, section_id,
      school_year_id, changed_by, old_score, new_score, reason
    )
    values (
      new.workspace_id, new.id, new.activity_id, new.learner_id,
      new.enrollment_id,
      new.section_id, new.school_year_id, new.updated_by,
      old.score, new.score, new.correction_reason
    );
  end if;
  return new;
end;
$$;

create trigger gradebook_activities_prepare_change
  before update on public.gradebook_activities
  for each row execute function public.prepare_gradebook_activity_change();
create trigger gradebook_activities_record_change
  after update on public.gradebook_activities
  for each row execute function public.record_gradebook_activity_change();
create trigger gradebook_scores_prepare_change
  before update on public.gradebook_scores
  for each row execute function public.prepare_gradebook_score_change();
create trigger gradebook_scores_record_change
  after update on public.gradebook_scores
  for each row execute function public.record_gradebook_score_change();

alter table public.gradebook_activities enable row level security;
alter table public.gradebook_activity_history enable row level security;
alter table public.gradebook_scores enable row level security;
alter table public.gradebook_score_history enable row level security;
alter table public.warning_review_items enable row level security;
alter table public.warning_review_events enable row level security;
alter table public.support_cases enable row level security;
alter table public.support_case_participants enable row level security;
alter table public.support_case_events enable row level security;
alter table public.guidance_records enable row level security;
alter table public.guidance_record_history enable row level security;
alter table public.staff_announcements enable row level security;
alter table public.announcement_receipts enable row level security;

revoke all on public.gradebook_activities, public.gradebook_activity_history,
  public.gradebook_scores, public.gradebook_score_history, public.warning_review_items,
  public.warning_review_events, public.support_cases, public.support_case_participants,
  public.support_case_events, public.guidance_records, public.guidance_record_history,
  public.staff_announcements, public.announcement_receipts
  from public, anon, authenticated;

grant select on public.gradebook_activities, public.gradebook_activity_history,
  public.gradebook_scores, public.gradebook_score_history, public.warning_review_items,
  public.warning_review_events, public.support_cases, public.support_case_participants,
  public.support_case_events, public.guidance_records, public.guidance_record_history,
  public.staff_announcements, public.announcement_receipts
  to authenticated;

grant insert (workspace_id, subject_offering_id, section_id, school_year_id,
  title, possible_points, due_on, created_by)
  on public.gradebook_activities to authenticated;
grant update (title, possible_points, due_on, correction_reason)
  on public.gradebook_activities to authenticated;
grant insert (workspace_id, activity_id, learner_id, enrollment_id,
  section_id, school_year_id, score, created_by)
  on public.gradebook_scores to authenticated;
grant update (score, correction_reason) on public.gradebook_scores to authenticated;
grant insert (workspace_id, learner_id, assigned_to, category, reason, evidence,
  period_start, period_end, created_by)
  on public.warning_review_items to authenticated;
grant update (assigned_to) on public.warning_review_items to authenticated;
grant insert (workspace_id, learner_id, source_warning_id, title, planned_action,
  assigned_to, follow_up_on, status, outcome, created_by)
  on public.support_cases to authenticated;
grant update (title, planned_action, assigned_to, follow_up_on, status, outcome)
  on public.support_cases to authenticated;
grant insert (workspace_id, case_id, user_id, added_by)
  on public.support_case_participants to authenticated;
grant insert (workspace_id, case_id, actor_user_id, event_key, note)
  on public.support_case_events to authenticated;
grant insert (workspace_id, section_id, author_user_id, audience_scope, title, body)
  on public.staff_announcements to authenticated;
grant update (title, body) on public.staff_announcements to authenticated;
grant insert (workspace_id, announcement_id, user_id)
  on public.announcement_receipts to authenticated;
grant update (read_at) on public.announcement_receipts to authenticated;
grant insert (workspace_id, learner_id, counselor_user_id, record_body, created_by)
  on public.guidance_records to authenticated;
grant all on public.gradebook_activities, public.gradebook_activity_history,
  public.gradebook_scores, public.gradebook_score_history, public.warning_review_items,
  public.warning_review_events, public.support_cases, public.support_case_participants,
  public.support_case_events, public.guidance_records, public.guidance_record_history,
  public.staff_announcements, public.announcement_receipts to service_role;

create policy gradebook_activities_select_assigned_offering
  on public.gradebook_activities for select to authenticated
  using (private.can_access_offering(workspace_id, subject_offering_id));
create policy gradebook_activities_insert_assigned_offering
  on public.gradebook_activities for insert to authenticated
  with check (
    private.can_access_offering(workspace_id, subject_offering_id)
    and created_by = (select auth.uid())
  );
create policy gradebook_activities_update_assigned_offering
  on public.gradebook_activities for update to authenticated
  using (private.can_access_offering(workspace_id, subject_offering_id))
  with check (private.can_access_offering(workspace_id, subject_offering_id));

create policy gradebook_activity_history_select_assigned
  on public.gradebook_activity_history for select to authenticated
  using (private.can_access_offering(
    workspace_id,
    (select activity.subject_offering_id
     from public.gradebook_activities as activity
     where activity.workspace_id = gradebook_activity_history.workspace_id
       and activity.id = gradebook_activity_history.activity_id)
  ));

create policy gradebook_scores_select_assigned
  on public.gradebook_scores for select to authenticated
  using (private.can_access_activity(workspace_id, activity_id));
create policy gradebook_scores_insert_assigned
  on public.gradebook_scores for insert to authenticated
  with check (
    private.can_access_activity(workspace_id, activity_id)
    and created_by = (select auth.uid())
    and score <= (
      select activity.possible_points
      from public.gradebook_activities as activity
      where activity.workspace_id = gradebook_scores.workspace_id
        and activity.id = gradebook_scores.activity_id
    )
  );
create policy gradebook_scores_update_assigned
  on public.gradebook_scores for update to authenticated
  using (private.can_access_activity(workspace_id, activity_id))
  with check (
    private.can_access_activity(workspace_id, activity_id)
    and score <= (
      select activity.possible_points
      from public.gradebook_activities as activity
      where activity.workspace_id = gradebook_scores.workspace_id
        and activity.id = gradebook_scores.activity_id
    )
  );

create policy gradebook_score_history_select_assigned
  on public.gradebook_score_history for select to authenticated
  using (private.can_access_activity(workspace_id, activity_id));

create policy warning_items_select_assigned
  on public.warning_review_items for select to authenticated
  using (private.can_access_warning(workspace_id, id));
create policy warning_items_insert_managers
  on public.warning_review_items for insert to authenticated
  with check (
    private.can_manage_workspace(workspace_id)
    and private.can_access_learner(workspace_id, learner_id)
    and (assigned_to is null or private.has_member_role(
      workspace_id,
      assigned_to,
      array['teacher', 'adviser', 'guidance_counselor']::text[]
    ))
    and created_by = (select auth.uid())
  );
create policy warning_items_update_managers
  on public.warning_review_items for update to authenticated
  using (private.can_manage_workspace(workspace_id))
  with check (private.can_manage_workspace(workspace_id));
create policy warning_events_select_assigned
  on public.warning_review_events for select to authenticated
  using (private.can_access_warning(workspace_id, warning_item_id));

create policy support_cases_select_participants
  on public.support_cases for select to authenticated
  using (private.can_access_support_case(workspace_id, id));
create policy support_cases_insert_authorized_staff
  on public.support_cases for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and private.can_access_learner(workspace_id, learner_id)
    and private.has_member_role(
      workspace_id,
      assigned_to,
      array['workspace_owner', 'workspace_administrator', 'teacher', 'adviser',
        'guidance_counselor']::text[]
    )
  );
create policy support_cases_update_participants
  on public.support_cases for update to authenticated
  using (private.can_manage_support_case(workspace_id, id))
  with check (
    private.can_manage_workspace(workspace_id)
    or assigned_to = (select auth.uid())
  );
create policy support_participants_select_case_scope
  on public.support_case_participants for select to authenticated
  using (private.can_access_support_case(workspace_id, case_id));
create policy support_participants_insert_managers
  on public.support_case_participants for insert to authenticated
  with check (
    private.can_manage_workspace(workspace_id)
    and private.has_member_role(
      workspace_id,
      user_id,
      array['workspace_owner', 'workspace_administrator', 'teacher', 'adviser',
        'guidance_counselor']::text[]
    )
    and added_by = (select auth.uid())
  );
create policy support_case_events_select_case_scope
  on public.support_case_events for select to authenticated
  using (private.can_access_support_case(workspace_id, case_id));
create policy support_case_events_insert_case_scope
  on public.support_case_events for insert to authenticated
  with check (
    private.can_access_support_case(workspace_id, case_id)
    and actor_user_id = (select auth.uid())
  );

create policy staff_announcements_select_audience
  on public.staff_announcements for select to authenticated
  using (private.can_access_announcement(workspace_id, id));
create policy staff_announcements_insert_authorized_staff
  on public.staff_announcements for insert to authenticated
  with check (
    author_user_id = (select auth.uid())
    and private.is_active_workspace_member(workspace_id)
    and (
      private.can_manage_workspace(workspace_id)
      or (
        audience_scope = 'section'
        and private.can_access_section(workspace_id, section_id)
      )
    )
  );
create policy staff_announcements_update_author
  on public.staff_announcements for update to authenticated
  using (
    author_user_id = (select auth.uid())
    and private.can_access_announcement(workspace_id, id)
  )
  with check (
    author_user_id = (select auth.uid())
    and private.can_access_announcement(workspace_id, id)
  );

create policy announcement_receipts_select_self
  on public.announcement_receipts for select to authenticated
  using (
    user_id = (select auth.uid())
    and private.can_access_announcement(workspace_id, announcement_id)
  );
create policy announcement_receipts_insert_self
  on public.announcement_receipts for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and private.can_access_announcement(workspace_id, announcement_id)
  );
create policy announcement_receipts_update_self
  on public.announcement_receipts for update to authenticated
  using (
    user_id = (select auth.uid())
    and private.can_access_announcement(workspace_id, announcement_id)
  )
  with check (
    user_id = (select auth.uid())
    and private.can_access_announcement(workspace_id, announcement_id)
  );

create policy guidance_records_select_assigned_counselor
  on public.guidance_records for select to authenticated
  using (private.can_access_guidance_record(workspace_id, id));
create policy guidance_records_insert_assigned_counselor
  on public.guidance_records for insert to authenticated
  with check (
    counselor_user_id = (select auth.uid())
    and created_by = (select auth.uid())
    and private.has_workspace_role(workspace_id, array['guidance_counselor']::text[])
    and exists (
      select 1
      from public.guidance_assignments as assignment
      where assignment.workspace_id = guidance_records.workspace_id
        and assignment.learner_id = guidance_records.learner_id
        and assignment.user_id = (select auth.uid())
        and assignment.starts_on <= current_date
        and (assignment.ends_on is null or assignment.ends_on >= current_date)
    )
  );
create policy guidance_records_update_assigned_counselor
  on public.guidance_records for update to authenticated
  using (private.can_access_guidance_record(workspace_id, id))
  with check (private.can_access_guidance_record(workspace_id, id));
create policy guidance_history_select_assigned_counselor
  on public.guidance_record_history for select to authenticated
  using (
    exists (
      select 1
      from public.guidance_records as record
      where record.workspace_id = guidance_record_history.workspace_id
        and record.id = guidance_record_history.guidance_record_id
        and private.can_access_guidance_record(record.workspace_id, record.id)
    )
  );

grant execute on function private.can_access_offering(uuid, uuid) to authenticated;
grant execute on function private.has_member_role(uuid, uuid, text[]) to authenticated;
grant execute on function private.can_access_activity(uuid, uuid) to authenticated;
grant execute on function private.can_access_warning(uuid, uuid) to authenticated;
grant execute on function private.can_access_support_case(uuid, uuid) to authenticated;
grant execute on function private.can_manage_support_case(uuid, uuid) to authenticated;
grant execute on function private.can_access_announcement(uuid, uuid) to authenticated;
grant execute on function private.can_access_guidance_record(uuid, uuid) to authenticated;
revoke all on function public.update_guidance_record(uuid, text)
  from public, anon, authenticated;
revoke all on function public.review_warning(uuid, uuid, text, text)
  from public, anon;
revoke all on function public.prepare_gradebook_activity_change() from public, anon, authenticated;
revoke all on function public.record_gradebook_activity_change() from public, anon, authenticated;
revoke all on function public.prepare_gradebook_score_change() from public, anon, authenticated;
revoke all on function public.record_gradebook_score_change() from public, anon, authenticated;
grant execute on function public.review_warning(uuid, uuid, text, text) to authenticated;
grant execute on function public.update_guidance_record(uuid, text) to authenticated;
