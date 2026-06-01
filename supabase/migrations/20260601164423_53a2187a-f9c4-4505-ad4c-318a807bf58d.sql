CREATE TABLE public.pending_orders (
  id text PRIMARY KEY,
  product text NOT NULL,
  app_email text NOT NULL,
  letter_id text,
  amount numeric,
  status text NOT NULL DEFAULT 'pending',
  whop_event_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pending_orders TO authenticated;
GRANT SELECT, INSERT ON public.pending_orders TO anon;
GRANT ALL ON public.pending_orders TO service_role;
ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert pending order" ON public.pending_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone read pending order" ON public.pending_orders FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_pending_orders_email_status ON public.pending_orders(app_email, status, created_at DESC);