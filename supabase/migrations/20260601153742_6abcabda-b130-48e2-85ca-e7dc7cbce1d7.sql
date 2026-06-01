
CREATE TABLE public.entitlements (
  email TEXT PRIMARY KEY,
  has_letter_access BOOLEAN NOT NULL DEFAULT false,
  paid_calls INTEGER NOT NULL DEFAULT 0,
  used_calls INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.entitlements TO anon, authenticated;
GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read entitlements" ON public.entitlements FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.whop_events (
  event_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.whop_events TO service_role;
ALTER TABLE public.whop_events ENABLE ROW LEVEL SECURITY;
