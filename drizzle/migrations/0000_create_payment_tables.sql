CREATE TABLE IF NOT EXISTS public.entitlements (
  email TEXT PRIMARY KEY,
  has_letter_access BOOLEAN NOT NULL DEFAULT false,
  paid_calls INTEGER NOT NULL DEFAULT 0,
  used_calls INTEGER NOT NULL DEFAULT 0,
  letter_access_expires_at TIMESTAMPTZ,
  has_premium_features BOOLEAN NOT NULL DEFAULT false,
  invite_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pending_orders (
  id UUID PRIMARY KEY,
  product TEXT NOT NULL,
  app_email TEXT NOT NULL,
  letter_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount NUMERIC,
  whop_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.pending_orders TO service_role;
ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.whop_events (
  event_id TEXT PRIMARY KEY,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.whop_events TO service_role;
ALTER TABLE public.whop_events ENABLE ROW LEVEL SECURITY;