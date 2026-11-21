-- inkpage: 20261122010000_profile_custom_theme
-- Purpose: the "Custom" theme (own background and accent color) and the Full page fade
-- (own fade color and how far the fade reaches).
-- profiles.theme is a free text column (no check), so the value 'custom' needs no change.

alter table public.profiles
  add column if not exists theme_bg text,
  add column if not exists theme_accent text,
  add column if not exists bg_fade_color text,
  add column if not exists bg_fade_reach integer not null default 100;

alter table public.profiles drop constraint if exists profiles_theme_bg_check;
alter table public.profiles
  add constraint profiles_theme_bg_check check (theme_bg is null or theme_bg ~ '^#[0-9a-f]{6}$');

alter table public.profiles drop constraint if exists profiles_theme_accent_check;
alter table public.profiles
  add constraint profiles_theme_accent_check check (theme_accent is null or theme_accent ~ '^#[0-9a-f]{6}$');

alter table public.profiles drop constraint if exists profiles_bg_fade_color_check;
alter table public.profiles
  add constraint profiles_bg_fade_color_check check (bg_fade_color is null or bg_fade_color ~ '^#[0-9a-f]{6}$');

alter table public.profiles drop constraint if exists profiles_bg_fade_reach_check;
alter table public.profiles
  add constraint profiles_bg_fade_reach_check check (bg_fade_reach between 20 and 100);