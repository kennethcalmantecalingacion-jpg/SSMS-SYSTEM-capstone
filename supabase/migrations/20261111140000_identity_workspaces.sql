create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create table public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,35}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index user_profiles_username_lower_key
  on public.user_profiles (lower(username));

create table public.platform_roles (
  role_key text primary key check (role_key = 'platform_operator'),
  created_at timestamptz not null default now()
);

insert into public.platform_roles (role_key)
values ('platform_operator')
on conflict (role_key) do nothing;

create table public.platform_user_roles (
  user_id uuid not null references auth.users (id) on delete restrict,
  role_key text not null references public.platform_roles (role_key) on delete restrict,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role_key)
);

create table public.platform_registration_invites (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique check (code_hash ~ '^[0-9a-f]{64}$'),
  email_restriction text check (email_restriction is null or email_restriction = lower(email_restriction)),
  expires_at timestamptz not null,
  max_redemptions integer not null check (max_redemptions between 1 and 20),
  redeemed_count integer not null default 0 check (redeemed_count >= 0),
  revoked_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (redeemed_count <= max_redemptions)
);

create table public.platform_registration_reservations (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.platform_registration_invites (id) on delete restrict,
  email text not null,
  status text not null default 'reserved'
    check (status in ('reserved', 'consumed', 'released', 'expired')),
  expires_at timestamptz not null,
  auth_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index platform_registration_reservations_active_idx
  on public.platform_registration_reservations (invite_id, expires_at)
  where status = 'reserved';

create table public.registration_rate_limits (
  bucket_key text primary key check (bucket_key ~ '^(email|source|global):[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  attempt_count integer not null check (attempt_count > 0)
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 2 and 100),
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_memberships (
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'revoked')),
  joined_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  primary key (workspace_id, user_id)
);

create index workspace_memberships_user_status_idx
  on public.workspace_memberships (user_id, status, workspace_id);

create table public.workspace_member_roles (
  workspace_id uuid not null,
  user_id uuid not null,
  role_key text not null check (role_key in (
    'workspace_owner',
    'workspace_administrator',
    'teacher',
    'adviser',
    'guidance_counselor',
    'parent_guardian'
  )),
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (workspace_id, user_id, role_key),
  foreign key (workspace_id, user_id)
    references public.workspace_memberships (workspace_id, user_id) on delete restrict
);

create table public.workspace_creation_grants (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique check (code_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  max_redemptions integer not null default 1 check (max_redemptions between 1 and 5),
  redeemed_count integer not null default 0 check (redeemed_count >= 0),
  revoked_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (redeemed_count <= max_redemptions)
);

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  email_restriction text not null check (email_restriction = lower(email_restriction)),
  role_key text not null check (role_key in (
    'workspace_administrator', 'teacher', 'adviser', 'guidance_counselor'
  )),
  code_hash text not null unique check (code_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  redeemed_by uuid references auth.users (id) on delete set null,
  redeemed_at timestamptz,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  check ((redeemed_by is null) = (redeemed_at is null))
);

create index workspace_invites_workspace_email_idx
  on public.workspace_invites (workspace_id, email_restriction, expires_at);

create table public.workspace_join_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null,
  unique (workspace_id, user_id, id),
  check ((status = 'pending') = (decided_at is null))
);

create unique index workspace_join_requests_one_pending_idx
  on public.workspace_join_requests (workspace_id, user_id)
  where status = 'pending';

create table public.workspace_audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete restrict,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_key text not null check (length(event_key) between 1 and 80),
  subject_user_id uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index workspace_audit_events_workspace_time_idx
  on public.workspace_audit_events (workspace_id, created_at desc);

create or replace function private.is_active_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_memberships as membership
    where membership.workspace_id = p_workspace_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;

create or replace function private.has_workspace_role(
  p_workspace_id uuid,
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
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and member_role.role_key = any (p_role_keys)
  );
$$;

create or replace function private.is_platform_operator(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_user_roles as platform_role
    where platform_role.user_id = p_user_id
      and platform_role.role_key = 'platform_operator'
  );
$$;

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
begin
  requested_username := lower(btrim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  if requested_username !~ '^[a-z0-9][a-z0-9_.-]{2,35}$' then
    requested_username := 'user-' || replace(left(new.id::text, 18), '-', '');
  end if;

  insert into public.user_profiles (user_id, username)
  values (new.id, requested_username);
  return new;
end;
$$;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_auth_user_created();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger user_profiles_set_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.platform_roles enable row level security;
alter table public.platform_user_roles enable row level security;
alter table public.platform_registration_invites enable row level security;
alter table public.platform_registration_reservations enable row level security;
alter table public.registration_rate_limits enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.workspace_member_roles enable row level security;
alter table public.workspace_creation_grants enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.workspace_join_requests enable row level security;
alter table public.workspace_audit_events enable row level security;

revoke all on public.user_profiles, public.platform_roles, public.platform_user_roles,
  public.platform_registration_invites, public.platform_registration_reservations,
  public.registration_rate_limits, public.workspaces, public.workspace_memberships,
  public.workspace_member_roles, public.workspace_creation_grants,
  public.workspace_invites, public.workspace_join_requests,
  public.workspace_audit_events from public, anon, authenticated;

grant select, update (username) on public.user_profiles to authenticated;
grant select on public.workspaces, public.workspace_memberships,
  public.workspace_member_roles, public.workspace_join_requests to authenticated;
grant select (id, workspace_id, email_restriction, role_key, expires_at,
  revoked_at, redeemed_by, redeemed_at, created_by, created_at)
  on public.workspace_invites to authenticated;
grant select on public.workspace_audit_events to authenticated;
grant all on public.user_profiles, public.platform_roles, public.platform_user_roles,
  public.platform_registration_invites, public.platform_registration_reservations,
  public.registration_rate_limits, public.workspaces, public.workspace_memberships,
  public.workspace_member_roles, public.workspace_creation_grants,
  public.workspace_invites, public.workspace_join_requests,
  public.workspace_audit_events to service_role;

create policy user_profiles_select_self
  on public.user_profiles for select to authenticated
  using (user_id = (select auth.uid()));

create policy user_profiles_update_self
  on public.user_profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy workspaces_select_active_members
  on public.workspaces for select to authenticated
  using (private.is_active_workspace_member(id));

create policy workspace_memberships_select_self_or_managers
  on public.workspace_memberships for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.has_workspace_role(
      workspace_id,
      array['workspace_owner', 'workspace_administrator']::text[]
    )
  );

create policy workspace_member_roles_select_self_or_managers
  on public.workspace_member_roles for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.has_workspace_role(
      workspace_id,
      array['workspace_owner', 'workspace_administrator']::text[]
    )
  );

create policy workspace_invites_select_managers
  on public.workspace_invites for select to authenticated
  using (
    private.has_workspace_role(
      workspace_id,
      array['workspace_owner', 'workspace_administrator']::text[]
    )
  );

create policy workspace_join_requests_select_requester_or_managers
  on public.workspace_join_requests for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.has_workspace_role(
      workspace_id,
      array['workspace_owner', 'workspace_administrator']::text[]
    )
  );

create policy workspace_audit_events_select_managers
  on public.workspace_audit_events for select to authenticated
  using (
    private.has_workspace_role(
      workspace_id,
      array['workspace_owner', 'workspace_administrator']::text[]
    )
  );

grant execute on function private.is_active_workspace_member(uuid) to authenticated;
grant execute on function private.has_workspace_role(uuid, text[]) to authenticated;
revoke all on function private.is_platform_operator(uuid) from public, anon, authenticated;
grant execute on function private.is_platform_operator(uuid) to service_role;
revoke all on function public.handle_auth_user_created() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

create or replace function public.record_registration_attempt(
  p_email_hash text,
  p_source_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  key_to_check text;
  current_attempts integer;
  within_limit boolean := true;
begin
  if p_email_hash is null or p_source_hash is null
    or p_email_hash !~ '^[0-9a-f]{64}$'
    or p_source_hash !~ '^[0-9a-f]{64}$' then
    return false;
  end if;

  delete from public.registration_rate_limits
  where window_started_at <= now() - interval '24 hours';

  foreach key_to_check in array array[
    'email:' || p_email_hash,
    'source:' || p_source_hash,
    'global:' || repeat('0', 64)
  ]
  loop
    insert into public.registration_rate_limits as current_bucket (
      bucket_key, window_started_at, attempt_count
    )
    values (key_to_check, now(), 1)
    on conflict (bucket_key) do update
      set window_started_at = case
            when current_bucket.window_started_at <= now() - interval '15 minutes'
              then now()
            else current_bucket.window_started_at
          end,
          attempt_count = case
            when current_bucket.window_started_at <= now() - interval '15 minutes'
              then 1
            else current_bucket.attempt_count + 1
          end
    returning attempt_count into current_attempts;

    if (key_to_check like 'global:%' and current_attempts > 3000)
      or (key_to_check not like 'global:%' and current_attempts > 10) then
      within_limit := false;
    end if;
  end loop;

  return within_limit;
end;
$$;

create or replace function public.reserve_registration_invite(
  p_code_hash text,
  p_email text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.platform_registration_invites%rowtype;
  active_reservations integer;
  reservation_id uuid;
begin
  if p_code_hash is null
    or p_code_hash !~ '^[0-9a-f]{64}$'
    or p_email <> lower(btrim(p_email))
    or length(p_email) > 254 then
    return null;
  end if;

  select * into invitation
  from public.platform_registration_invites
  where code_hash = p_code_hash
  for update;

  if not found or invitation.revoked_at is not null
    or invitation.expires_at <= now()
    or invitation.redeemed_count >= invitation.max_redemptions
    or (invitation.email_restriction is not null
      and invitation.email_restriction <> p_email) then
    return null;
  end if;

  update public.platform_registration_reservations
  set status = 'expired'
  where invite_id = invitation.id
    and status = 'reserved'
    and expires_at <= now();

  select count(*) into active_reservations
  from public.platform_registration_reservations
  where invite_id = invitation.id
    and status = 'reserved'
    and expires_at > now();

  if invitation.redeemed_count + active_reservations >= invitation.max_redemptions then
    return null;
  end if;

  insert into public.platform_registration_reservations (invite_id, email, expires_at)
  values (invitation.id, p_email, now() + interval '10 minutes')
  returning id into reservation_id;

  return reservation_id;
end;
$$;

create or replace function public.complete_registration_invite(
  p_reservation_id uuid,
  p_auth_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  reservation public.platform_registration_reservations%rowtype;
  invitation public.platform_registration_invites%rowtype;
begin
  select * into reservation
  from public.platform_registration_reservations
  where id = p_reservation_id
  for update;

  if not found then
    return false;
  end if;

  if reservation.status = 'consumed' then
    return reservation.auth_user_id = p_auth_user_id;
  end if;

  if reservation.status <> 'reserved' or reservation.expires_at <= now() then
    return false;
  end if;

  select * into invitation
  from public.platform_registration_invites
  where id = reservation.invite_id
  for update;

  if not found or invitation.revoked_at is not null
    or invitation.expires_at <= now()
    or invitation.redeemed_count >= invitation.max_redemptions then
    return false;
  end if;

  update public.platform_registration_reservations
  set status = 'consumed', auth_user_id = p_auth_user_id
  where id = reservation.id;

  update public.platform_registration_invites
  set redeemed_count = redeemed_count + 1
  where id = invitation.id;

  return true;
end;
$$;

create or replace function public.release_registration_invite(p_reservation_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.platform_registration_reservations
  set status = 'released'
  where id = p_reservation_id and status = 'reserved';
$$;

create or replace function public.issue_platform_registration_invite(
  p_actor_id uuid,
  p_code_hash text,
  p_email_restriction text,
  p_expires_at timestamptz,
  p_max_redemptions integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_id uuid;
begin
  if not private.is_platform_operator(p_actor_id) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_code_hash is null
    or p_code_hash !~ '^[0-9a-f]{64}$'
    or p_expires_at <= now() + interval '1 hour'
    or p_expires_at > now() + interval '30 days'
    or p_max_redemptions not between 1 and 20
    or (p_email_restriction is not null
      and (p_email_restriction <> lower(btrim(p_email_restriction))
        or length(p_email_restriction) > 254)) then
    raise exception 'invalid invitation parameters' using errcode = '22023';
  end if;

  insert into public.platform_registration_invites (
    code_hash, email_restriction, expires_at, max_redemptions, created_by
  )
  values (
    p_code_hash, p_email_restriction, p_expires_at, p_max_redemptions, p_actor_id
  )
  returning id into invite_id;
  return invite_id;
end;
$$;

create or replace function public.issue_workspace_creation_grant(
  p_actor_id uuid,
  p_code_hash text,
  p_expires_at timestamptz,
  p_max_redemptions integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  grant_id uuid;
begin
  if not private.is_platform_operator(p_actor_id) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_code_hash !~ '^[0-9a-f]{64}$'
    or p_expires_at <= now() + interval '1 hour'
    or p_expires_at > now() + interval '30 days'
    or p_max_redemptions not between 1 and 5 then
    raise exception 'invalid grant parameters' using errcode = '22023';
  end if;

  insert into public.workspace_creation_grants (
    code_hash, expires_at, max_redemptions, created_by
  )
  values (p_code_hash, p_expires_at, p_max_redemptions, p_actor_id)
  returning id into grant_id;
  return grant_id;
end;
$$;

create or replace function public.create_workspace_with_grant(
  p_user_id uuid,
  p_workspace_name text,
  p_code_hash text
)
returns table (workspace_id uuid, workspace_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  creation_grant public.workspace_creation_grants%rowtype;
  created_workspace_id uuid;
  normalized_name text := btrim(p_workspace_name);
begin
  if p_user_id is null or normalized_name is null
    or length(normalized_name) not between 2 and 100
    or p_code_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid workspace request' using errcode = '22023';
  end if;

  select * into creation_grant
  from public.workspace_creation_grants
  where code_hash = p_code_hash
  for update;

  if not found or creation_grant.revoked_at is not null
    or creation_grant.expires_at <= now()
    or creation_grant.redeemed_count >= creation_grant.max_redemptions then
    raise exception 'invalid or unavailable workspace grant' using errcode = '42501';
  end if;

  insert into public.workspaces (name, created_by)
  values (normalized_name, p_user_id)
  returning id into created_workspace_id;

  insert into public.workspace_memberships (
    workspace_id, user_id, status, created_by
  )
  values (created_workspace_id, p_user_id, 'active', p_user_id);

  insert into public.workspace_member_roles (
    workspace_id, user_id, role_key, granted_by
  )
  values (created_workspace_id, p_user_id, 'workspace_owner', p_user_id);

  insert into public.workspace_audit_events (
    workspace_id, actor_user_id, subject_user_id, event_key
  )
  values (created_workspace_id, p_user_id, p_user_id, 'workspace.created');

  update public.workspace_creation_grants
  set redeemed_count = redeemed_count + 1
  where id = creation_grant.id;

  return query select created_workspace_id, normalized_name;
end;
$$;

revoke all on function public.record_registration_attempt(text, text)
  from public, anon, authenticated;
revoke all on function public.reserve_registration_invite(text, text)
  from public, anon, authenticated;
revoke all on function public.complete_registration_invite(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.release_registration_invite(uuid)
  from public, anon, authenticated;
revoke all on function public.issue_platform_registration_invite(uuid, text, text, timestamptz, integer)
  from public, anon, authenticated;
revoke all on function public.issue_workspace_creation_grant(uuid, text, timestamptz, integer)
  from public, anon, authenticated;
revoke all on function public.create_workspace_with_grant(uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.record_registration_attempt(text, text) to service_role;
grant execute on function public.reserve_registration_invite(text, text) to service_role;
grant execute on function public.complete_registration_invite(uuid, uuid) to service_role;
grant execute on function public.release_registration_invite(uuid) to service_role;
grant execute on function public.issue_platform_registration_invite(uuid, text, text, timestamptz, integer)
  to service_role;
grant execute on function public.issue_workspace_creation_grant(uuid, text, timestamptz, integer)
  to service_role;
grant execute on function public.create_workspace_with_grant(uuid, text, text)
  to service_role;
