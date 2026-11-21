-- inkpage: 20261121020000_profile_card_style
-- Purpose: the style of the link cards on the public page (solid or glass).
-- Stored as one jsonb object. Its shape and ranges are validated in code
-- (src/config/card.ts, src/features/appearance/schema.ts), so tuning the
-- style never needs a new migration. An empty object means "default card".

alter table public.profiles
  add column if not exists card jsonb not null default '{}'::jsonb;