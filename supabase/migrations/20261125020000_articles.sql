-- inkpage: 20261125020000_articles
-- Purpose: articles written inside inkpage (Phase 20, W1). The text is Tiptap JSON in "content".
-- Public readers see only published articles whose published_at is not in the future
-- (a future published_at = a scheduled article). Only the owner reads drafts and writes.

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null default '' check (char_length(title) <= 150),
  subtitle text check (subtitle is null or char_length(subtitle) <= 200),
  content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  excerpt text,
  reading_minutes integer not null default 1,
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One address per author. Drafts have no address yet.
create unique index if not exists articles_user_slug_key
  on public.articles (user_id, slug) where slug is not null;
create index if not exists articles_user_published_idx
  on public.articles (user_id, published_at desc);

alter table public.articles enable row level security;

-- Public: only published articles whose time has come.
create policy "published articles are public" on public.articles
  for select using (status = 'published' and published_at is not null and published_at <= now());

-- Owner: everything on their own rows.
create policy "owner reads articles" on public.articles
  for select to authenticated using (auth.uid() = user_id);
create policy "owner inserts articles" on public.articles
  for insert to authenticated with check (auth.uid() = user_id);
create policy "owner updates articles" on public.articles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes articles" on public.articles
  for delete to authenticated using (auth.uid() = user_id);