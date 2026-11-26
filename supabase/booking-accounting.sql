-- Accounting page for bookings: who may open it, and where confirmed hotel areas are stored.
-- Safe to run more than once. Run in the Supabase SQL editor.
-- The roles here must match ACCOUNTING_ROLES in app/bookings/costing.js.

create or replace function public.is_accounting() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'Approved'
      and role in ('GOD', 'Operations & Finance', 'Admin Manager')
  );
$$;

-- Hotel name -> area (Kuta, Nusa Dua, ...). Decides which "<Area> Transfer" rate from the cost simulator applies.
create table if not exists public.booking_hotel_areas (
  hotel_key text primary key,          -- hotel name, lower case, single spaces
  hotel_name text not null,
  area text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users(id)
);

alter table public.booking_hotel_areas enable row level security;

drop policy if exists booking_hotel_areas_all on public.booking_hotel_areas;
create policy booking_hotel_areas_all on public.booking_hotel_areas for all to authenticated
  using (public.is_accounting())
  with check (public.is_accounting());

revoke all on public.booking_hotel_areas from anon;
