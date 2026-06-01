CREATE TABLE public.claimed_whop_events (
  event_id text PRIMARY KEY,
  app_email text NOT NULL,
  claimed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.claimed_whop_events TO authenticated;
GRANT ALL ON public.claimed_whop_events TO service_role;
ALTER TABLE public.claimed_whop_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read claims" ON public.claimed_whop_events FOR SELECT TO authenticated USING (true);