
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.scheduled_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text,
  recipient_name text NOT NULL,
  phone text NOT NULL,
  occasion text,
  scheduled_at timestamptz NOT NULL,
  mode text NOT NULL CHECK (mode IN ('voice','tts')),
  text_message text,
  voice text,
  audio_base64 text,
  audio_mime text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','error')),
  call_id text,
  last_error text,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scheduled_calls_due_idx
  ON public.scheduled_calls (scheduled_at)
  WHERE status = 'pending';

GRANT ALL ON public.scheduled_calls TO service_role;

ALTER TABLE public.scheduled_calls ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (which bypasses RLS) can read/write.

-- Remove any prior schedule with the same name to keep this migration idempotent.
DO $$
BEGIN
  PERFORM cron.unschedule('process-scheduled-calls');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'process-scheduled-calls',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://fejocgswxpxtrtwknxms.supabase.co/functions/v1/process-scheduled-calls',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_jDcOmQ4CS0czY77KjVFJsw_PkZ3Q9qt'
    ),
    body := '{}'::jsonb
  );
  $$
);
