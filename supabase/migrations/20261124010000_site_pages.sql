-- inkpage: 20261124010000_site_pages
-- Purpose: content and style settings of the public website (profiles.site, profiles.site_style)
-- and the page a link, project or header block is shown on (blocks.page).
-- The shape of the two jsonb columns is validated in code (src/config/site-content.ts,
-- src/config/site-style.ts), so tuning them never needs a new migration.

alter table public.profiles
  add column if not exists site jsonb not null default '{}'::jsonb,
  add column if not exists site_style jsonb not null default '{}'::jsonb;

alter table public.blocks
  add column if not exists page text not null default 'home';

alter table public.blocks drop constraint if exists blocks_page_check;
alter table public.blocks
  add constraint blocks_page_check check (page in ('home', 'projects', 'writing'));