-- Teacher app support: assistant lookup, internal transfers by owner, session + invoice generation,
-- and lock down helper functions that must only run inside other security-definer functions.

-- Teachers can read their assistants' profiles (and assistants can read their teacher's).
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_teacher_of_student(id)
    or public.is_guardian_of(id)
    or exists (
      select 1 from public.assistants a
      where (a.teacher_id = auth.uid() and a.user_id = profiles.id)
         or (a.user_id = auth.uid() and a.teacher_id = profiles.id)
    )
  );

-- Helpers are internal only.
revoke execute on function public.ensure_wallet(text, uuid) from public, anon, authenticated;
revoke execute on function public.system_wallet(text) from public, anon, authenticated;
revoke execute on function public.apply_transfer() from public, anon, authenticated;

-- Add an assistant by phone (the teacher can't read arbitrary profiles, so this runs as definer).
create or replace function public.add_assistant_by_phone(p_phone text, p_permissions text[]) returns uuid
language plpgsql security definer set search_path = public as $$
declare uid uuid; aid uuid;
begin
  if not exists (select 1 from public.teacher_profiles where user_id = auth.uid()) then
    raise exception 'للمدرس بس';
  end if;
  select id into uid from public.profiles where phone = p_phone and role = 'assistant';
  if uid is null then raise exception 'مفيش مساعد مسجّل بالرقم ده'; end if;
  insert into public.assistants(teacher_id, user_id, permissions)
  values (auth.uid(), uid, coalesce(p_permissions, '{}'))
  on conflict (teacher_id, user_id) do update set permissions = excluded.permissions
  returning id into aid;
  return aid;
end $$;

-- Send money from the caller's own wallet (or a center they own) to another owner's wallet.
create or replace function public.send_funds(
  p_to_type text, p_to_id uuid, p_amount numeric, p_kind text,
  p_note text default null, p_from_center uuid default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  r text;
  from_w uuid;
  t_id uuid;
begin
  if p_to_type not in ('student','teacher','center','guardian') then raise exception 'نوع المستلم غير صحيح'; end if;
  if p_kind not in ('transfer','commission','room_fee') then raise exception 'نوع الحركة غير مسموح'; end if;

  if p_from_center is not null then
    if not exists (select 1 from public.centers where id = p_from_center and owner_id = auth.uid()) then
      raise exception 'السنتر ده مش بتاعك';
    end if;
    from_w := public.ensure_wallet('center', p_from_center);
  else
    select role into r from public.profiles where id = auth.uid();
    if r is null then raise exception 'مفيش حساب'; end if;
    from_w := public.ensure_wallet(case r when 'parent' then 'guardian' when 'center_owner' then 'center' else r end, auth.uid());
  end if;

  insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, note, created_by)
  values (from_w, public.ensure_wallet(p_to_type, p_to_id), p_amount, p_kind, p_note, auth.uid())
  returning id into t_id;
  return t_id;
end $$;

-- The teacher's wallet (created on first use) so the app can show a balance of 0 instead of nothing.
create or replace function public.my_wallet() returns table (id uuid, balance numeric)
language plpgsql security definer set search_path = public as $$
declare r text; w uuid;
begin
  select role into r from public.profiles where profiles.id = auth.uid();
  if r is null then raise exception 'مفيش حساب'; end if;
  w := public.ensure_wallet(case r when 'parent' then 'guardian' when 'center_owner' then 'center' else r end, auth.uid());
  return query select wl.id, wl.balance from public.wallets wl where wl.id = w;
end $$;

-- Create sessions from a group's weekly schedule for a date range (Cairo time). Skips existing ones.
-- day_of_week uses 0 = Sunday ... 6 = Saturday.
create or replace function public.generate_sessions(p_group_id uuid, p_from date, p_to date) returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; d date; s record; st timestamptz; en timestamptz;
begin
  if not public.is_group_teacher(p_group_id) then raise exception 'مش مسموح'; end if;
  if p_to < p_from or p_to - p_from > 120 then raise exception 'المدى غير صحيح'; end if;
  for d in select generate_series(p_from, p_to, interval '1 day')::date loop
    for s in select * from public.group_schedules where group_id = p_group_id and day_of_week = extract(dow from d)::int loop
      st := ((d + s.start_time)::timestamp) at time zone 'Africa/Cairo';
      en := ((d + s.end_time)::timestamp) at time zone 'Africa/Cairo';
      if not exists (select 1 from public.sessions where group_id = p_group_id and starts_at = st) then
        insert into public.sessions(group_id, starts_at, ends_at) values (p_group_id, st, en);
        n := n + 1;
      end if;
    end loop;
  end loop;
  return n;
end $$;

-- Monthly invoices for a group's accepted members: price_per_session x non-cancelled sessions in that month.
create or replace function public.generate_invoices(p_group_id uuid, p_month date) returns int
language plpgsql security definer set search_path = public as $$
declare g public.groups%rowtype; ms date; me date; cnt int; n int := 0; m record;
begin
  if not public.is_group_teacher(p_group_id) then raise exception 'مش مسموح'; end if;
  select * into g from public.groups where id = p_group_id;
  ms := date_trunc('month', p_month)::date;
  me := (ms + interval '1 month - 1 day')::date;
  select count(*) into cnt from public.sessions
  where group_id = p_group_id and status <> 'cancelled'
    and (starts_at at time zone 'Africa/Cairo')::date between ms and me;

  for m in select student_id from public.group_members where group_id = p_group_id and status = 'accepted' loop
    insert into public.invoices(group_id, student_id, period_start, period_end, amount, due_date)
    values (p_group_id, m.student_id, ms, me, g.price_per_session * cnt, ms + 9)
    on conflict (group_id, student_id, period_start) do nothing;
    if found then n := n + 1; end if;
  end loop;
  return n;
end $$;

-- Fix: a teacher must be able to read a group row in the same statement that inserts it (INSERT ... RETURNING).
drop policy if exists groups_select on public.groups;
create policy groups_select on public.groups for select to authenticated
  using (teacher_id = auth.uid() or public.is_group_teacher(id) or public.is_group_student(id));
