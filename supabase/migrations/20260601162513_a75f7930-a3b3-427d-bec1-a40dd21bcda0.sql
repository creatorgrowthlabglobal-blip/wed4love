ALTER TABLE public.entitlements ADD COLUMN IF NOT EXISTS letter_access_expires_at TIMESTAMPTZ;

-- Backfill: existing paid users get 30 days from now so they aren't kicked off
UPDATE public.entitlements
SET letter_access_expires_at = now() + interval '30 days'
WHERE has_letter_access = true AND letter_access_expires_at IS NULL;