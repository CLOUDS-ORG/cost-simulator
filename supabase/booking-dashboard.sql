-- Booking dashboard + account permissions (run once in Supabase > SQL Editor > New query > Run).
-- Safe to run again. Requires booking-accounting.sql to have been run first.

-- 1. Per-account access to the Accounting and Dashboard pages.
--    NULL = use the role default (GOD, Operations & Finance, Admin Manager); an array = exactly those pages.
alter table public.profiles add column if not exists section_access text[];

create or replace function public.has_section(k text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'Approved'
      and (
        p.role = 'GOD'
        or case when p.section_access is not null then k = any(p.section_access)
                else p.role in ('Operations & Finance', 'Admin Manager') end
      )
  );
$$;

create or replace function public.is_accounting() returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_section('accounting');
$$;

-- 2. Sale price per booking (what the guest paid). Only accounting may write it; the dashboard may read it.
create table if not exists public.booking_finance (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  sale_price numeric not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users(id)
);
alter table public.booking_finance enable row level security;

drop policy if exists booking_finance_read on public.booking_finance;
create policy booking_finance_read on public.booking_finance for select to authenticated
  using (public.has_section('accounting') or public.has_section('dashboard'));
drop policy if exists booking_finance_insert on public.booking_finance;
create policy booking_finance_insert on public.booking_finance for insert to authenticated
  with check (public.is_accounting());
drop policy if exists booking_finance_update on public.booking_finance;
create policy booking_finance_update on public.booking_finance for update to authenticated
  using (public.is_accounting()) with check (public.is_accounting());
drop policy if exists booking_finance_delete on public.booking_finance;
create policy booking_finance_delete on public.booking_finance for delete to authenticated
  using (public.is_accounting());
revoke all on public.booking_finance from anon;

-- 3. Hotel areas: dashboard users may read them (to work out costs), only accounting may change them.
drop policy if exists booking_hotel_areas_all on public.booking_hotel_areas;
drop policy if exists booking_hotel_areas_read on public.booking_hotel_areas;
create policy booking_hotel_areas_read on public.booking_hotel_areas for select to authenticated
  using (public.has_section('accounting') or public.has_section('dashboard'));
drop policy if exists booking_hotel_areas_write on public.booking_hotel_areas;
create policy booking_hotel_areas_write on public.booking_hotel_areas for all to authenticated
  using (public.is_accounting()) with check (public.is_accounting());
