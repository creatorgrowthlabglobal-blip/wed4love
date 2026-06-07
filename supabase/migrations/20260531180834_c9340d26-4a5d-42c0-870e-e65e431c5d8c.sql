CREATE TABLE public.letters (
  id TEXT NOT NULL PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.letters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.letters TO authenticated;
GRANT ALL ON public.letters TO service_role;

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Letters are shareable by link. Anyone with the id (UUID-like) can read.
CREATE POLICY "Anyone can read letters"
ON public.letters FOR SELECT
USING (true);

-- Anyone can create a letter (no auth required to send a wish).
CREATE POLICY "Anyone can create letters"
ON public.letters FOR INSERT
WITH CHECK (true);