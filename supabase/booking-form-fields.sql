-- Extra booking fields copied from the Google Form "INPUT BOOKING".
-- Safe to run more than once. Run in the Supabase SQL editor.

alter table public.bookings add column if not exists pic_agent text not null default '';
alter table public.bookings add column if not exists boat_vendor text[] not null default '{}';
alter table public.bookings add column if not exists car_unit text not null default '';
alter table public.bookings add column if not exists snorkeling_vendor text not null default '';
