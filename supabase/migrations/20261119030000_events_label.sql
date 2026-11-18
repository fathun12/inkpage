-- Inkpage
-- Migration: 20261119030000_events_label
-- Purpose: remember which item of a social links block was clicked,
--          so analytics can show one row per network.

-- Optional label on an event, for example "Instagram".
alter table public.events
  add column if not exists label text check (char_length(label) <= 40);