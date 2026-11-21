-- inkpage: 20261121010000_profile_fonts
-- Purpose: the heading font and body font of the public page (Customize studio).
-- Font ids are validated in code (src/config/font-choices.ts), not here,
-- so adding a font never needs a new migration.

alter table public.profiles
  add column if not exists font_heading text not null default 'instrument-sans',
  add column if not exists font_body text not null default 'instrument-sans';