-- Fine-grained page and booking permissions per account (run once in Supabase > SQL Editor > New query > Run).
-- Safe to run again. Requires booking-dashboard.sql to have been run first.
--
-- profiles.section_access: NULL = the role's defaults. A list = exactly those permissions:
--   bookings (view bookings), booking_add, booking_edit, quotes, lists (edit vendor lists),
--   dashboard, accounting, simulator (Cost simulator). The master admin (GOD) always has everything.

create or replace function public.has_section(k text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'Approved'
      and (
        p.role = 'GOD'
        or case when p.section_access is not null then k = any(p.section_access)
                else case k
                  when 'dashboard' then p.role in ('Operations & Finance', 'Admin Manager')
                  when 'accounting' then p.role in ('Operations & Finance', 'Admin Manager')
                  when 'lists' then coalesce(p.can_edit_catalog, false)
                  when 'bookings' then true
                  when 'booking_edit' then true
                  when 'booking_add' then p.role <> 'Booking Staff'
                  when 'quotes' then p.role <> 'Booking Staff'
                  when 'simulator' then p.role <> 'Booking Staff'
                  else false end
           end
      )
  );
$$;

-- Bookings: view / add / edit are separate permissions (delete stays master-admin only).
drop policy if exists bookings_read on public.bookings;
create policy bookings_read on public.bookings for select to authenticated
  using (public.has_section('bookings'));
drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings for insert to authenticated
  with check (public.has_section('booking_add'));
drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings for update to authenticated
  using (public.has_section('booking_edit'))
  with check (public.has_section('booking_edit'));

-- Vendor lists (dropdowns of the booking form).
drop policy if exists booking_options_write on public.booking_options;
create policy booking_options_write on public.booking_options for all to authenticated
  using (public.has_section('lists'))
  with check (public.has_section('lists'));
