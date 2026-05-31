
CREATE TABLE public.otp_attempts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX otp_attempts_email_created_idx ON public.otp_attempts (email, created_at DESC);
CREATE INDEX otp_attempts_ip_created_idx ON public.otp_attempts (ip, created_at DESC);

GRANT ALL ON public.otp_attempts TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.otp_attempts_id_seq TO service_role;

ALTER TABLE public.otp_attempts ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated → table is only accessible via service role (edge function).
