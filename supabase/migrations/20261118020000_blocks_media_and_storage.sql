-- ============================================================
-- inkpage | 20261118020000 | blocks media, new block types, storage
-- Menambah: kolom image_url + data (jsonb) di blocks, tipe blok baru
-- (embed, gallery, socials, countdown, project), bucket Storage "media".
-- Jalankan SEKALI di Supabase SQL Editor. Jangan diubah setelah dijalankan.
-- ============================================================

-- 1. Kolom baru di blocks
alter table public.blocks
  add column if not exists image_url text,
  add column if not exists data jsonb not null default '{}'::jsonb;

-- 2. Perluas daftar tipe blok (hapus check lama apa pun namanya, pasang yang baru)
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.blocks'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%type%'
  loop
    execute format('alter table public.blocks drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.blocks add constraint blocks_type_check
  check (type in ('link','header','text','embed','gallery','socials','countdown','project'));

-- 3. Bucket publik "media": maks 2 MB, hanya JPG/PNG/WebP
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 4. Policy: pengguna hanya mengelola file di folder miliknya ({user_id}/...)
create policy "owner uploads media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner reads own media" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner updates own media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner deletes own media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
