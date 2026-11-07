-- Billing is per session (each session = its own invoice, no monthly invoice).
-- Cash is only recorded (no gateway). Rewards can be funded from the teacher's wallet or from cash;
-- funding from payment methods is reserved until a payment gateway is activated.

-- ============ Invoices: one per session ============
alter table public.invoices add column if not exists session_id uuid references public.sessions(id) on delete set null;
alter table public.invoices drop constraint if exists invoices_group_id_student_id_period_start_key;
create unique index if not exists invoices_session_student_uidx on public.invoices(session_id, student_id) where session_id is not null;
create index if not exists invoices_group_idx on public.invoices(group_id, student_id);

drop function if exists public.generate_invoices(uuid, date);

-- Manual: invoices for every accepted member for each non-cancelled session in [p_from, p_to] (Cairo dates).
-- Students whose attendance for that session is absent/excused are skipped. Existing invoices are untouched.
create or replace function public.generate_invoices(p_group_id uuid, p_from date, p_to date) returns int
language plpgsql security definer set search_path = public as $$
declare g public.groups%rowtype; n int := 0; s record; m record; d date;
begin
  if not public.is_group_teacher(p_group_id) then raise exception 'مش مسموح'; end if;
  if p_to < p_from or p_to - p_from > 120 then raise exception 'المدى غير صحيح'; end if;
  select * into g from public.groups where id = p_group_id;
  if coalesce(g.price_per_session, 0) <= 0 then return 0; end if;

  for s in
    select id, (starts_at at time zone 'Africa/Cairo')::date as sdate from public.sessions
    where group_id = p_group_id and status <> 'cancelled'
      and (starts_at at time zone 'Africa/Cairo')::date between p_from and p_to
  loop
    for m in
      select gm.student_id from public.group_members gm
      where gm.group_id = p_group_id and gm.status = 'accepted'
        and not exists (select 1 from public.attendance a where a.session_id = s.id and a.student_id = gm.student_id and a.status in ('absent','excused'))
    loop
      insert into public.invoices(group_id, student_id, session_id, period_start, period_end, amount, due_date)
      values (p_group_id, m.student_id, s.id, s.sdate, s.sdate, g.price_per_session, s.sdate)
      on conflict (session_id, student_id) where session_id is not null do nothing;
      if found then n := n + 1; end if;
    end loop;
  end loop;
  return n;
end $$;

-- Automatic: marking a student present/late creates that session's invoice; absent/excused removes an untouched one.
create or replace function public.invoice_on_attendance() returns trigger
language plpgsql security definer set search_path = public as $$
declare g public.groups%rowtype; s public.sessions%rowtype; sdate date;
begin
  select * into s from public.sessions where id = new.session_id;
  if not found then return new; end if;
  select * into g from public.groups where id = s.group_id;
  sdate := (s.starts_at at time zone 'Africa/Cairo')::date;

  if new.status in ('present','late') then
    if coalesce(g.price_per_session, 0) > 0 then
      insert into public.invoices(group_id, student_id, session_id, period_start, period_end, amount, due_date)
      values (g.id, new.student_id, s.id, sdate, sdate, g.price_per_session, sdate)
      on conflict (session_id, student_id) where session_id is not null do nothing;
    end if;
  else
    delete from public.invoices
    where session_id = s.id and student_id = new.student_id and paid_amount = 0;
  end if;
  return new;
end $$;

drop trigger if exists attendance_invoice on public.attendance;
create trigger attendance_invoice after insert or update of status on public.attendance
  for each row execute function public.invoice_on_attendance();

-- ============ Rewards: funding source ============
alter table public.rewards add column if not exists funding_source text not null default 'wallet'
  check (funding_source in ('wallet','cash','gateway'));

drop function if exists public.award_badge(uuid, uuid, uuid, text, numeric, text, text);

create or replace function public.award_badge(
  p_badge_id uuid, p_student_id uuid, p_session_id uuid, p_note text,
  p_bonus numeric, p_reward_title text, p_reward_condition text,
  p_funding text default 'wallet'
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  b public.badge_definitions%rowtype;
  award_id uuid;
  teacher_w uuid;
  from_w uuid;
  t_id uuid;
begin
  if p_funding not in ('wallet','cash','gateway') then raise exception 'مصدر التمويل غير صحيح'; end if;
  if coalesce(p_bonus, 0) > 0 and p_funding = 'gateway' then
    raise exception 'التمويل من وسائل الدفع هيتفعل مع تفعيل بوابة الدفع';
  end if;

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
    -- wallet: paid from the teacher's balance. cash: the teacher hands cash over, recorded as money coming in from outside.
    from_w := case when p_funding = 'cash' then public.system_wallet('external_inflow') else teacher_w end;

    insert into public.transfers(from_wallet_id, to_wallet_id, amount, kind, reference_type, reference_id, created_by)
    values (from_w, public.system_wallet('reward_escrow'), p_bonus, 'reward_funding', 'badge_award', award_id, auth.uid())
    returning id into t_id;

    insert into public.rewards(student_id, funder_wallet_id, amount, title, condition, badge_award_id, funding_transfer_id, funding_source)
    values (p_student_id, teacher_w, p_bonus, coalesce(p_reward_title, b.name), p_reward_condition, award_id, t_id, p_funding);
  end if;

  return award_id;
end $$;

-- Only signed-in users may call the new/changed functions.
revoke execute on function public.generate_invoices(uuid, date, date) from public, anon;
grant execute on function public.generate_invoices(uuid, date, date) to authenticated;
revoke execute on function public.award_badge(uuid, uuid, uuid, text, numeric, text, text, text) from public, anon;
grant execute on function public.award_badge(uuid, uuid, uuid, text, numeric, text, text, text) to authenticated;
revoke execute on function public.invoice_on_attendance() from public, anon, authenticated;
