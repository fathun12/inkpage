-- inkpage: 20261119050000_profile_bg_fade
-- Purpose: which end of the Full page background photo fades into the theme color.

alter table public.profiles
  add column if not exists bg_fade text not null default 'bottom';

alter table public.profiles
  drop constraint if exists profiles_bg_fade_check;

alter table public.profiles
  add constraint profiles_bg_fade_check check (bg_fade in ('top', 'bottom'));