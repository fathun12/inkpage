-- inkpage: 20261126010000_shop_license_note_1000
-- Purpose: the license note of a product can be up to 1000 characters (was 300).

-- Drop the old length check (found by what it checks, so the name does not matter).
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.products'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%license_note%'
  loop
    execute format('alter table public.products drop constraint %I', c.conname);
  end loop;
end $$;

-- New check: up to 1000 characters.
alter table public.products
  add constraint products_license_note_length
  check (license_note is null or char_length(license_note) <= 1000);