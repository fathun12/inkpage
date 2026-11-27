-- inkpage: 20261127010000_articles_tags_series
-- Purpose: tags and series for articles (Phase 28c, SPEC-WRITER.md Bagian 13).
-- A series groups articles into numbered parts. One article belongs to at most one series.
-- Tags are a plain list of words on the article. Deleting a series keeps its articles.

-- Series: one row per series of one author.
create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 100),
  description text check (description is null or char_length(description) <= 400),
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One address per author.
create unique index if not exists series_user_slug_key on public.series (user_id, slug);

-- Articles: tags, the series they belong to, and their part number.
alter table public.articles
  add column if not exists tags text[] not null default '{}',
  add column if not exists series_id uuid references public.series(id) on delete set null,
  add column if not exists series_position integer;

alter table public.articles drop constraint if exists articles_tags_limit;
alter table public.articles add constraint articles_tags_limit check (cardinality(tags) <= 8);

create index if not exists articles_tags_idx on public.articles using gin (tags);
create index if not exists articles_series_idx on public.articles (series_id, series_position)
  where series_id is not null;

-- Series: RLS. Public readers see a series only while it has at least one live article.
alter table public.series enable row level security;

create policy "series with a live article are public" on public.series
  for select using (
    exists (
      select 1 from public.articles a
      where a.series_id = series.id
        and a.status = 'published'
        and a.published_at is not null
        and a.published_at <= now()
    )
  );

-- Owner: everything on their own rows.
create policy "owner reads series" on public.series
  for select to authenticated using (auth.uid() = user_id);
create policy "owner inserts series" on public.series
  for insert to authenticated with check (auth.uid() = user_id);
create policy "owner updates series" on public.series
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes series" on public.series
  for delete to authenticated using (auth.uid() = user_id);