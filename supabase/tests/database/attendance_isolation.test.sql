create extension if not exists pgtap with schema extensions;

begin;

select plan(83);

select has_table('public', 'user_profiles', 'account profiles exist');
select has_table('public', 'workspaces', 'workspace records exist');
select has_table('public', 'learner_profiles', 'learner records exist');
select has_table('public', 'attendance_entries', 'attendance entries exist');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.attendance_entries'::regclass),
  'attendance entries have row-level security enabled'
);
select ok(
  not has_table_privilege('authenticated', 'public.attendance_entries', 'INSERT'),
  'clients cannot insert attendance entries outside the atomic save operation'
);
select ok(
  not has_table_privilege('authenticated', 'public.attendance_entries', 'DELETE'),
  'clients cannot delete attendance records'
);
select ok(
  has_table_privilege('authenticated', 'public.guidance_records', 'SELECT'),
  'guidance reads are exposed only through row-level security'
);
select ok(
  not has_table_privilege('authenticated', 'public.guidance_record_history', 'INSERT')
  and not has_table_privilege('authenticated', 'public.guidance_record_history', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.guidance_record_history', 'DELETE'),
  'guidance history is immutable to direct client writes'
);
select ok(
  not has_table_privilege('authenticated', 'public.guidance_records', 'UPDATE'),
  'guidance changes require the audited update operation'
);
select ok(
  has_function_privilege('authenticated', 'public.update_guidance_record(uuid,text)', 'EXECUTE'),
  'authenticated clients update guidance only through the audited operation'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.save_attendance_session(uuid,uuid,uuid,date,text,jsonb)',
    'EXECUTE'
  ),
  'authenticated clients can call the roster-validating attendance operation'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.create_learner_with_enrollment(uuid,text,text,uuid,uuid,date)',
    'EXECUTE'
  ),
  'authenticated clients can call the authorized learner creation operation'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.transfer_learner_enrollment(uuid,uuid,uuid,uuid,uuid,date)',
    'EXECUTE'
  ),
  'authenticated clients can call the authorized enrollment transfer operation'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.search_workspace_learners(uuid,text,integer,integer)',
    'EXECUTE'
  ),
  'authenticated clients can call the RLS-scoped learner search operation'
);
select ok(
  not has_table_privilege('authenticated', 'public.learner_profiles', 'INSERT')
  and not has_table_privilege('authenticated', 'public.learner_profiles', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.enrollments', 'INSERT')
  and not has_table_privilege('authenticated', 'public.enrollments', 'UPDATE'),
  'learner and enrollment writes require the atomic manager operations'
);
select ok(
  not has_table_privilege('authenticated', 'public.learner_profiles', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.learner_profile_history', 'INSERT')
  and not has_table_privilege('authenticated', 'public.learner_profile_history', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.learner_profile_history', 'DELETE'),
  'profile corrections are atomic and profile history is immutable to direct writes'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.update_learner_profile(uuid,uuid,text,text,text)',
    'EXECUTE'
  ),
  'authenticated clients can request manager-authorized learner profile corrections'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);

select ok(
  not private.can_record_attendance(
    '20000000-0000-0000-0000-000000000001',
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002'
  ),
  'Teacher assignment does not authorize attendance in another school year'
);
select is(
  (select count(*) from public.workspaces),
  1::bigint,
  'Workspace A teacher sees only the workspace they belong to'
);
select is(
  (select count(*) from public.learner_profiles),
  2::bigint,
  'Workspace A teacher sees the assigned section roster'
);
select is(
  (select count(*) from public.search_workspace_learners(
    '20000000-0000-0000-0000-000000000001', null, 1, 0
  )),
  1::bigint,
  'Directory search returns one result on a one-row page'
);
select is(
  (select max(total_count) from public.search_workspace_learners(
    '20000000-0000-0000-0000-000000000001', null, 1, 0
  )),
  2::bigint,
  'Directory pagination total includes only the assigned roster'
);
select is(
  (select count(*) from public.search_workspace_learners(
    '20000000-0000-0000-0000-000000000001', 'SYN-A-004', 50, 0
  )),
  0::bigint,
  'Historical school-year assignment does not expose a closed enrollment'
);
select is(
  (select count(*) from public.search_workspace_learners(
    '20000000-0000-0000-0000-000000000002', null, 50, 0
  )),
  0::bigint,
  'Forged Workspace B directory search returns no learners'
);
select is(
  (select count(*) from public.search_workspace_learners(
    '20000000-0000-0000-0000-000000000001', 'SYN-B', 50, 0
  )),
  0::bigint,
  'Directory text search does not reveal a different workspace learner'
);
select throws_ok(
  $$select * from public.search_workspace_learners(
    '20000000-0000-0000-0000-000000000001', null, 0, 0
  )$$,
  '22023',
  'Directory search rejects invalid page size'
);
select is(
  (select count(*) from public.learner_profiles
   where workspace_id = '20000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Workspace A teacher cannot read Workspace B learners'
);
select is(
  (select count(*) from public.workspace_memberships
   where workspace_id = '20000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Workspace A teacher cannot read Workspace B memberships'
);
select is(
  (select count(*) from public.workspace_invites
   where workspace_id = '20000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Workspace A teacher cannot read Workspace B invitations'
);
select is(
  (select count(*) from public.workspace_join_requests
   where workspace_id = '20000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Workspace A teacher cannot read Workspace B join requests'
);
select is(
  (select count(*) from public.workspace_audit_events
   where workspace_id = '20000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Workspace A teacher cannot read Workspace B audit events'
);
select throws_ok(
  $$insert into public.workspace_memberships (workspace_id, user_id)
    values ('20000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000004')$$,
  '42501',
  'Authenticated clients cannot directly create memberships'
);
select throws_ok(
  $$insert into public.workspace_invites (
      workspace_id, email_restriction, role_key, code_hash, expires_at, created_by
    ) values (
      '20000000-0000-0000-0000-000000000002',
      'teacher-a@example.test',
      'teacher',
      repeat('c', 64),
      now() + interval '1 day',
      '10000000-0000-0000-0000-000000000002'
    )$$,
  '42501',
  'Authenticated clients cannot directly create workspace invitations'
);
select throws_ok(
  $$insert into public.workspace_join_requests (workspace_id, user_id)
    values ('20000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000002')$$,
  '42501',
  'Authenticated clients cannot directly create join requests'
);
select throws_ok(
  $$insert into public.workspace_audit_events (
      workspace_id, actor_user_id, event_key
    ) values (
      '20000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000002',
      'forged.event'
    )$$,
  '42501',
  'Authenticated clients cannot forge workspace audit events'
);
select is(
  (select count(*) from public.attendance_entries),
  2::bigint,
  'Workspace A teacher reads their assigned attendance entries'
);
select is(
  (select count(*) from public.attendance_entries
   where workspace_id = '20000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Workspace A teacher cannot read Workspace B attendance'
);
select is(
  (select count(*) from public.guidance_records
   where workspace_id = '20000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Workspace A teacher cannot read Workspace B restricted guidance records'
);
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select is(
  (select count(*) from public.guidance_records
   where workspace_id = '20000000-0000-0000-0000-000000000002'),
  0::bigint,
  'Workspace B Owner cannot read confidential guidance records'
);
select throws_ok(
  $$select public.update_guidance_record(
    '60000000-0000-0000-0000-000000000002',
    'Unauthorized owner edit attempt.'
  )$$,
  '42501',
  'Workspace B Owner cannot update confidential guidance records'
);
select throws_ok(
  $$insert into public.guidance_records (
      workspace_id, learner_id, counselor_user_id, record_body, created_by
    ) values (
      '20000000-0000-0000-0000-000000000002',
      '40000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000003',
      'Unauthorized synthetic owner record.',
      '10000000-0000-0000-0000-000000000003'
    )$$,
  '42501',
  'Workspace B Owner cannot create confidential guidance records'
);
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
select is(
  (select count(*) from public.guidance_records
   where workspace_id = '20000000-0000-0000-0000-000000000002'),
  1::bigint,
  'Assigned Workspace B counselor can read their restricted guidance record'
);
select is(
  (with created as (
    insert into public.guidance_records (
      workspace_id, learner_id, counselor_user_id, record_body, created_by
    ) values (
      '20000000-0000-0000-0000-000000000002',
      '40000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000004',
      'Additional synthetic assigned-counselor fixture.',
      '10000000-0000-0000-0000-000000000004'
    )
    returning id
  )
  select count(*) from created),
  1::bigint,
  'Assigned counselor can create a synthetic record within their caseload'
);
select ok(
  public.update_guidance_record(
    '60000000-0000-0000-0000-000000000002',
    'Updated synthetic restricted guidance fixture.'
  ),
  'Assigned counselor updates guidance through the audited operation'
);
select is(
  (select count(*) from public.guidance_record_history
   where guidance_record_id = '60000000-0000-0000-0000-000000000002'),
  1::bigint,
  'Guidance update appends a history event'
);
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select throws_ok(
  $$select public.create_learner_with_enrollment(
    '20000000-0000-0000-0000-000000000001',
    'SYN-A-DENIED',
    'Unauthorized Synthetic Learner',
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '2026-11-11'
  )$$,
  '42501',
  'Assigned Teacher cannot create learners without workspace management authority'
);
select throws_ok(
  $$select public.transfer_learner_enrollment(
    '20000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000001',
    '32000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000001',
    '2026-11-11'
  )$$,
  '42501',
  'Assigned Teacher cannot transfer enrollment without workspace management authority'
);
select throws_ok(
  $$select public.update_learner_profile(
    '20000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'SYN-A-EDIT-DENIED',
    'Unauthorized Synthetic Change',
    'Synthetic unauthorized change attempt'
  )$$,
  '42501',
  'Assigned Teacher cannot edit learner profiles without workspace management authority'
);
select throws_ok(
  $$insert into public.attendance_entries default values$$,
  '42501',
  'Clients cannot directly insert attendance entries'
);
select throws_ok(
  $$update public.attendance_entries set status = 'absent'
    where workspace_id = '20000000-0000-0000-0000-000000000002'$$,
  '42501',
  'Clients cannot directly update attendance entries'
);
select throws_ok(
  $$delete from public.attendance_entries
    where workspace_id = '20000000-0000-0000-0000-000000000002'$$,
  '42501',
  'Clients cannot directly delete attendance entries'
);
select ok(
  public.save_attendance_session(
    '20000000-0000-0000-0000-000000000001',
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '2026-11-11',
    'synthetic-full-roster',
    '[
      {"learnerId":"40000000-0000-0000-0000-000000000001","status":"present"},
      {"learnerId":"40000000-0000-0000-0000-000000000002","status":"absent"}
    ]'::jsonb
  ) is not null,
  'Assigned teacher saves the complete section roster atomically'
);
select is(
  (select count(*)
   from public.attendance_entries as entry
   join public.attendance_sessions as session
     on session.workspace_id = entry.workspace_id
     and session.id = entry.attendance_session_id
   where session.session_key = 'synthetic-full-roster'),
  2::bigint,
  'Full-roster save persists one entry per enrolled learner'
);
select throws_ok(
  $$select public.save_attendance_session(
    '20000000-0000-0000-0000-000000000001',
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '2026-11-11',
    'synthetic-partial-roster',
    '[{"learnerId":"40000000-0000-0000-0000-000000000001","status":"present"}]'::jsonb
  )$$,
  '22023',
  'Partial roster is rejected'
);
select ok(
  public.correct_attendance_entry(
    '20000000-0000-0000-0000-000000000001',
    '51000000-0000-0000-0000-000000000001',
    'absent',
    'Synthetic correction reason'
  ),
  'Assigned teacher can make an attributable correction'
);
select is(
  (select count(*) from public.attendance_change_history
   where attendance_entry_id = '51000000-0000-0000-0000-000000000001'),
  1::bigint,
  'Correction creates an append-only history event'
);
select throws_ok(
  $$select public.correct_attendance_entry(
    '20000000-0000-0000-0000-000000000002',
    '51000000-0000-0000-0000-000000000003',
    'absent',
    'Synthetic cross-workspace attempt'
  )$$,
  '42501',
  'Workspace A teacher cannot correct Workspace B attendance'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is(
  (select count(*) from public.attendance_entries),
  0::bigint,
  'Workspace Owner without a teaching assignment cannot read attendance'
);
select throws_ok(
  $$select public.save_attendance_session(
    '20000000-0000-0000-0000-000000000001',
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '2026-11-11',
    'owner-unassigned-attempt',
    '[]'::jsonb
  )$$,
  '42501',
  'Workspace Owner without a teaching assignment cannot record attendance'
);
select throws_ok(
  $$insert into public.enrollments (
    workspace_id, learner_id, section_id, school_year_id, starts_on, created_by
  ) values (
    '20000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000003',
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '2026-08-01',
    '10000000-0000-0000-0000-000000000001'
  )$$,
  '23503',
  'Composite foreign keys reject a learner reference from another workspace'
);
select throws_ok(
  $$select public.create_learner_with_enrollment(
    '20000000-0000-0000-0000-000000000002',
    'SYN-B-DENIED',
    'Cross Workspace Synthetic Learner',
    '32000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    '2026-11-11'
  )$$,
  '42501',
  'Workspace A Owner cannot create a learner in Workspace B'
);
select throws_ok(
  $$select public.update_learner_profile(
    '20000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000003',
    'SYN-B-EDIT-DENIED',
    'Cross Workspace Synthetic Change',
    'Synthetic cross-workspace edit attempt'
  )$$,
  '42501',
  'Workspace A Owner cannot edit a Workspace B learner profile'
);
select ok(
  public.create_learner_with_enrollment(
    '20000000-0000-0000-0000-000000000001',
    'SYN-A-003',
    'Sample Learner A3',
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '2026-11-11'
  ) is not null,
  'Workspace Owner creates a learner and initial enrollment'
);
select is(
  (select count(*) from public.enrollments
   where workspace_id = '20000000-0000-0000-0000-000000000001'
     and learner_id = (select id from public.learner_profiles
       where workspace_id = '20000000-0000-0000-0000-000000000001'
         and learner_identifier = 'SYN-A-003')),
  1::bigint,
  'Learner creation atomically creates the initial enrollment'
);
select is(
  (select count(*) from public.workspace_audit_events
   where workspace_id = '20000000-0000-0000-0000-000000000001'
     and actor_user_id = '10000000-0000-0000-0000-000000000001'
     and event_key = 'learner.created'
     and metadata ->> 'learner_id' = (
       select id::text from public.learner_profiles
       where workspace_id = '20000000-0000-0000-0000-000000000001'
         and learner_identifier = 'SYN-A-003'
     )),
  1::bigint,
  'Learner creation records an attributable workspace audit event'
);
select throws_ok(
  $$insert into public.learner_profiles (
      workspace_id, learner_identifier, display_name, created_by
    ) values (
      '20000000-0000-0000-0000-000000000001',
      'SYN-A-DIRECT',
      'Direct Synthetic Learner',
      '10000000-0000-0000-0000-000000000001'
    )$$,
  '42501',
  'Workspace Owner cannot bypass atomic learner creation with direct inserts'
);
select throws_ok(
  $$insert into public.enrollments (
      workspace_id, learner_id, section_id, school_year_id, starts_on, created_by
    ) values (
      '20000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000001',
      '32000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000001',
      '2026-11-11',
      '10000000-0000-0000-0000-000000000001'
    )$$,
  '42501',
  'Workspace Owner cannot bypass transfer validation with direct enrollment inserts'
);
select throws_ok(
  $$select public.create_learner_with_enrollment(
    '20000000-0000-0000-0000-000000000001',
    'SYN-A-003',
    'Duplicate Synthetic Learner',
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '2026-11-11'
  )$$,
  '23505',
  'Duplicate learner identifier is rejected'
);
select is(
  (select count(*) from public.learner_profiles
   where workspace_id = '20000000-0000-0000-0000-000000000001'
     and learner_identifier = 'SYN-A-003'),
  1::bigint,
  'Failed duplicate creation leaves no partial learner record'
);
select ok(
  public.update_learner_profile(
    '20000000-0000-0000-0000-000000000001',
    (select id from public.learner_profiles
     where workspace_id = '20000000-0000-0000-0000-000000000001'
       and learner_identifier = 'SYN-A-003'),
    'SYN-A-003-EDITED',
    'Sample Learner A3 Updated',
    'Corrected synthetic learner name and identifier'
  ),
  'Workspace Owner updates an authorized learner profile'
);
select is(
  (select count(*) from public.learner_profile_history
   where workspace_id = '20000000-0000-0000-0000-000000000001'
     and old_learner_identifier = 'SYN-A-003'
     and new_learner_identifier = 'SYN-A-003-EDITED'
     and old_display_name = 'Sample Learner A3'
     and new_display_name = 'Sample Learner A3 Updated'
     and reason = 'Corrected synthetic learner name and identifier'
     and changed_by = '10000000-0000-0000-0000-000000000001'),
  1::bigint,
  'Learner profile correction retains prior values, reason, and actor'
);
select is(
  (select count(*) from public.workspace_audit_events
   where workspace_id = '20000000-0000-0000-0000-000000000001'
     and actor_user_id = '10000000-0000-0000-0000-000000000001'
     and event_key = 'learner.profile_updated'
     and metadata ->> 'learner_id' = (
       select id::text from public.learner_profiles
       where workspace_id = '20000000-0000-0000-0000-000000000001'
         and learner_identifier = 'SYN-A-003-EDITED'
     )),
  1::bigint,
  'Learner profile correction records an attributable workspace audit event'
);
select throws_ok(
  $$select public.update_learner_profile(
    '20000000-0000-0000-0000-000000000001',
    (select id from public.learner_profiles
     where workspace_id = '20000000-0000-0000-0000-000000000001'
       and learner_identifier = 'SYN-A-003-EDITED'),
    'SYN-A-001',
    'Duplicate Synthetic Identifier',
    'Synthetic duplicate identifier attempt'
  )$$,
  '23505',
  'Profile update rejects a duplicate workspace learner identifier'
);
select ok(
  exists (
    select 1 from public.learner_profiles
    where workspace_id = '20000000-0000-0000-0000-000000000001'
      and learner_identifier = 'SYN-A-003-EDITED'
      and display_name = 'Sample Learner A3 Updated'
  )
  and (select count(*) from public.learner_profile_history
       where learner_id = (
         select id from public.learner_profiles
         where workspace_id = '20000000-0000-0000-0000-000000000001'
           and learner_identifier = 'SYN-A-003-EDITED'
       )) = 1,
  'Failed duplicate profile correction leaves the profile and history unchanged'
);
select ok(
  public.transfer_learner_enrollment(
    '20000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000001',
    '32000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000001',
    '2026-11-11'
  ) is not null,
  'Workspace Owner transfers learner enrollment atomically'
);
select throws_ok(
  $$select public.transfer_learner_enrollment(
    '20000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000002',
    '41000000-0000-0000-0000-000000000002',
    '32000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000001',
    '2026-11-10'
  )$$,
  '22023',
  'Transfer cannot invalidate an existing attendance date'
);
select is(
  (select ends_on from public.enrollments
   where id = '41000000-0000-0000-0000-000000000001'),
  '2026-11-10'::date,
  'Transfer closes the previous enrollment before the new start date'
);
select is(
  (select count(*) from public.enrollments
   where workspace_id = '20000000-0000-0000-0000-000000000001'
     and learner_id = '40000000-0000-0000-0000-000000000001'
     and section_id = '32000000-0000-0000-0000-000000000003'
     and starts_on = '2026-11-11'),
  1::bigint,
  'Transfer records the new section enrollment'
);
select is(
  (select count(*) from public.workspace_audit_events
   where workspace_id = '20000000-0000-0000-0000-000000000001'
     and actor_user_id = '10000000-0000-0000-0000-000000000001'
     and event_key = 'enrollment.transferred'
     and metadata ->> 'learner_id' = '40000000-0000-0000-0000-000000000001'),
  1::bigint,
  'Enrollment transfer records an attributable workspace audit event'
);
select is(
  (select count(*) from public.attendance_entries
   where id = '51000000-0000-0000-0000-000000000001'),
  1::bigint,
  'Enrollment transfer preserves previously recorded attendance'
);

reset role;
update public.workspace_memberships
set status = 'revoked'
where workspace_id = '20000000-0000-0000-0000-000000000001'
  and user_id = '10000000-0000-0000-0000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select is(
  (select count(*) from public.workspaces),
  0::bigint,
  'Revoked member loses workspace access'
);
select throws_ok(
  $$select public.save_attendance_session(
    '20000000-0000-0000-0000-000000000001',
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '2026-11-11',
    'revoked-member-attempt',
    '[]'::jsonb
  )$$,
  '42501',
  'Revoked member cannot record attendance'
);

select * from finish();
rollback;
