-- ============================================================
-- inkpage | 20261118000000 | initial schema
-- Tabel: profiles, blocks, events
-- CATATAN: file ini DOKUMENTASI dari SQL yang sudah dijalankan di
-- Supabase. Jangan dijalankan ulang di project yang sama.
-- Perubahan skema berikutnya = file migrasi BARU, jangan ubah file ini.
-- ============================================================

-- profiles: satu baris per pengguna (id = auth.users.id)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),
  display_name text not null,
  bio text,
  avatar_url text,
  theme text not null default 'paper',
  created_at timestamptz not null default now()
);

-- blocks: isi halaman publik (link, header, teks)
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('link','header','text')),
  title text not null,
  url text,
  body text,
  position integer not null default 0,
  is_visible boolean not null default true,
  is_pinned boolean not null default false,
  publish_at timestamptz,
  expire_at timestamptz,
  created_at timestamptz not null default now()
);
create index blocks_user_position_idx on public.blocks (user_id, position);

-- events: catatan view dan klik untuk analytics
create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  block_id uuid references public.blocks(id) on delete cascade,
  kind text not null check (kind in ('view','click')),
  device text,
  referrer text,
  created_at timestamptz not null default now()
);
create index events_user_created_idx on public.events (user_id, created_at desc);