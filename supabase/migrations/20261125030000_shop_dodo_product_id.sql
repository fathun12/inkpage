-- inkpage: 20261125030000_shop_dodo_product_id
-- Purpose: link each shop product to its product on Dodo Payments (phase 18d-2).
-- The Dodo checkout needs the id of a product created in the Dodo dashboard.

alter table public.products
  add column if not exists dodo_product_id text
  check (dodo_product_id is null or char_length(dodo_product_id) between 1 and 100);