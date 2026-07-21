-- Foundations for premium letter features (voice message, locked/scheduled
-- unlock, read receipts, reaction video replies).

-- unlock_at merges "locked countdown link" and "scheduled midnight delivery"
-- into one pull-based mechanism: letters are viewed via a share link, never
-- pushed anywhere, so the recipient's client just checks unlock_at <= now()
-- on load. No cron job needed.
-- opened_at powers read receipts (first-open timestamp, set once).
ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS unlock_at timestamptz,
  ADD COLUMN IF NOT EXISTS opened_at timestamptz;

CREATE INDEX IF NOT EXISTS letters_unlock_at_idx ON public.letters(unlock_at) WHERE unlock_at IS NOT NULL;

-- Parallel boolean to has_letter_access, matching the existing binary-flag
-- entitlement pattern rather than introducing a tier system.
ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS has_premium_features boolean NOT NULL DEFAULT false;

-- Reaction videos recipients record and send back to the letter's creator.
-- Same permissive, link-based access model already used on `letters` (no
-- auth required to create or read — access is via knowing the letter id).
CREATE TABLE IF NOT EXISTS public.letter_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id text NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.letter_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a reaction"
  ON public.letter_reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read reactions"
  ON public.letter_reactions FOR SELECT
  USING (true);

GRANT SELECT, INSERT ON public.letter_reactions TO anon, authenticated;
GRANT ALL ON public.letter_reactions TO service_role;

CREATE INDEX IF NOT EXISTS letter_reactions_letter_id_idx ON public.letter_reactions(letter_id);

-- Storage bucket for voice messages + reaction videos. Public + anon-writable
-- to match the rest of the app's fully link-based (no-auth) access model —
-- file_size_limit/allowed_mime_types give real guardrails against abuse
-- regardless of RLS.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'letter-media',
  'letter-media',
  true,
  20971520, -- 20MB
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'video/webm', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload letter media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'letter-media');

CREATE POLICY "Anyone can read letter media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'letter-media');
