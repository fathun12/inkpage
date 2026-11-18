-- ============================================================
-- inkpage | 20261118010000 | row level security
-- DOKUMENTASI dari SQL yang sudah dijalankan. Jangan dijalankan ulang.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.blocks enable row level security;
alter table public.events enable row level security;

-- profiles: publik boleh membaca, hanya pemilik menulis
create policy "profiles are public" on public.profiles
  for select using (true);
create policy "owner inserts profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "owner updates profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- blocks: publik membaca yang is_visible, pemilik mengelola miliknya
-- (jadwal tampil/sembunyi dicek di kode, lib/schedule.ts, bukan di sini)
create policy "visible blocks are public" on public.blocks
  for select using (is_visible);
create policy "owner reads blocks" on public.blocks
  for select to authenticated using (auth.uid() = user_id);
create policy "owner inserts blocks" on public.blocks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "owner updates blocks" on public.blocks
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes blocks" on public.blocks
  for delete to authenticated using (auth.uid() = user_id);

-- events: siapa saja boleh mencatat (profil harus ada), hanya pemilik yang membaca
create policy "anyone records events" on public.events
  for insert to anon, authenticated
  with check (kind in ('view','click') and exists (select 1 from public.profiles p where p.id = user_id));
create policy "owner reads events" on public.events
  for select to authenticated using (auth.uid() = user_id);