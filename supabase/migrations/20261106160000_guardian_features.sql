-- Guardian (parent) features on the shared Maarej database:
-- profile details, who may see whom, behaviour badges given by parents, goals with a money reward,
-- parent <-> child wallet moves (reward money can only go back with the child's approval), in-app messages,
-- and one read function that returns everything the parent area needs.

-- ============ Profile details (parent and student edit their own) ============
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists job text,
  add column if not exists birth_year int check (birth_year between 1900 and 2100),
  add column if not exists area text,
  add column if not exists address text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists available_hours text,
  add column if not exists phone2 text,
  add column if not exists whatsapp text,
  add column if not exists about text;

-- ============ Who may see whom ============
create or replace function public.is_teacher_of_guardian(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.guardian_links gl
    where gl.guardian_id = g and gl.status = 'accepted' and public.is_teacher_of_student(gl.student_id));
$$;
create or replace function public.is_child_of(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.guardian_links gl where gl.guardian_id = g and gl.student_id = auth.uid() and gl.status = 'accepted');
$$;
-- Teacher t teaches me, or teaches one of my children.
create or replace function public.teaches_me_or_my_child(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members gm join public.groups g on g.id = gm.group_id
    where g.teacher_id = t and gm.status = 'accepted'
      and (gm.student_id = auth.uid() or public.is_guardian_of(gm.student_id)));
$$;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_teacher_of_student(id)
    or public.is_guardian_of(id)
    or public.is_teacher_of_guardian(id)
    or public.is_child_of(id)
    or public.teaches_me_or_my_child(id)
    or exists (select 1 from public.assistants a
      where (a.teacher_id = auth.uid() and a.user_id = profiles.id) or (a.user_id = auth.uid() and a.teacher_id = profiles.id))
  );

-- ============ Money: a withdrawal kind ============
alter table public.transfers drop constraint if exists transfers_kind_check;
alter table public.transfers add constraint transfers_kind_check
  check (kind in ('top_up','transfer','payment','commission','room_fee','reward_funding','reward_release','withdrawal'));

-- ============ Badges: parents can give behaviour badges ============
alter table public.badge_definitions drop constraint if exists badge_definitions_issuer_type_check;
alter table public.badge_definitions add constraint badge_definitions_issuer_type_check
  check (issuer_type in ('system','teacher','center','guardian'));
alter table public.badge_definitions add column if not exists category text not null default 'study'
  check (category in ('study','behavior'));

drop policy if exists badge_definitions_select on public.badge_definitions;
create policy badge_definitions_select on public.badge_definitions for select to authenticated
  using (issuer_type = 'system' or issuer_id = auth.uid()
    or exists (select 1 from public.badge_awards ba where ba.badge_id = badge_definitions.id
      and (ba.student_id = auth.uid() or public.is_guardian_of(ba.student_id) or public.is_teacher_of_student(ba.student_id))));
drop policy if exists badge_definitions_write on public.badge_definitions;
create policy badge_definitions_write on public.badge_definitions for all to authenticated
  using (issuer_type in ('teacher','guardian') and issuer_id = auth.uid())
  with check (issuer_type in ('teacher','guardian') and issuer_id = auth.uid());

insert into public.badge_definitions (issuer_type, issuer_id, name, icon, description, criteria, category) values
  ('system', null, 'مطيع', '🙏', 'بيسمع الكلام ويحترم الكبير', 'يتمنح من ولي الأمر', 'behavior'),
  ('system', null, 'مرتّب', '🧹', 'أوضته وحاجته منظمة', 'يتمنح من ولي الأمر', 'behavior'),
  ('system', null, 'صادق', '🤍', 'بيقول الحقيقة حتى لو صعبة', 'يتمنح من ولي الأمر', 'behavior'),
  ('system', null, 'إيد مساعدة', '🤲', 'بيساعد في البيت من غير ما حد يطلب', 'يتمنح من ولي الأمر', 'behavior'),
  ('system', null, 'صاحي بدري', '⏰', 'بيصحى في ميعاده من نفسه', 'يتمنح من ولي الأمر', 'behavior'),
  ('system', null, 'أخ كبير', '🫶', 'بيراعي إخواته', 'يتمنح من ولي الأمر', 'behavior');

create or replace function public.guardian_award_badge(p_badge_id uuid, p_student_id uuid, p_note text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare b public.badge_definitions%rowtype; aid uuid;
begin
  if not public.is_guardian_of(p_student_id) then raise exception 'ده مش ابنك'; end if;
  select * into b from public.badge_definitions where id = p_badge_id and is_active;
  if not found then raise exception 'البادج مش موجودة'; end if;
  if not (b.issuer_type = 'system' or (b.issuer_type = 'guardian' and b.issuer_id = auth.uid())) then raise exception 'البادج دي مش متاحة لك'; end if;
  insert into public.badge_awards(badge_id, student_id, awarded_by, note) values (p_badge_id, p_student_id, auth.uid(), p_note)
  returning id into aid;
  return aid;
end $$;

-- ============ Goals with a money reward (parent funds into escrow; releases or cancels later) ============
alter table public.rewards add column if not exists kind text not null default 'reward' check (kind in ('reward','goal'));
alter table public.rewards add column if not exists due_date date;
alter table public.rewards add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.rewards add column if not exists cancel_transfer_id uuid references public.transfers(id);

create or replace function public.guardian_create_goal(p_student_id uuid, p_title text, p_condition text, p_amount numeric, p_due date default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare gw uuid; t_id uuid; rid uuid;
begin
  if not public.is_guardian_of(p_student_id) then raise exception 'ده مش ابنك'; end if;
  if coalesce(p_amount, 0) <= 0 then raise exception 'حدد مبلغ المكافأة'; end if;
  if coalesce(trim(p_title), '') = '' then raise exception 'اكتب الهدف'; end if;
  gw := public.ensure_wallet('guardian', auth.uid());
  insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, reference_type, note, created_by)
  values (gw, public.system_wallet('reward_escrow'), p_amount, 'reward_funding', 'goal', p_title, auth.uid())
  returning id into t_id;
  insert into public.rewards(student_id, funder_wallet_id, amount, title, condition, status, funding_transfer_id, kind, due_date, created_by)
  values (p_student_id, gw, p_amount, p_title, p_condition, 'funded', t_id, 'goal', p_due, auth.uid())
  returning id into rid;
  return rid;
end $$;

-- The funder takes a goal back before it is released; the money returns to the funder's wallet.
create or replace function public.cancel_reward(p_reward_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare r public.rewards%rowtype; t_id uuid;
begin
  select * into r from public.rewards where id = p_reward_id for update;
  if not found then raise exception 'المكافأة مش موجودة'; end if;
  if r.status <> 'funded' then raise exception 'المكافأة دي اتقفلت قبل كده'; end if;
  if not public.owns_wallet(r.funder_wallet_id) then raise exception 'مش مسموح'; end if;
  insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, reference_type, reference_id, note, created_by)
  values (public.system_wallet('reward_escrow'), r.funder_wallet_id, r.amount, 'transfer', 'reward_cancel', r.id, r.title, auth.uid())
  returning id into t_id;
  update public.rewards set status = 'cancelled', cancel_transfer_id = t_id where id = r.id;
  return t_id;
end $$;

-- ============ Child money: what the parent may take back ============
-- Reward money (anything released to the child from a reward or goal) is protected: it only goes back to the
-- parent with the child's approval. Spending is assumed to use non-reward money first.
create or replace function public.child_money(p_student_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare w uuid; bal numeric := 0; rin numeric := 0; rout numeric := 0; protected numeric;
begin
  if not (p_student_id = auth.uid() or public.is_guardian_of(p_student_id)) then raise exception 'مش مسموح'; end if;
  select id, balance into w, bal from public.wallets where owner_type = 'student' and owner_id = p_student_id;
  if w is not null then
    select coalesce(sum(amount), 0) into rin from public.transfers where to_wallet_id = w and kind = 'reward_release';
    select coalesce(sum(amount), 0) into rout from public.transfers where from_wallet_id = w and kind = 'withdrawal' and reference_type = 'reward_return';
  end if;
  protected := least(coalesce(bal, 0), greatest(0, rin - rout));
  return jsonb_build_object('balance', coalesce(bal, 0), 'reward', protected, 'free', coalesce(bal, 0) - protected);
end $$;

create or replace function public.guardian_deposit(p_student_id uuid, p_amount numeric, p_note text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare t_id uuid;
begin
  if not public.is_guardian_of(p_student_id) then raise exception 'ده مش ابنك'; end if;
  if coalesce(p_amount, 0) <= 0 then raise exception 'المبلغ لازم يكون أكبر من صفر'; end if;
  insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, reference_type, note, created_by)
  values (public.ensure_wallet('guardian', auth.uid()), public.ensure_wallet('student', p_student_id), p_amount, 'transfer', 'guardian_deposit', p_note, auth.uid())
  returning id into t_id;
  return t_id;
end $$;

create or replace function public.guardian_withdraw(p_student_id uuid, p_amount numeric) returns uuid
language plpgsql security definer set search_path = public as $$
declare m jsonb; t_id uuid;
begin
  if not public.is_guardian_of(p_student_id) then raise exception 'ده مش ابنك'; end if;
  if coalesce(p_amount, 0) <= 0 then raise exception 'المبلغ لازم يكون أكبر من صفر'; end if;
  m := public.child_money(p_student_id);
  if p_amount > (m->>'free')::numeric then raise exception 'المبلغ أكبر من الرصيد المتاح للسحب (فلوس المكافآت محتاجة موافقة ابنك)'; end if;
  insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, reference_type, created_by)
  values (public.ensure_wallet('student', p_student_id), public.ensure_wallet('guardian', auth.uid()), p_amount, 'withdrawal', 'guardian_withdraw', auth.uid())
  returning id into t_id;
  return t_id;
end $$;

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  transfer_id uuid references public.transfers(id),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
alter table public.withdrawal_requests enable row level security;
create policy withdrawal_requests_select on public.withdrawal_requests for select to authenticated
  using (guardian_id = auth.uid() or student_id = auth.uid());

create or replace function public.guardian_request_reward_withdrawal(p_student_id uuid, p_amount numeric, p_note text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare m jsonb; rid uuid;
begin
  if not public.is_guardian_of(p_student_id) then raise exception 'ده مش ابنك'; end if;
  if coalesce(p_amount, 0) <= 0 then raise exception 'المبلغ لازم يكون أكبر من صفر'; end if;
  m := public.child_money(p_student_id);
  if p_amount > (m->>'reward')::numeric then raise exception 'المبلغ أكبر من فلوس المكافآت عند ابنك'; end if;
  insert into public.withdrawal_requests(guardian_id, student_id, amount, note) values (auth.uid(), p_student_id, p_amount, p_note)
  returning id into rid;
  return rid;
end $$;

-- The child approves (money goes back to the parent) or refuses.
create or replace function public.decide_withdrawal(p_request_id uuid, p_approve boolean) returns text
language plpgsql security definer set search_path = public as $$
declare q public.withdrawal_requests%rowtype; t_id uuid;
begin
  select * into q from public.withdrawal_requests where id = p_request_id for update;
  if not found then raise exception 'الطلب مش موجود'; end if;
  if q.student_id <> auth.uid() then raise exception 'الطلب ده مش ليك'; end if;
  if q.status <> 'pending' then raise exception 'الطلب ده اتقرر قبل كده'; end if;
  if p_approve then
    insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, reference_type, reference_id, created_by)
    values (public.ensure_wallet('student', q.student_id), public.ensure_wallet('guardian', q.guardian_id), q.amount, 'withdrawal', 'reward_return', q.id, auth.uid())
    returning id into t_id;
    update public.withdrawal_requests set status = 'approved', transfer_id = t_id, decided_at = now() where id = q.id;
    return 'approved';
  end if;
  update public.withdrawal_requests set status = 'rejected', decided_at = now() where id = q.id;
  return 'rejected';
end $$;

-- ============ Messages inside the app ============
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.students(user_id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
alter table public.messages enable row level security;
create or replace function public.can_contact(other uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.teaches_me_or_my_child(other) or public.is_teacher_of_student(other) or public.is_teacher_of_guardian(other)
      or public.is_guardian_of(other) or public.is_child_of(other);
$$;
create policy messages_select on public.messages for select to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy messages_insert on public.messages for insert to authenticated with check (sender_id = auth.uid() and public.can_contact(recipient_id));
create policy messages_read on public.messages for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- ============ Link a child by phone (the parent can't search profiles directly) ============
create or replace function public.guardian_link_child_by_phone(p_phone text) returns uuid
language plpgsql security definer set search_path = public as $$
declare sid uuid;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'parent') then raise exception 'لولي الأمر بس'; end if;
  select id into sid from public.profiles where phone = p_phone and role = 'student';
  if sid is null then raise exception 'مفيش طالب مسجّل بالرقم ده'; end if;
  insert into public.guardian_links(guardian_id, student_id) values (auth.uid(), sid) on conflict do nothing;
  return sid;
end $$;

-- ============ Everything the parent area shows, in one call ============
create or replace function public.guardian_overview() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare me public.profiles%rowtype; gw uuid; result jsonb; kids jsonb;
begin
  select * into me from public.profiles where id = auth.uid();
  if not found or me.role <> 'parent' then raise exception 'لولي الأمر بس'; end if;
  select id into gw from public.wallets where owner_type = 'guardian' and owner_id = me.id;

  select coalesce(jsonb_agg(k order by k->>'name'), '[]'::jsonb) into kids from (
    select jsonb_build_object(
      'id', p.id, 'name', p.full_name, 'avatar', p.avatar_url, 'phone', p.phone,
      'stage', s.stage, 'school', s.school_name,
      'money', public.child_money(p.id),
      'groups', coalesce((select jsonb_agg(jsonb_build_object(
          'id', g.id, 'name', g.name, 'subject', g.subject, 'price', g.price_per_session, 'online', g.is_online,
          'center', c.name,
          'teacher', jsonb_build_object('id', t.id, 'name', t.full_name, 'phone', t.phone, 'whatsapp', t.whatsapp, 'avatar', t.avatar_url),
          'schedule', coalesce((select jsonb_agg(jsonb_build_object('day', gs.day_of_week, 'start', gs.start_time, 'end', gs.end_time) order by gs.day_of_week) from public.group_schedules gs where gs.group_id = g.id), '[]'::jsonb),
          'monthSessions', (select count(*) from public.sessions se where se.group_id = g.id and se.status <> 'cancelled'
              and date_trunc('month', se.starts_at at time zone 'Africa/Cairo') = date_trunc('month', now() at time zone 'Africa/Cairo')),
          'attendance', jsonb_build_object(
              'present', (select count(*) from public.attendance a join public.sessions se on se.id = a.session_id where se.group_id = g.id and a.student_id = p.id and a.status in ('present','late')),
              'absent', (select count(*) from public.attendance a join public.sessions se on se.id = a.session_id where se.group_id = g.id and a.student_id = p.id and a.status = 'absent'),
              'late', (select count(*) from public.attendance a join public.sessions se on se.id = a.session_id where se.group_id = g.id and a.student_id = p.id and a.status = 'late')),
          'homework', jsonb_build_object(
              'done', (select count(*) from public.homework h join public.homework_submissions hs on hs.homework_id = h.id where h.group_id = g.id and hs.student_id = p.id and hs.status in ('submitted','late','reviewed')),
              'total', (select count(*) from public.homework h where h.group_id = g.id)),
          'exams', coalesce((select jsonb_agg(jsonb_build_object('title', e.title, 'date', e.exam_date, 'max', e.max_score, 'score', er.score) order by e.exam_date) from public.exams e left join public.exam_results er on er.exam_id = e.id and er.student_id = p.id where e.group_id = g.id), '[]'::jsonb),
          'invoices', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'period', i.period_start, 'amount', i.amount, 'paid', i.paid_amount,
                'status', case when i.status in ('due','partial') and i.due_date < (now() at time zone 'Africa/Cairo')::date then 'overdue' else i.status end, 'due', i.due_date,
                'payments', coalesce((select jsonb_agg(jsonb_build_object('amount', pa.amount, 'method', pa.method, 'at', pa.paid_at) order by pa.paid_at) from public.payments pa where pa.invoice_id = i.id), '[]'::jsonb)
              ) order by i.period_start desc) from public.invoices i where i.group_id = g.id and i.student_id = p.id), '[]'::jsonb)
        ) order by g.subject)
        from public.group_members gm join public.groups g on g.id = gm.group_id
        join public.profiles t on t.id = g.teacher_id
        left join public.centers c on c.id = g.center_id
        where gm.student_id = p.id and gm.status = 'accepted'), '[]'::jsonb),
      'badges', coalesce((select jsonb_agg(jsonb_build_object('id', ba.id, 'name', bd.name, 'icon', bd.icon, 'category', bd.category,
            'from', fp.full_name, 'fromRole', fp.role, 'note', ba.note, 'at', ba.created_at) order by ba.created_at desc)
          from public.badge_awards ba join public.badge_definitions bd on bd.id = ba.badge_id left join public.profiles fp on fp.id = ba.awarded_by
          where ba.student_id = p.id), '[]'::jsonb),
      'rewards', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'title', r.title, 'condition', r.condition, 'amount', r.amount,
            'status', r.status, 'kind', r.kind, 'due', r.due_date, 'mine', (r.funder_wallet_id = gw), 'at', r.created_at) order by r.created_at desc)
          from public.rewards r where r.student_id = p.id), '[]'::jsonb),
      'withdrawals', coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'amount', q.amount, 'status', q.status, 'at', q.created_at, 'note', q.note) order by q.created_at desc)
          from public.withdrawal_requests q where q.student_id = p.id and q.guardian_id = me.id), '[]'::jsonb)
    ) k
    from public.guardian_links gl join public.profiles p on p.id = gl.student_id left join public.students s on s.user_id = p.id
    where gl.guardian_id = me.id and gl.status = 'accepted'
  ) x;

  result := jsonb_build_object(
    'me', jsonb_build_object('id', me.id, 'name', me.full_name, 'phone', me.phone, 'phone2', me.phone2, 'whatsapp', me.whatsapp,
        'avatar', me.avatar_url, 'job', me.job, 'birthYear', me.birth_year, 'area', me.area, 'address', me.address,
        'lat', me.lat, 'lng', me.lng, 'availableHours', me.available_hours, 'about', me.about),
    'wallet', coalesce((select balance from public.wallets where id = gw), 0),
    'ledger', coalesce((select jsonb_agg(jsonb_build_object('id', tr.id, 'kind', tr.kind, 'ref', tr.reference_type, 'amount', tr.amount,
          'dir', case when tr.to_wallet_id = gw then 'in' else 'out' end, 'note', tr.note, 'at', tr.created_at,
          'other', (select coalesce(op.full_name, '') from public.wallets ow left join public.profiles op on op.id = ow.owner_id
                    where ow.id = case when tr.to_wallet_id = gw then tr.from_wallet_id else tr.to_wallet_id end)) order by tr.created_at desc)
        from public.transfers tr where gw is not null and (tr.from_wallet_id = gw or tr.to_wallet_id = gw)), '[]'::jsonb),
    'behaviorBadges', coalesce((select jsonb_agg(jsonb_build_object('id', bd.id, 'name', bd.name, 'icon', bd.icon, 'mine', bd.issuer_type = 'guardian'))
        from public.badge_definitions bd where bd.is_active and bd.category = 'behavior' and (bd.issuer_type = 'system' or bd.issuer_id = me.id)), '[]'::jsonb),
    'children', kids);
  return result;
end $$;

-- What a student sees about their own money and their parent's requests.
create or replace function public.my_withdrawal_requests() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'amount', q.amount, 'note', q.note, 'status', q.status, 'at', q.created_at, 'from', p.full_name) order by q.created_at desc), '[]'::jsonb)
  from public.withdrawal_requests q join public.profiles p on p.id = q.guardian_id where q.student_id = auth.uid();
$$;

-- ============ Privileges: signed-in users only ============
revoke execute on function public.is_teacher_of_guardian(uuid) from public, anon;
revoke execute on function public.is_child_of(uuid) from public, anon;
revoke execute on function public.teaches_me_or_my_child(uuid) from public, anon;
revoke execute on function public.can_contact(uuid) from public, anon;
revoke execute on function public.guardian_award_badge(uuid, uuid, text) from public, anon;
revoke execute on function public.guardian_create_goal(uuid, text, text, numeric, date) from public, anon;
revoke execute on function public.cancel_reward(uuid) from public, anon;
revoke execute on function public.child_money(uuid) from public, anon;
revoke execute on function public.guardian_deposit(uuid, numeric, text) from public, anon;
revoke execute on function public.guardian_withdraw(uuid, numeric) from public, anon;
revoke execute on function public.guardian_request_reward_withdrawal(uuid, numeric, text) from public, anon;
revoke execute on function public.decide_withdrawal(uuid, boolean) from public, anon;
revoke execute on function public.guardian_link_child_by_phone(text) from public, anon;
revoke execute on function public.guardian_overview() from public, anon;
revoke execute on function public.my_withdrawal_requests() from public, anon;
grant execute on function public.is_teacher_of_guardian(uuid) to authenticated;
grant execute on function public.is_child_of(uuid) to authenticated;
grant execute on function public.teaches_me_or_my_child(uuid) to authenticated;
grant execute on function public.can_contact(uuid) to authenticated;
grant execute on function public.guardian_award_badge(uuid, uuid, text) to authenticated;
grant execute on function public.guardian_create_goal(uuid, text, text, numeric, date) to authenticated;
grant execute on function public.cancel_reward(uuid) to authenticated;
grant execute on function public.child_money(uuid) to authenticated;
grant execute on function public.guardian_deposit(uuid, numeric, text) to authenticated;
grant execute on function public.guardian_withdraw(uuid, numeric) to authenticated;
grant execute on function public.guardian_request_reward_withdrawal(uuid, numeric, text) to authenticated;
grant execute on function public.decide_withdrawal(uuid, boolean) to authenticated;
grant execute on function public.guardian_link_child_by_phone(text) to authenticated;
grant execute on function public.guardian_overview() to authenticated;
grant execute on function public.my_withdrawal_requests() to authenticated;
