
-- Lock down entitlements: remove public read; edge functions use service role
DROP POLICY IF EXISTS "Anyone can read entitlements" ON public.entitlements;
REVOKE SELECT ON public.entitlements FROM anon, authenticated;

-- Lock down pending_orders: only edge functions (service role) should touch this
DROP POLICY IF EXISTS "anyone insert pending order" ON public.pending_orders;
DROP POLICY IF EXISTS "anyone read pending order" ON public.pending_orders;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.pending_orders FROM anon, authenticated;

-- Lock down consume_call_credit RPC: it bypasses RLS and was callable by anyone
REVOKE EXECUTE ON FUNCTION public.consume_call_credit(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.consume_call_credit(text) TO service_role;
