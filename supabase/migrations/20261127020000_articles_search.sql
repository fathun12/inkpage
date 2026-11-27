-- inkpage: 20261127020000_articles_search
-- Purpose: search on the Articles page (Phase 28d, SPEC-WRITER.md Bagian 13).
-- "search_text" holds the words of an article in one line: title, subtitle, body text (code blocks left out),
-- tags and series title, at most 60000 characters. A trigram index (pg_trgm) makes ILIKE '%word%' fast.
-- Triggers keep the column up to date, so the application does not have to remember it.

-- The trigram extension. On Supabase, extensions live in the "extensions" schema.
create extension if not exists pg_trgm with schema extensions;

-- The text of a Tiptap document as plain text. Code blocks are left out, like the excerpt does.
create or replace function public.tiptap_plain_text(node jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  result text := '';
  child jsonb;
  kind text;
begin
  if node is null or jsonb_typeof(node) <> 'object' then
    return '';
  end if;
  kind := node ->> 'type';
  if kind = 'codeBlock' then
    return '';
  end if;
  if kind = 'text' then
    return coalesce(node ->> 'text', '');
  end if;
  if kind = 'hardBreak' then
    return ' ';
  end if;
  if jsonb_typeof(node -> 'content') = 'array' then
    for child in select value from jsonb_array_elements(node -> 'content') loop
      result := result || public.tiptap_plain_text(child);
    end loop;
  end if;
  if kind in ('paragraph', 'heading', 'listItem', 'blockquote') then
    result := result || ' ';
  end if;
  return result;
end;
$$;

-- The column and its trigram index.
alter table public.articles add column if not exists search_text text not null default '';

create index if not exists articles_search_text_idx
  on public.articles using gin (search_text extensions.gin_trgm_ops);

-- Fills search_text whenever the words of an article change.
create or replace function public.articles_set_search_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_text := left(
    regexp_replace(
      coalesce(new.title, '') || ' ' ||
      coalesce(new.subtitle, '') || ' ' ||
      public.tiptap_plain_text(new.content) || ' ' ||
      array_to_string(new.tags, ' ') || ' ' ||
      coalesce((select s.title from public.series s where s.id = new.series_id), ''),
      '\s+', ' ', 'g'
    ),
    60000
  );
  return new;
end;
$$;

drop trigger if exists articles_search_text on public.articles;
create trigger articles_search_text
  before insert or update of title, subtitle, content, tags, series_id on public.articles
  for each row execute function public.articles_set_search_text();

-- A new series title must reach the articles of that series. Touching series_id fires the trigger above.
-- Deleting a series sets series_id to null, which fires it too.
create or replace function public.series_refresh_article_search()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.articles set series_id = series_id where series_id = new.id;
  return null;
end;
$$;

drop trigger if exists series_title_search on public.series;
create trigger series_title_search
  after update of title on public.series
  for each row when (old.title is distinct from new.title)
  execute function public.series_refresh_article_search();

-- Existing articles: touching the title fires the trigger once for every row.
update public.articles set title = title;