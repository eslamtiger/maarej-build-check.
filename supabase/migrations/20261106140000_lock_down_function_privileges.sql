-- Security advisor follow-up: only signed-in users may call the app's functions; anon may call none.
alter function public.forbid_ledger_change() set search_path = public;

-- send_funds replaces transfer_funds
drop function if exists public.transfer_funds(uuid, uuid, numeric, text, text);

revoke execute on function public.add_assistant_by_phone(text, text[]) from public, anon;
revoke execute on function public.award_badge(uuid, uuid, uuid, text, numeric, text, text) from public, anon;
revoke execute on function public.generate_invoices(uuid, date) from public, anon;
revoke execute on function public.generate_sessions(uuid, date, date) from public, anon;
revoke execute on function public.is_group_student(uuid) from public, anon;
revoke execute on function public.is_group_teacher(uuid) from public, anon;
revoke execute on function public.is_guardian_of(uuid) from public, anon;
revoke execute on function public.is_teacher_of_student(uuid) from public, anon;
revoke execute on function public.my_wallet() from public, anon;
revoke execute on function public.owns_wallet(uuid) from public, anon;
revoke execute on function public.record_payment(uuid, numeric, text) from public, anon;
revoke execute on function public.release_reward(uuid) from public, anon;
revoke execute on function public.send_funds(text, uuid, numeric, text, text, uuid) from public, anon;
revoke execute on function public.top_up_own_wallet(numeric) from public, anon;

grant execute on function public.add_assistant_by_phone(text, text[]) to authenticated;
grant execute on function public.award_badge(uuid, uuid, uuid, text, numeric, text, text) to authenticated;
grant execute on function public.generate_invoices(uuid, date) to authenticated;
grant execute on function public.generate_sessions(uuid, date, date) to authenticated;
grant execute on function public.is_group_student(uuid) to authenticated;
grant execute on function public.is_group_teacher(uuid) to authenticated;
grant execute on function public.is_guardian_of(uuid) to authenticated;
grant execute on function public.is_teacher_of_student(uuid) to authenticated;
grant execute on function public.my_wallet() to authenticated;
grant execute on function public.owns_wallet(uuid) to authenticated;
grant execute on function public.record_payment(uuid, numeric, text) to authenticated;
grant execute on function public.release_reward(uuid) to authenticated;
grant execute on function public.send_funds(text, uuid, numeric, text, text, uuid) to authenticated;
grant execute on function public.top_up_own_wallet(numeric) to authenticated;
