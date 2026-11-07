-- Site data in the database: the public catalog (teachers, centers, study spaces, rooms), what visitors do
-- (searches, room bookings, join requests, reviews, saved items — allowed without an account), sign-up details,
-- parent settings, and family billing modelled on tutoring platforms (family balance, pay open invoices,
-- auto-pay, a monthly spending limit per child, account statement).

-- ============ Public catalog (read by everyone) ============
create table if not exists public.catalog_teachers (
  id text primary key, name text not null, subjects text[] not null default '{}', stages text[] not null default '{}',
  systems text[] not null default '{}', areas text[] not null default '{}', governorates text[] not null default '{}',
  rating numeric(3,2), review_count int, price_min numeric(10,2), price_max numeric(10,2), photo text,
  created_at timestamptz not null default now());
create table if not exists public.catalog_places (
  id text primary key, kind text not null check (kind in ('center','space')), name text not null, type text, area text,
  governorate text, address text, rating numeric(3,2), reviews int, lat double precision, lng double precision,
  price_min numeric(10,2), price_max numeric(10,2), capacity int, units int,
  features text[] not null default '{}', zones text[] not null default '{}', created_at timestamptz not null default now());
create table if not exists public.catalog_rooms (
  place_id text not null references public.catalog_places(id) on delete cascade, idx int not null, name text not null,
  seats int not null, price_per_hour numeric(10,2) not null, features text[] not null default '{}', primary key (place_id, idx));
alter table public.catalog_teachers enable row level security;
alter table public.catalog_places enable row level security;
alter table public.catalog_rooms enable row level security;
create policy catalog_teachers_read on public.catalog_teachers for select to anon, authenticated using (true);
create policy catalog_places_read on public.catalog_places for select to anon, authenticated using (true);
create policy catalog_rooms_read on public.catalog_rooms for select to anon, authenticated using (true);

-- ============ Visitor activity (works with or without an account) ============
-- device_id is a random id kept in the visitor's browser; user_id is filled when signed in.
create table if not exists public.site_searches (
  id bigint generated always as identity primary key, kind text not null check (kind in ('teachers','centers','spaces')),
  query text check (char_length(query) <= 120), filters jsonb not null default '{}', results int, device_id text check (char_length(device_id) <= 64),
  user_id uuid default auth.uid(), created_at timestamptz not null default now());
create table if not exists public.site_room_bookings (
  id uuid primary key default gen_random_uuid(), place_id text not null references public.catalog_places(id), room_idx int not null,
  days int[] not null check (array_length(days, 1) between 1 and 7), start_hour int not null check (start_hour between 0 and 23),
  end_hour int not null check (end_hour between 1 and 24), repeat text not null default 'once' check (repeat in ('once','weekly')),
  period text, collect boolean not null default false, contact_name text check (char_length(contact_name) <= 80),
  contact_phone text check (char_length(contact_phone) <= 20), device_id text check (char_length(device_id) <= 64),
  user_id uuid default auth.uid(), status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  created_at timestamptz not null default now(), check (end_hour > start_hour));
create table if not exists public.site_join_requests (
  id uuid primary key default gen_random_uuid(), teacher_id text references public.catalog_teachers(id), place_id text references public.catalog_places(id),
  session_ref text check (char_length(session_ref) <= 80), subject text, stage text, day int check (day between 0 and 6),
  start_hour int, price numeric(10,2), contact_name text check (char_length(contact_name) <= 80), contact_phone text check (char_length(contact_phone) <= 20),
  device_id text check (char_length(device_id) <= 64), user_id uuid default auth.uid(),
  status text not null default 'pending' check (status in ('pending','accepted','refused','cancelled')), created_at timestamptz not null default now());
create table if not exists public.site_reviews (
  id uuid primary key default gen_random_uuid(), target_kind text not null check (target_kind in ('teacher','center','space')),
  target_id text not null, rating int not null check (rating between 1 and 5), body text not null check (char_length(body) between 2 and 400),
  author_name text not null check (char_length(author_name) between 1 and 80),
  author_role text not null default 'students' check (author_role in ('students','parents','teachers','centers')),
  device_id text check (char_length(device_id) <= 64), user_id uuid default auth.uid(), created_at timestamptz not null default now());
create table if not exists public.site_saves (
  device_id text not null check (char_length(device_id) <= 64), kind text not null check (kind in ('teacher','center','space')),
  item_id text not null, user_id uuid default auth.uid(), created_at timestamptz not null default now(), primary key (device_id, kind, item_id));

alter table public.site_searches enable row level security;
alter table public.site_room_bookings enable row level security;
alter table public.site_join_requests enable row level security;
alter table public.site_reviews enable row level security;
alter table public.site_saves enable row level security;
-- Anyone may add; a signed-in person can only add rows as themselves. Reading back goes through my_site_activity().
create policy site_searches_add on public.site_searches for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
create policy site_bookings_add on public.site_room_bookings for insert to anon, authenticated with check ((user_id is null or user_id = auth.uid()) and status = 'pending');
create policy site_joins_add on public.site_join_requests for insert to anon, authenticated with check ((user_id is null or user_id = auth.uid()) and status = 'pending');
create policy site_reviews_add on public.site_reviews for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
create policy site_reviews_read on public.site_reviews for select to anon, authenticated using (true);
create policy site_saves_add on public.site_saves for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());

-- A visitor's own bookings, join requests and saved items (by their browser id, or their account when signed in).
create or replace function public.my_site_activity(p_device text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'bookings', coalesce((select jsonb_agg(to_jsonb(b) order by b.created_at desc) from public.site_room_bookings b where b.device_id = p_device or (auth.uid() is not null and b.user_id = auth.uid())), '[]'::jsonb),
    'joins', coalesce((select jsonb_agg(to_jsonb(j) order by j.created_at desc) from public.site_join_requests j where j.device_id = p_device or (auth.uid() is not null and j.user_id = auth.uid())), '[]'::jsonb),
    'saves', coalesce((select jsonb_agg(jsonb_build_object('kind', s.kind, 'id', s.item_id)) from public.site_saves s where s.device_id = p_device or (auth.uid() is not null and s.user_id = auth.uid())), '[]'::jsonb));
$$;
create or replace function public.toggle_site_save(p_device text, p_kind text, p_item text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.site_saves where device_id = p_device and kind = p_kind and item_id = p_item) then
    delete from public.site_saves where device_id = p_device and kind = p_kind and item_id = p_item; return false;
  end if;
  insert into public.site_saves(device_id, kind, item_id, user_id) values (p_device, p_kind, p_item, auth.uid()); return true;
end $$;
-- Bookings made on the site block the timetable for everyone, so the slots (no contact details) are public.
create or replace function public.booked_slots(p_place text) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('room', room_idx, 'days', days, 'start', start_hour, 'end', end_hour, 'status', status)), '[]'::jsonb)
  from public.site_room_bookings where place_id = p_place and status in ('pending','approved');
$$;

-- ============ Sign-up details (page 01 of the product sketches) ============
alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists gender text check (gender in ('male','female')),
  add column if not exists governorate text,
  add column if not exists relation text;
alter table public.students add column if not exists grade text;

-- ============ Parent settings ============
create table if not exists public.guardian_settings (
  guardian_id uuid primary key references public.profiles(id) on delete cascade,
  autopay boolean not null default false, remind_days int not null default 3 check (remind_days between 0 and 14),
  notify_absence boolean not null default true, notify_grades boolean not null default true,
  notify_payments boolean not null default true, weekly_report boolean not null default false,
  default_child uuid references public.students(user_id) on delete set null, updated_at timestamptz not null default now());
alter table public.guardian_settings enable row level security;
create policy guardian_settings_own on public.guardian_settings for all to authenticated
  using (guardian_id = auth.uid()) with check (guardian_id = auth.uid());

-- Per-child money rules live on the link: monthly_limit (0 = no limit) and child_can_pay.
create or replace function public.guardian_set_child_rules(p_student_id uuid, p_monthly_limit numeric, p_child_can_pay boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_guardian_of(p_student_id) then raise exception 'ده مش ابنك'; end if;
  if coalesce(p_monthly_limit, 0) < 0 then raise exception 'الحد لازم يكون صفر أو أكتر'; end if;
  update public.guardian_links set permissions = permissions || jsonb_build_object('monthly_limit', coalesce(p_monthly_limit, 0), 'child_can_pay', coalesce(p_child_can_pay, true))
  where guardian_id = auth.uid() and student_id = p_student_id;
end $$;

-- A child's payments from their own wallet respect the parent's rules.
create or replace function public.check_child_spending() returns trigger
language plpgsql security definer set search_path = public as $$
declare w public.wallets%rowtype; lim numeric; can_pay boolean; spent numeric;
begin
  if new.kind <> 'payment' then return new; end if;
  select * into w from public.wallets where id = new.from_wallet_id;
  if w.owner_type <> 'student' then return new; end if;
  select bool_and(coalesce((gl.permissions->>'child_can_pay')::boolean, true)),
         min(nullif(coalesce((gl.permissions->>'monthly_limit')::numeric, 0), 0))
    into can_pay, lim from public.guardian_links gl where gl.student_id = w.owner_id and gl.status = 'accepted';
  if can_pay is false then raise exception 'ولي الأمر قافل الدفع من رصيد الطالب'; end if;
  if lim is not null then
    select coalesce(sum(amount), 0) into spent from public.transfers
    where from_wallet_id = w.id and kind = 'payment' and date_trunc('month', created_at) = date_trunc('month', now());
    if spent + new.amount > lim then raise exception 'المبلغ ده هيعدّي حد المصروف الشهري اللي حطه ولي الأمر'; end if;
  end if;
  return new;
end $$;
drop trigger if exists transfers_child_spending on public.transfers;
create trigger transfers_child_spending before insert on public.transfers for each row execute function public.check_child_spending();

-- ============ Family billing ============
alter table public.payments add column if not exists paid_by uuid references public.profiles(id) on delete set null;

-- Pay one open invoice of a child from the parent's balance (money goes to the teacher).
create or replace function public.pay_invoice_from_guardian(p_invoice_id uuid, p_guardian uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare inv public.invoices%rowtype; g public.groups%rowtype; rest numeric; gw uuid; t_id uuid;
begin
  select * into inv from public.invoices where id = p_invoice_id for update;
  if not found then raise exception 'الفاتورة مش موجودة'; end if;
  if not exists (select 1 from public.guardian_links where guardian_id = p_guardian and student_id = inv.student_id and status = 'accepted') then raise exception 'الفاتورة دي مش لابنك'; end if;
  rest := inv.amount - inv.paid_amount;
  if rest <= 0 or inv.status in ('paid','waived') then raise exception 'الفاتورة دي مدفوعة'; end if;
  select * into g from public.groups where id = inv.group_id;
  gw := public.ensure_wallet('guardian', p_guardian);
  insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, reference_type, reference_id, note, created_by)
  values (gw, public.ensure_wallet('teacher', g.teacher_id), rest, 'payment', 'invoice', inv.id, g.subject, p_guardian) returning id into t_id;
  insert into public.payments(invoice_id, amount, method, transfer_id, recorded_by, paid_by) values (inv.id, rest, 'wallet', t_id, p_guardian, p_guardian);
  update public.invoices set paid_amount = amount, status = 'paid' where id = inv.id;
  return t_id;
end $$;
create or replace function public.guardian_pay_invoice(p_invoice_id uuid) returns uuid
language sql security definer set search_path = public as $$ select public.pay_invoice_from_guardian(p_invoice_id, auth.uid()); $$;

-- Pay every open invoice (oldest first) while the balance covers it. Optionally for one child only.
create or replace function public.guardian_pay_all(p_student_id uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; total numeric := 0; bal numeric; skipped int := 0;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'parent') then raise exception 'لولي الأمر بس'; end if;
  for r in select i.id, i.amount - i.paid_amount rest from public.invoices i
    join public.guardian_links gl on gl.student_id = i.student_id and gl.guardian_id = auth.uid() and gl.status = 'accepted'
    where i.status not in ('paid','waived') and i.amount > i.paid_amount and (p_student_id is null or i.student_id = p_student_id)
    order by coalesce(i.due_date, i.period_start), i.created_at
  loop
    select balance into bal from public.wallets where owner_type = 'guardian' and owner_id = auth.uid();
    if coalesce(bal, 0) < r.rest then skipped := skipped + 1; continue; end if;
    perform public.pay_invoice_from_guardian(r.id, auth.uid()); n := n + 1; total := total + r.rest;
  end loop;
  return jsonb_build_object('paid', n, 'amount', total, 'skipped', skipped);
end $$;

-- Auto-pay: a new invoice for a child is paid from the parent's balance right away when auto-pay is on and the balance covers it.
create or replace function public.autopay_new_invoice() returns trigger
language plpgsql security definer set search_path = public as $$
declare gid uuid; bal numeric;
begin
  if new.status in ('paid','waived') or new.amount <= new.paid_amount then return new; end if;
  select gl.guardian_id into gid from public.guardian_links gl join public.guardian_settings s on s.guardian_id = gl.guardian_id
  where gl.student_id = new.student_id and gl.status = 'accepted' and s.autopay limit 1;
  if gid is null then return new; end if;
  select balance into bal from public.wallets where owner_type = 'guardian' and owner_id = gid;
  if coalesce(bal, 0) >= new.amount - new.paid_amount then perform public.pay_invoice_from_guardian(new.id, gid); end if;
  return new;
end $$;
drop trigger if exists invoices_autopay on public.invoices;
create trigger invoices_autopay after insert on public.invoices for each row execute function public.autopay_new_invoice();

-- What the parent pages need on top of guardian_overview(): settings, per-child rules and spending,
-- every payment with who paid it, and the charges expected in the next 30 days.
create or replace function public.guardian_extras() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if not exists (select 1 from public.profiles where id = me and role = 'parent') then raise exception 'لولي الأمر بس'; end if;
  return jsonb_build_object(
    'settings', coalesce((select to_jsonb(s) from public.guardian_settings s where s.guardian_id = me), '{}'::jsonb),
    'email', (select email from auth.users where id = me),
    'children', coalesce((select jsonb_agg(jsonb_build_object(
        'id', gl.student_id, 'permissions', gl.permissions,
        'spentThisMonth', (select coalesce(sum(t.amount), 0) from public.transfers t join public.wallets w on w.id = t.from_wallet_id
            where w.owner_type = 'student' and w.owner_id = gl.student_id and t.kind = 'payment' and date_trunc('month', t.created_at) = date_trunc('month', now())),
        'upcoming30', (select coalesce(sum(g.price_per_session), 0) from public.sessions se join public.groups g on g.id = se.group_id
            join public.group_members gm on gm.group_id = g.id and gm.student_id = gl.student_id and gm.status = 'accepted'
            where se.status = 'scheduled' and se.starts_at between now() and now() + interval '30 days'),
        'payments', coalesce((select jsonb_agg(jsonb_build_object('invoice', pa.invoice_id, 'amount', pa.amount, 'method', pa.method, 'at', pa.paid_at,
              'by', case when pa.paid_by = me then 'me' when pa.method = 'wallet' and pa.paid_by is null then 'child' when pa.method = 'cash' then 'cash' else 'other' end,
              'subject', g.subject, 'teacher', tp.full_name, 'session', i.period_start) order by pa.paid_at desc)
            from public.payments pa join public.invoices i on i.id = pa.invoice_id join public.groups g on g.id = i.group_id join public.profiles tp on tp.id = g.teacher_id
            where i.student_id = gl.student_id), '[]'::jsonb)))
      from public.guardian_links gl where gl.guardian_id = me and gl.status = 'accepted'), '[]'::jsonb));
end $$;

-- ============ Privileges ============
revoke execute on function public.my_site_activity(text) from public;
revoke execute on function public.toggle_site_save(text, text, text) from public;
revoke execute on function public.booked_slots(text) from public;
grant execute on function public.my_site_activity(text) to anon, authenticated;
grant execute on function public.toggle_site_save(text, text, text) to anon, authenticated;
grant execute on function public.booked_slots(text) to anon, authenticated;
revoke execute on function public.guardian_set_child_rules(uuid, numeric, boolean) from public, anon;
revoke execute on function public.check_child_spending() from public, anon, authenticated;
revoke execute on function public.pay_invoice_from_guardian(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.autopay_new_invoice() from public, anon, authenticated;
revoke execute on function public.guardian_pay_invoice(uuid) from public, anon;
revoke execute on function public.guardian_pay_all(uuid) from public, anon;
revoke execute on function public.guardian_extras() from public, anon;
grant execute on function public.guardian_set_child_rules(uuid, numeric, boolean) to authenticated;
grant execute on function public.guardian_pay_invoice(uuid) to authenticated;
grant execute on function public.guardian_pay_all(uuid) to authenticated;
grant execute on function public.guardian_extras() to authenticated;
