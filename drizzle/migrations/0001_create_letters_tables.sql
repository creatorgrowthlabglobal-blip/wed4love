CREATE TABLE IF NOT EXISTS public.letters (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  unlock_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS letters_unlock_at_idx ON public.letters(unlock_at) WHERE unlock_at IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.letters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.letters TO authenticated;
GRANT ALL ON public.letters TO service_role;

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read letters"   ON public.letters;
DROP POLICY IF EXISTS "Anyone can create letters" ON public.letters;
DROP POLICY IF EXISTS "Anyone can update letters" ON public.letters;
CREATE POLICY "Anyone can read letters"   ON public.letters FOR SELECT USING (true);
CREATE POLICY "Anyone can create letters" ON public.letters FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update letters" ON public.letters FOR UPDATE USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.letter_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id text NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.letter_reactions TO anon, authenticated;
GRANT ALL ON public.letter_reactions TO service_role;
ALTER TABLE public.letter_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can create a reaction" ON public.letter_reactions;
DROP POLICY IF EXISTS "Anyone can read reactions"    ON public.letter_reactions;
CREATE POLICY "Anyone can create a reaction" ON public.letter_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read reactions"    ON public.letter_reactions FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS letter_reactions_letter_id_idx ON public.letter_reactions(letter_id);

DROP POLICY IF EXISTS "Anyone can upload letter media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read letter media"   ON storage.objects;
CREATE POLICY "Anyone can upload letter media"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'letter-media');
CREATE POLICY "Anyone can read letter media"
  ON storage.objects FOR SELECT USING (bucket_id = 'letter-media');