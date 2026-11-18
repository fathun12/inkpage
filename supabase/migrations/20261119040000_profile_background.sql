-- Inkpage
-- Migration: 20261119040000_profile_background
-- Purpose: let each profile choose a page background: the plain theme color,
--          or one uploaded photo shown full page, as a banner, or in a frame.

-- New profile columns for the background settings.
alter table public.profiles
  add column if not exists bg_mode text not null default 'color',
  add column if not exists bg_image_url text,
  add column if not exists bg_tint integer not null default 55,
  add column if not exists bg_gray boolean not null default true;

-- Keep the values in range.
alter table public.profiles
  add constraint profiles_bg_mode_check check (bg_mode in ('color','full','banner','frame')),
  add constraint profiles_bg_tint_check check (bg_tint between 0 and 90);