-- inkpage: 20261119060000_profile_background_modes
-- Purpose: solid and gradient page backgrounds, the fade side of a photo, and a slot for a video background.

alter table public.profiles add column if not exists bg_fade text not null default 'bottom';
alter table public.profiles add column if not exists bg_color text;
alter table public.profiles add column if not exists bg_color2 text;
alter table public.profiles add column if not exists bg_angle integer not null default 180;
alter table public.profiles add column if not exists bg_video_url text;

-- Remove every older check on bg_mode, then add one that knows the new styles.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%bg_mode%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_bg_mode_check
  check (bg_mode in ('color', 'solid', 'gradient', 'full', 'banner', 'frame', 'video'));

alter table public.profiles drop constraint if exists profiles_bg_fade_check;
alter table public.profiles
  add constraint profiles_bg_fade_check check (bg_fade in ('top', 'bottom'));

alter table public.profiles drop constraint if exists profiles_bg_color_check;
alter table public.profiles
  add constraint profiles_bg_color_check check (bg_color is null or bg_color ~ '^#[0-9a-f]{6}$');

alter table public.profiles drop constraint if exists profiles_bg_color2_check;
alter table public.profiles
  add constraint profiles_bg_color2_check check (bg_color2 is null or bg_color2 ~ '^#[0-9a-f]{6}$');

alter table public.profiles drop constraint if exists profiles_bg_angle_check;
alter table public.profiles
  add constraint profiles_bg_angle_check check (bg_angle between 0 and 360);