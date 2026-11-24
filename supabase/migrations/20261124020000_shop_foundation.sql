-- inkpage: 20261124020000_shop_foundation
-- Purpose: foundation of the digital shop (phase 18b): tables, row level security
-- and the private file bucket "shop-files".
-- The stock functions (shop_reserve, shop_release, shop_settle) come with phase 18d.

-- shop_settings: one row per owner. Closed by default.
create table public.shop_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  is_open boolean not null default false,
  home_title text check (home_title is null or char_length(home_title) <= 60),
  terms text,
  privacy text,
  refund text,
  contact_email text check (contact_email is null or char_length(contact_email) <= 120),
  updated_at timestamptz not null default now()
);

-- products: what is for sale. Price in cents (USD), stock null = unlimited.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 80),
  description text check (description is null or char_length(description) <= 2000),
  price_usd_cents integer not null default 0 check (price_usd_cents >= 0),
  price_idr integer check (price_idr is null or price_idr >= 0),
  stock integer check (stock is null or stock >= 0),
  included jsonb not null default '[]'::jsonb,
  license_note text check (license_note is null or char_length(license_note) <= 300),
  media jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  show_on_home boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);
create index products_user_position_idx on public.products (user_id, position);

-- product_files: the PRIVATE files a buyer downloads (stored in bucket shop-files)
create table public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  path text not null unique,
  name text not null check (char_length(name) between 1 and 120),
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_files_product_idx on public.product_files (product_id, position);

-- orders: one purchase. A product with orders cannot be deleted (archive it instead).
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'expired', 'canceled', 'refunded', 'needs_review')),
  provider text not null,
  provider_ref text,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'USD',
  token_hash text unique,
  terms_version text,
  terms_accepted_at timestamptz,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_product_idx on public.orders (product_id);

-- webhook_events: every payment event once (provider + event id is unique)
create table public.webhook_events (
  id bigint generated always as identity primary key,
  provider text not null,
  event_id text not null,
  payload jsonb,
  received_at timestamptz not null default now(),
  unique (provider, event_id)
);

-- downloads: log of file downloads (no IP address is stored)
create table public.downloads (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_file_id uuid references public.product_files(id) on delete set null,
  created_at timestamptz not null default now()
);
create index downloads_order_idx on public.downloads (order_id);

-- Row level security
alter table public.shop_settings enable row level security;
alter table public.products enable row level security;
alter table public.product_files enable row level security;
alter table public.orders enable row level security;
alter table public.webhook_events enable row level security;
alter table public.downloads enable row level security;

-- shop_settings: public may read (open/closed and legal texts are public), owner writes
create policy "shop settings are public" on public.shop_settings
  for select using (true);
create policy "owner inserts shop settings" on public.shop_settings
  for insert to authenticated with check (auth.uid() = user_id);
create policy "owner updates shop settings" on public.shop_settings
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- products: public reads active ones, owner manages all of his own
create policy "active products are public" on public.products
  for select using (status = 'active');
create policy "owner reads products" on public.products
  for select to authenticated using (auth.uid() = user_id);
create policy "owner inserts products" on public.products
  for insert to authenticated with check (auth.uid() = user_id);
create policy "owner updates products" on public.products
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes products" on public.products
  for delete to authenticated using (auth.uid() = user_id);

-- product_files: owner only, never public
create policy "owner reads product files" on public.product_files
  for select to authenticated using (auth.uid() = user_id);
create policy "owner inserts product files" on public.product_files
  for insert to authenticated with check (auth.uid() = user_id);
create policy "owner updates product files" on public.product_files
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes product files" on public.product_files
  for delete to authenticated using (auth.uid() = user_id);

-- orders and downloads: owner reads (orders: also updates). Buyers never read them directly.
-- Orders are created by the server in phase 18d.
create policy "owner reads orders" on public.orders
  for select to authenticated using (auth.uid() = user_id);
create policy "owner updates orders" on public.orders
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner reads downloads" on public.downloads
  for select to authenticated using (auth.uid() = user_id);

-- webhook_events: no policy on purpose. Only the server (service role, phase 18d) touches it.

-- Private bucket for the files that are sold: 50 MB per file, any file type
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-files', 'shop-files', false, 52428800, null)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies: the owner manages files in the folder {user_id}/...
create policy "owner uploads shop files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'shop-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner reads shop files" on storage.objects
  for select to authenticated
  using (bucket_id = 'shop-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner updates shop files" on storage.objects
  for update to authenticated
  using (bucket_id = 'shop-files' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'shop-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner deletes shop files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'shop-files' and (storage.foldername(name))[1] = auth.uid()::text);