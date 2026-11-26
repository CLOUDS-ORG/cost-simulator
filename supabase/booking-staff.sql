-- Booking Staff role: can view and edit bookings only.
-- Safe to run more than once. Run in the Supabase SQL editor.

create or replace function public.is_booking_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'Booking Staff' and status = 'Approved');
$$;

-- Booking Staff may NOT create bookings (they can still read and edit them; only the master admin deletes).
drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings for insert to authenticated
  with check (public.is_active_user() and not public.is_booking_staff());

-- Booking Staff may NOT read the cost catalog / presets stored in app_state.
drop policy if exists app_state_read on public.app_state;
create policy app_state_read on public.app_state for select to authenticated
  using (public.is_active_user() and not public.is_booking_staff());
