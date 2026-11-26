-- Guide accounts (role "Tour Guide / Field Lead") see only their own work (run once in Supabase > SQL Editor > New query > Run).
-- Safe to run again. Requires booking-guides.sql to have been run first.
--
-- A guide account is matched to a guide by NAME: the account name must be the guide's name in the
-- Guide schedule (guide_staff), for example account "Mang Beby" = guide "Mang Beby".
-- What a guide may see:
--   * bookings whose Guide field contains the account name (a booking typed "Beby" matches the account "Mang Beby")
--   * only their own row of the guide schedule
-- A guide never gets money, quotes, vendor lists, the cost catalog, or edit rights, whatever the
-- per-account permission list says (the database caps it at: bookings, guides).

-- Does a Guide field ("Beby, Wayan" / "Beby & Wayan") name this guide?
create or replace function public.guide_field_matches(field text, me text) returns boolean
language sql immutable as $$
  select coalesce(bool_or(
           lower(btrim(t)) = lower(btrim(me))
           or lower(btrim(me)) = any (string_to_array(lower(btrim(t)), ' '))
           or lower(btrim(t)) = any (string_to_array(lower(btrim(me)), ' '))
         ), false)
  from regexp_split_to_table(coalesce(field, ''), '\s*(,|;|&|/|\n|\yand\y)\s*', 'i') as t
  where btrim(t) <> '' and btrim(coalesce(me, '')) <> '';
$$;

create or replace function public.is_guide_account() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'Tour Guide / Field Lead' and status = 'Approved');
$$;

create or replace function public.my_name() returns text
language sql stable security definer set search_path = public as $$
  select name from public.profiles where id = auth.uid();
$$;

-- Same as before, plus: a guide account only ever has bookings and guides.
create or replace function public.has_section(k text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'Approved'
      and (
        p.role = 'GOD'
        or case
             when p.role = 'Tour Guide / Field Lead' then k in ('bookings', 'guides')
             when p.section_access is not null then k = any(p.section_access)
             else case k
                  when 'dashboard' then p.role in ('Operations & Finance', 'Admin Manager')
                  when 'accounting' then p.role in ('Operations & Finance', 'Admin Manager')
                  when 'guides_edit' then p.role in ('Operations & Finance', 'Admin Manager')
                  when 'lists' then coalesce(p.can_edit_catalog, false)
                  when 'bookings' then true
                  when 'guides' then p.role not in ('Freelance Sales', 'Partner Agency / B2B Reseller')
                  when 'booking_edit' then true
                  when 'booking_add' then p.role <> 'Booking Staff'
                  when 'quotes' then p.role <> 'Booking Staff'
                  when 'simulator' then p.role <> 'Booking Staff'
                  else false end
           end
      )
  );
$$;

-- Bookings: a guide account reads only the bookings that name it.
drop policy if exists bookings_read on public.bookings;
create policy bookings_read on public.bookings for select to authenticated
  using (
    public.has_section('bookings')
    and (not public.is_guide_account() or public.guide_field_matches(guide, public.my_name()))
  );

-- Guide schedule: a guide account reads only its own row and its own days.
drop policy if exists guide_staff_read on public.guide_staff;
create policy guide_staff_read on public.guide_staff for select to authenticated
  using (
    public.has_section('guides')
    and (not public.is_guide_account() or lower(btrim(name)) = lower(btrim(public.my_name())))
  );
drop policy if exists guide_roster_read on public.guide_roster;
create policy guide_roster_read on public.guide_roster for select to authenticated
  using (
    public.has_section('guides')
    and (not public.is_guide_account() or lower(btrim(guide)) = lower(btrim(public.my_name())))
  );

-- Cost catalog and presets (app_state): Booking Staff and guide accounts may not read them.
drop policy if exists app_state_read on public.app_state;
create policy app_state_read on public.app_state for select to authenticated
  using (public.is_active_user() and not public.is_booking_staff() and not public.is_guide_account());
