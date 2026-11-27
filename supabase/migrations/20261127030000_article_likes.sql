-- inkpage: 20261127030000_article_likes
-- Purpose: likes on articles without visitor accounts (Phase 32c).
-- One row per article and visitor. The visitor is a random id kept in a cookie, stored only as a SHA-256 hash.
-- Only the server (service role) reads or writes this table. articles.like_count is the total, kept by a trigger.

create table if not exists public.article_likes (
  article_id uuid not null references public.articles(id) on delete cascade,
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  created_at timestamptz not null default now(),
  primary key (article_id, visitor_hash)
);

-- RLS on and no policy on purpose: the browser can never touch this table.
alter table public.article_likes enable row level security;

-- The total, so a page never has to count rows.
alter table public.articles
  add column if not exists like_count integer not null default 0 check (like_count >= 0);

-- Keeps articles.like_count in step with the rows. It does not fire the search trigger (that one only watches words).
create or replace function public.article_likes_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.articles set like_count = like_count + 1 where id = new.article_id;
  elsif tg_op = 'DELETE' then
    update public.articles set like_count = greatest(like_count - 1, 0) where id = old.article_id;
  end if;
  return null;
end;
$$;

drop trigger if exists article_likes_count on public.article_likes;
create trigger article_likes_count
  after insert or delete on public.article_likes
  for each row execute function public.article_likes_count();

-- Like or unlike once for this visitor. Safe to call twice at the same time: the primary key stops a second row.
-- Returns {"liked": true or false, "count": the new total}.
create or replace function public.article_like_toggle(p_article uuid, p_visitor text)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_liked boolean;
  v_count integer;
begin
  if not exists (
    select 1 from public.articles
    where id = p_article and status = 'published' and published_at is not null and published_at <= now()
  ) then
    raise exception 'not_available';
  end if;

  delete from public.article_likes where article_id = p_article and visitor_hash = p_visitor;
  if found then
    v_liked := false;
  else
    insert into public.article_likes (article_id, visitor_hash) values (p_article, p_visitor)
      on conflict do nothing;
    v_liked := true;
  end if;

  select a.like_count into v_count from public.articles a where a.id = p_article;
  return jsonb_build_object('liked', v_liked, 'count', coalesce(v_count, 0));
end;
$$;

-- Only the server (service role) may call it.
revoke all on function public.article_like_toggle(uuid, text) from public, anon, authenticated;
grant execute on function public.article_like_toggle(uuid, text) to service_role;