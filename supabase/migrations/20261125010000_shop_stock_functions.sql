-- inkpage: 20261125010000_shop_stock_functions
-- Purpose: phase 18d. Atomic stock for the shop: reserve, release, settle, expire holds.
-- Only the server (service role) may call these functions.

-- Fast lookup of holds that ran out.
create index if not exists orders_pending_expiry_idx
  on public.orders (expires_at) where status = 'pending';

-- shop_reserve: take one unit of stock and create the order (pending, or paid at once for a free product).
-- The price is read here from the product row, never from the browser.
create or replace function public.shop_reserve(
  p_product uuid,
  p_email text,
  p_provider text,
  p_token_hash text,
  p_terms_version text,
  p_hold_minutes integer
) returns uuid
language plpgsql
as $$
declare
  v_product public.products%rowtype;
  v_open boolean;
  v_free boolean;
  v_order uuid;
begin
  select * into v_product from public.products
    where id = p_product and status = 'active'
    for update;
  if not found then raise exception 'not_available'; end if;

  select is_open into v_open from public.shop_settings where user_id = v_product.user_id;
  if not coalesce(v_open, false) then raise exception 'shop_closed'; end if;

  if v_product.stock is not null and v_product.stock <= 0 then raise exception 'sold_out'; end if;

  v_free := v_product.price_usd_cents <= 0;

  -- A free product: one claim per email.
  if v_free and exists (
    select 1 from public.orders
    where product_id = p_product and lower(email) = lower(p_email) and status in ('pending', 'paid')
  ) then
    raise exception 'already_claimed';
  end if;

  -- At most 3 unfinished orders per email.
  if (
    select count(*) from public.orders
    where lower(email) = lower(p_email) and status = 'pending' and expires_at > now()
  ) >= 3 then
    raise exception 'too_many_pending';
  end if;

  if v_product.stock is not null then
    update public.products set stock = stock - 1, updated_at = now() where id = p_product;
  end if;

  insert into public.orders (
    user_id, product_id, email, status, provider, amount_cents, currency,
    token_hash, terms_version, terms_accepted_at, expires_at, paid_at
  ) values (
    v_product.user_id, p_product, lower(p_email),
    case when v_free then 'paid' else 'pending' end,
    case when v_free then 'free' else p_provider end,
    v_product.price_usd_cents, 'USD',
    p_token_hash, p_terms_version, now(),
    case when v_free then null else now() + make_interval(mins => p_hold_minutes) end,
    case when v_free then now() else null end
  ) returning id into v_order;

  return v_order;
end;
$$;

-- shop_release: close a pending order (failed, expired, canceled) and give the stock back ONCE.
create or replace function public.shop_release(p_order uuid, p_status text) returns boolean
language plpgsql
as $$
declare
  v_product uuid;
begin
  if p_status not in ('failed', 'expired', 'canceled') then
    raise exception 'bad_status';
  end if;

  update public.orders set status = p_status
    where id = p_order and status = 'pending'
    returning product_id into v_product;
  if not found then return false; end if;

  update public.products set stock = stock + 1, updated_at = now()
    where id = v_product and stock is not null;
  return true;
end;
$$;

-- shop_settle: a payment arrived. Safe to call twice.
-- Returns: paid, already_paid, paid_late, needs_review, not_found, or the current status.
create or replace function public.shop_settle(p_order uuid, p_provider_ref text) returns text
language plpgsql
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order for update;
  if not found then return 'not_found'; end if;

  if v_order.status = 'paid' then return 'already_paid'; end if;

  if v_order.status = 'pending' then
    update public.orders
      set status = 'paid', paid_at = now(), provider_ref = coalesce(p_provider_ref, provider_ref)
      where id = p_order;
    return 'paid';
  end if;

  -- Late payment: the hold is gone. Try to take the stock again.
  if v_order.status in ('expired', 'canceled', 'failed') then
    update public.products
      set stock = case when stock is null then null else stock - 1 end, updated_at = now()
      where id = v_order.product_id and (stock is null or stock > 0);
    if found then
      update public.orders
        set status = 'paid', paid_at = now(), provider_ref = coalesce(p_provider_ref, provider_ref)
        where id = p_order;
      return 'paid_late';
    end if;
    update public.orders
      set status = 'needs_review', provider_ref = coalesce(p_provider_ref, provider_ref)
      where id = p_order;
    return 'needs_review';
  end if;

  return v_order.status;
end;
$$;

-- shop_expire_holds: close every pending order whose hold ran out and give the stock back.
create or replace function public.shop_expire_holds() returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  with expired as (
    update public.orders set status = 'expired'
      where status = 'pending' and expires_at is not null and expires_at < now()
      returning product_id
  ),
  restored as (
    update public.products p set stock = p.stock + e.n, updated_at = now()
      from (select product_id, count(*)::integer as n from expired group by product_id) e
      where p.id = e.product_id and p.stock is not null
      returning p.id
  )
  select count(*) into v_count from expired;
  return coalesce(v_count, 0);
end;
$$;

-- Only the server (service role) may call these.
revoke all on function public.shop_reserve(uuid, text, text, text, text, integer) from public, anon, authenticated;
revoke all on function public.shop_release(uuid, text) from public, anon, authenticated;
revoke all on function public.shop_settle(uuid, text) from public, anon, authenticated;
revoke all on function public.shop_expire_holds() from public, anon, authenticated;
grant execute on function public.shop_reserve(uuid, text, text, text, text, integer) to service_role;
grant execute on function public.shop_release(uuid, text) to service_role;
grant execute on function public.shop_settle(uuid, text) to service_role;
grant execute on function public.shop_expire_holds() to service_role;