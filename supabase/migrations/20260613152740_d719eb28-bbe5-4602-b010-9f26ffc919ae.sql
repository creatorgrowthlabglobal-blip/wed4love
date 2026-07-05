CREATE TABLE public.ph_payment_orders (
  order_id text PRIMARY KEY,
  letter_id text NOT NULL,
  email text NOT NULL,
  sender_name text,
  receiver_name text,
  letter_type text,
  letter_url text NOT NULL,
  amount numeric NOT NULL DEFAULT 149,
  status text NOT NULL DEFAULT 'pending',
  telegram_message_id bigint,
  telegram_chat_id text,
  approved_at timestamptz,
  rejected_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.ph_payment_orders TO service_role;

ALTER TABLE public.ph_payment_orders ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: backend-only access via service role.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ph_payment_orders_set_updated_at
BEFORE UPDATE ON public.ph_payment_orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
