-- Students could mint their own balance with no payment behind it.
-- Disabled until a payment gateway confirms top-ups server-side.
revoke execute on function public.top_up_own_wallet(numeric) from public, anon, authenticated;
