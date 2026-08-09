-- Add invite_plan to entitlements to track which Wed4Love plan a user purchased.
-- Values: 'starter' | 'premium' | 'custom' | NULL (no invite purchase yet).
-- Separate from has_letter_access which tracks the Wish4Love letter product.
ALTER TABLE public.entitlements
  ADD COLUMN IF NOT EXISTS invite_plan text;
