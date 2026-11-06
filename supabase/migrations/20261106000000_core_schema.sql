-- Maarej core schema: teacher dashboard + student area + guardians + internal wallet ledger + badges/rewards.
-- Money is internal only (no gateway). Every money movement is an immutable row in `transfers`.
-- Balances are maintained by a trigger on `transfers`. Writes to money go through security-definer functions.

-- ============ Identity ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','parent','teacher','assistant','center_owner')),
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table public.teacher_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  subjects text[] not null default '{}',
  stages text[] not null default '{}',
  bio text,
  created_at timestamptz not null default now()
);

create table public.assistants (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(user_id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  permissions text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (teacher_id, user_id)
);

create table public.students (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stage text,
  education_system text check (education_system in ('normal','azhar','private')),
  school_name text
);

create table public.guardian_links (
  guardian_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  permissions jsonb not null default '{"grades":false,"attendance":true,"payments":true,"notes":false}',
  primary key (guardian_id, student_id)
);

-- ============ Centers (separate entity) ============
create table public.centers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  name text not null,
  capacity int not null check (capacity > 0)
);

-- ============ Groups, schedule, sessions ============
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(user_id) on delete cascade,
  name text not null,
  subject text not null,
  stage text,
  center_id uuid references public.centers(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  is_online boolean not null default false,
  capacity int not null default 20 check (capacity > 0),
  price_per_session numeric(10,2) not null default 0 check (price_per_session >= 0),
  billing_period text not null default 'month' check (billing_period in ('session','month')),
  status text not null default 'active' check (status in ('active','closed')),
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','accepted','refused','left')),
  joined_at timestamptz not null default now(),
  primary key (group_id, student_id)
);

create table public.group_schedules (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','held','cancelled')),
  check (ends_at > starts_at)
);

create table public.attendance (
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  status text not null check (status in ('present','absent','late','excused')),
  marked_by uuid references public.profiles(id) on delete set null,
  marked_at timestamptz not null default now(),
  primary key (session_id, student_id)
);

-- ============ Homework & exams ============
create table public.homework (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.homework_submissions (
  homework_id uuid not null references public.homework(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  status text not null default 'missing' check (status in ('submitted','late','missing','reviewed')),
  submitted_at timestamptz,
  primary key (homework_id, student_id)
);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  exam_date timestamptz,
  max_score numeric(6,2) not null default 100 check (max_score > 0)
);

create table public.exam_results (
  exam_id uuid not null references public.exams(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  score numeric(6,2),
  published_at timestamptz,
  primary key (exam_id, student_id)
);

-- ============ Wallets & immutable ledger ============
create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('system','student','teacher','center','guardian')),
  owner_id uuid,
  system_key text unique,
  balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  check ((owner_type = 'system') = (system_key is not null)),
  check ((owner_type = 'system') = (owner_id is null)),
  unique (owner_type, owner_id)
);

create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  from_wallet_id uuid not null references public.wallets(id),
  to_wallet_id uuid not null references public.wallets(id),
  amount numeric(12,2) not null check (amount > 0),
  kind text not null check (kind in ('top_up','transfer','payment','commission','room_fee','reward_funding','reward_release')),
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (from_wallet_id <> to_wallet_id)
);

create or replace function public.apply_transfer() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  from_type text;
  from_bal numeric;
begin
  select owner_type, balance into from_type, from_bal
  from public.wallets where id = new.from_wallet_id for update;

  if from_type <> 'system' and from_bal < new.amount then
    raise exception 'الرصيد غير كافٍ';
  end if;

  update public.wallets set balance = balance - new.amount where id = new.from_wallet_id;
  update public.wallets set balance = balance + new.amount where id = new.to_wallet_id;
  return new;
end $$;

create trigger transfers_apply before insert on public.transfers
for each row execute function public.apply_transfer();

create or replace function public.forbid_ledger_change() returns trigger
language plpgsql as $$
begin
  raise exception 'الحركات المالية مبتتعدلش ولا بتتمسحش';
end $$;

create trigger transfers_immutable before update or delete on public.transfers
for each row execute function public.forbid_ledger_change();

create or replace function public.ensure_wallet(p_owner_type text, p_owner_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare w uuid;
begin
  insert into public.wallets(owner_type, owner_id) values (p_owner_type, p_owner_id)
  on conflict (owner_type, owner_id) do nothing;
  select id into w from public.wallets where owner_type = p_owner_type and owner_id = p_owner_id;
  return w;
end $$;

create or replace function public.system_wallet(p_key text) returns uuid
language plpgsql security definer set search_path = public as $$
declare w uuid;
begin
  insert into public.wallets(owner_type, system_key) values ('system', p_key)
  on conflict (system_key) do nothing;
  select id into w from public.wallets where system_key = p_key;
  return w;
end $$;

-- ============ Invoices & payments ============
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  period_start date not null,
  period_end date not null,
  amount numeric(10,2) not null check (amount >= 0),
  paid_amount numeric(10,2) not null default 0 check (paid_amount >= 0),
  status text not null default 'due' check (status in ('due','partial','paid','overdue','waived')),
  due_date date,
  created_at timestamptz not null default now(),
  unique (group_id, student_id, period_start)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  method text not null check (method in ('cash','wallet','card','transfer')),
  transfer_id uuid references public.transfers(id),
  recorded_by uuid references public.profiles(id) on delete set null,
  paid_at timestamptz not null default now()
);

-- ============ Badges & rewards ============
create table public.badge_definitions (
  id uuid primary key default gen_random_uuid(),
  issuer_type text not null check (issuer_type in ('system','teacher','center')),
  issuer_id uuid,
  name text not null,
  icon text not null,
  description text,
  criteria text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check ((issuer_type = 'system') = (issuer_id is null))
);

create table public.badge_awards (
  id uuid primary key default gen_random_uuid(),
  badge_id uuid not null references public.badge_definitions(id) on delete restrict,
  student_id uuid not null references public.students(user_id) on delete cascade,
  awarded_by uuid references public.profiles(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  funder_wallet_id uuid not null references public.wallets(id),
  amount numeric(12,2) not null check (amount > 0),
  title text not null,
  condition text,
  badge_award_id uuid references public.badge_awards(id) on delete set null,
  status text not null default 'funded' check (status in ('funded','released','cancelled')),
  funding_transfer_id uuid references public.transfers(id),
  release_transfer_id uuid references public.transfers(id),
  created_at timestamptz not null default now(),
  released_at timestamptz
);

-- ============ Helper predicates for RLS ============
create or replace function public.is_group_teacher(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.groups gr
    where gr.id = g and (
      gr.teacher_id = auth.uid()
      or exists (select 1 from public.assistants a where a.teacher_id = gr.teacher_id and a.user_id = auth.uid())
    )
  );
$$;

create or replace function public.is_group_student(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = g and gm.student_id = auth.uid() and gm.status = 'accepted'
  );
$$;

create or replace function public.is_guardian_of(s uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.guardian_links gl
    where gl.student_id = s and gl.guardian_id = auth.uid() and gl.status = 'accepted'
  );
$$;

create or replace function public.is_teacher_of_student(s uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members gm
    where gm.student_id = s and gm.status = 'accepted' and public.is_group_teacher(gm.group_id)
  );
$$;

create or replace function public.owns_wallet(w uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.wallets wl
    where wl.id = w and (
      wl.owner_id = auth.uid()
      or (wl.owner_type = 'center' and exists (select 1 from public.centers c where c.id = wl.owner_id and c.owner_id = auth.uid()))
    )
  );
$$;

-- ============ Money functions (the only write path for money) ============
create or replace function public.top_up_own_wallet(p_amount numeric) returns uuid
language plpgsql security definer set search_path = public as $$
declare t_id uuid;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'student') then
    raise exception 'الشحن للطالب بس';
  end if;
  insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, created_by)
  values (public.system_wallet('external_inflow'), public.ensure_wallet('student', auth.uid()), p_amount, 'top_up', auth.uid())
  returning id into t_id;
  return t_id;
end $$;

create or replace function public.transfer_funds(p_from_wallet uuid, p_to_wallet uuid, p_amount numeric, p_kind text, p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare t_id uuid;
begin
  if not public.owns_wallet(p_from_wallet) then raise exception 'المحفظة دي مش بتاعتك'; end if;
  if p_kind not in ('transfer','commission','room_fee') then raise exception 'نوع الحركة غير مسموح'; end if;
  insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, note, created_by)
  values (p_from_wallet, p_to_wallet, p_amount, p_kind, p_note, auth.uid())
  returning id into t_id;
  return t_id;
end $$;

create or replace function public.record_payment(p_invoice_id uuid, p_amount numeric, p_method text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  inv public.invoices%rowtype;
  g public.groups%rowtype;
  from_w uuid;
  to_w uuid;
  t_id uuid;
  pay_id uuid;
begin
  select * into inv from public.invoices where id = p_invoice_id for update;
  if not found then raise exception 'الفاتورة مش موجودة'; end if;
  select * into g from public.groups where id = inv.group_id;

  if not public.is_group_teacher(inv.group_id) then raise exception 'مش مسموح'; end if;
  if p_amount > inv.amount - inv.paid_amount then raise exception 'المبلغ أكبر من المتبقي'; end if;

  if p_method = 'wallet' then
    from_w := public.ensure_wallet('student', inv.student_id);
  else
    from_w := public.system_wallet('external_inflow');
  end if;
  to_w := public.ensure_wallet('teacher', g.teacher_id);

  insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, reference_type, reference_id, created_by)
  values (from_w, to_w, p_amount, 'payment', 'invoice', inv.id, auth.uid())
  returning id into t_id;

  insert into public.payments(invoice_id, amount, method, transfer_id, recorded_by)
  values (inv.id, p_amount, p_method, t_id, auth.uid())
  returning id into pay_id;

  update public.invoices
  set paid_amount = paid_amount + p_amount,
      status = case when paid_amount + p_amount >= amount then 'paid' else 'partial' end
  where id = inv.id;

  return pay_id;
end $$;

create or replace function public.award_badge(
  p_badge_id uuid, p_student_id uuid, p_session_id uuid, p_note text,
  p_bonus numeric, p_reward_title text, p_reward_condition text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  b public.badge_definitions%rowtype;
  award_id uuid;
  teacher_w uuid;
  t_id uuid;
begin
  select * into b from public.badge_definitions where id = p_badge_id and is_active;
  if not found then raise exception 'البادج مش موجودة'; end if;
  if b.issuer_type = 'teacher' and b.issuer_id <> auth.uid() then raise exception 'البادج دي مش بتاعتك'; end if;

  if not exists (
    select 1 from public.group_members gm
    where gm.student_id = p_student_id and gm.status = 'accepted' and public.is_group_teacher(gm.group_id)
  ) then
    raise exception 'الطالب مش في مجموعة من مجموعاتك';
  end if;

  insert into public.badge_awards(badge_id, student_id, awarded_by, session_id, note)
  values (p_badge_id, p_student_id, auth.uid(), p_session_id, p_note)
  returning id into award_id;

  if coalesce(p_bonus, 0) > 0 then
    if not exists (select 1 from public.teacher_profiles where user_id = auth.uid()) then
      raise exception 'المكافأة المالية بيمولها المدرس بس';
    end if;
    teacher_w := public.ensure_wallet('teacher', auth.uid());
    insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, reference_type, reference_id, created_by)
    values (teacher_w, public.system_wallet('reward_escrow'), p_bonus, 'reward_funding', 'badge_award', award_id, auth.uid())
    returning id into t_id;

    insert into public.rewards(student_id, funder_wallet_id, amount, title, condition, badge_award_id, funding_transfer_id)
    values (p_student_id, teacher_w, p_bonus, coalesce(p_reward_title, b.name), p_reward_condition, award_id, t_id);
  end if;

  return award_id;
end $$;

create or replace function public.release_reward(p_reward_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  r public.rewards%rowtype;
  t_id uuid;
begin
  select * into r from public.rewards where id = p_reward_id for update;
  if not found then raise exception 'المكافأة مش موجودة'; end if;
  if r.status <> 'funded' then raise exception 'المكافأة دي اتصرفت قبل كده'; end if;
  if not public.owns_wallet(r.funder_wallet_id) then raise exception 'مش مسموح'; end if;

  insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, reference_type, reference_id, created_by)
  values (public.system_wallet('reward_escrow'), public.ensure_wallet('student', r.student_id), r.amount, 'reward_release', 'reward', r.id, auth.uid())
  returning id into t_id;

  update public.rewards set status = 'released', release_transfer_id = t_id, released_at = now() where id = r.id;
  return t_id;
end $$;

-- ============ Row level security ============
alter table public.profiles enable row level security;
alter table public.teacher_profiles enable row level security;
alter table public.assistants enable row level security;
alter table public.students enable row level security;
alter table public.guardian_links enable row level security;
alter table public.centers enable row level security;
alter table public.rooms enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_schedules enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.homework enable row level security;
alter table public.homework_submissions enable row level security;
alter table public.exams enable row level security;
alter table public.exam_results enable row level security;
alter table public.wallets enable row level security;
alter table public.transfers enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.badge_definitions enable row level security;
alter table public.badge_awards enable row level security;
alter table public.rewards enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_teacher_of_student(id) or public.is_guardian_of(id));
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- teacher profiles are public
create policy teacher_profiles_select on public.teacher_profiles for select to anon, authenticated using (true);
create policy teacher_profiles_write on public.teacher_profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy assistants_select on public.assistants for select to authenticated
  using (teacher_id = auth.uid() or user_id = auth.uid());
create policy assistants_write on public.assistants for all to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy students_select on public.students for select to authenticated
  using (user_id = auth.uid() or public.is_teacher_of_student(user_id) or public.is_guardian_of(user_id));
create policy students_write on public.students for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy guardian_links_select on public.guardian_links for select to authenticated
  using (guardian_id = auth.uid() or student_id = auth.uid());
create policy guardian_links_insert on public.guardian_links for insert to authenticated
  with check (guardian_id = auth.uid());
create policy guardian_links_update on public.guardian_links for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy centers_select on public.centers for select to authenticated using (true);
create policy centers_write on public.centers for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy rooms_select on public.rooms for select to authenticated using (true);
create policy rooms_write on public.rooms for all to authenticated
  using (exists (select 1 from public.centers c where c.id = center_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.centers c where c.id = center_id and c.owner_id = auth.uid()));

-- groups
create policy groups_select on public.groups for select to authenticated
  using (public.is_group_teacher(id) or public.is_group_student(id));
create policy groups_insert on public.groups for insert to authenticated with check (teacher_id = auth.uid());
create policy groups_update on public.groups for update to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy group_members_select on public.group_members for select to authenticated
  using (student_id = auth.uid() or public.is_group_teacher(group_id));
create policy group_members_insert on public.group_members for insert to authenticated
  with check (student_id = auth.uid() and status = 'requested');
create policy group_members_update on public.group_members for update to authenticated
  using (public.is_group_teacher(group_id)) with check (public.is_group_teacher(group_id));

create policy group_schedules_select on public.group_schedules for select to authenticated
  using (public.is_group_teacher(group_id) or public.is_group_student(group_id));
create policy group_schedules_write on public.group_schedules for all to authenticated
  using (public.is_group_teacher(group_id)) with check (public.is_group_teacher(group_id));

create policy sessions_select on public.sessions for select to authenticated
  using (public.is_group_teacher(group_id) or public.is_group_student(group_id));
create policy sessions_write on public.sessions for all to authenticated
  using (public.is_group_teacher(group_id)) with check (public.is_group_teacher(group_id));

create policy attendance_select on public.attendance for select to authenticated
  using (student_id = auth.uid()
    or exists (select 1 from public.sessions s where s.id = session_id and public.is_group_teacher(s.group_id))
    or public.is_guardian_of(student_id));
create policy attendance_write on public.attendance for all to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and public.is_group_teacher(s.group_id)))
  with check (exists (select 1 from public.sessions s where s.id = session_id and public.is_group_teacher(s.group_id)));

create policy homework_select on public.homework for select to authenticated
  using (public.is_group_teacher(group_id) or public.is_group_student(group_id));
create policy homework_write on public.homework for all to authenticated
  using (public.is_group_teacher(group_id)) with check (public.is_group_teacher(group_id));

create policy homework_submissions_select on public.homework_submissions for select to authenticated
  using (student_id = auth.uid() or public.is_guardian_of(student_id)
    or exists (select 1 from public.homework h where h.id = homework_id and public.is_group_teacher(h.group_id)));
create policy homework_submissions_student_write on public.homework_submissions for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy homework_submissions_teacher_write on public.homework_submissions for update to authenticated
  using (exists (select 1 from public.homework h where h.id = homework_id and public.is_group_teacher(h.group_id)))
  with check (exists (select 1 from public.homework h where h.id = homework_id and public.is_group_teacher(h.group_id)));

create policy exams_select on public.exams for select to authenticated
  using (public.is_group_teacher(group_id) or public.is_group_student(group_id));
create policy exams_write on public.exams for all to authenticated
  using (public.is_group_teacher(group_id)) with check (public.is_group_teacher(group_id));

create policy exam_results_select on public.exam_results for select to authenticated
  using ((student_id = auth.uid() and published_at is not null)
    or public.is_guardian_of(student_id)
    or exists (select 1 from public.exams e where e.id = exam_id and public.is_group_teacher(e.group_id)));
create policy exam_results_write on public.exam_results for all to authenticated
  using (exists (select 1 from public.exams e where e.id = exam_id and public.is_group_teacher(e.group_id)))
  with check (exists (select 1 from public.exams e where e.id = exam_id and public.is_group_teacher(e.group_id)));

-- money: read-only from the client; writes go through the functions above
create policy wallets_select on public.wallets for select to authenticated
  using (owner_id = auth.uid() or public.owns_wallet(id));

create policy transfers_select on public.transfers for select to authenticated
  using (public.owns_wallet(from_wallet_id) or public.owns_wallet(to_wallet_id));

create policy invoices_select on public.invoices for select to authenticated
  using (student_id = auth.uid() or public.is_guardian_of(student_id) or public.is_group_teacher(group_id));
create policy invoices_write on public.invoices for all to authenticated
  using (public.is_group_teacher(group_id)) with check (public.is_group_teacher(group_id));

create policy payments_select on public.payments for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id
    and (i.student_id = auth.uid() or public.is_guardian_of(i.student_id) or public.is_group_teacher(i.group_id))));

-- badges: bank = platform badges + the teacher's own
create policy badge_definitions_select on public.badge_definitions for select to authenticated
  using (issuer_type = 'system' or issuer_id = auth.uid());
create policy badge_definitions_write on public.badge_definitions for all to authenticated
  using (issuer_type = 'teacher' and issuer_id = auth.uid())
  with check (issuer_type = 'teacher' and issuer_id = auth.uid());

create policy badge_awards_select on public.badge_awards for select to authenticated
  using (student_id = auth.uid() or public.is_guardian_of(student_id) or public.is_teacher_of_student(student_id));

create policy rewards_select on public.rewards for select to authenticated
  using (student_id = auth.uid() or public.is_guardian_of(student_id) or public.owns_wallet(funder_wallet_id));

-- Platform badge bank (starter set, from the student app's four identities/badges)
insert into public.badge_definitions (issuer_type, issuer_id, name, icon, description, criteria) values
  ('system', null, 'ملتزم', 'shield', 'حضور منتظم ومتابعة للواجبات', 'حضور 90% أو أكتر طول الفترة'),
  ('system', null, 'مفكر الحصة', 'lightbulb', 'مشاركة مميزة وتفكير حلو في الحصة', 'يتمنح من المدرس'),
  ('system', null, 'مبادر', 'rocket', 'بيبدأ من نفسه ويعمل أكتر من المطلوب', 'يتمنح من المدرس'),
  ('system', null, 'متعاون', 'award', 'بيساعد زمايله ويشتغل في جماعة', 'يتمنح من المدرس');
