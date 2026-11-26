-- Guide schedule (run once in Supabase > SQL Editor > New query > Run). Safe to run again.
-- Requires booking-permissions.sql to have been run first.
--
-- New permissions: guides (see the guide schedule; everyone by default) and
-- guides_edit (change codes, add or remove guides; Operations & Finance and Admin Manager by default).

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

create table if not exists public.guide_staff (
  name text primary key,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- One row per guide per day. code: M office, S snorkeling, T tour, G group, DO day off,
-- DO REQ day off requested, DC doctor certificate, CT leave, PH public holiday, INSP.
create table if not exists public.guide_roster (
  guide text not null references public.guide_staff(name) on update cascade on delete cascade,
  day date not null,
  code text not null,
  updated_by uuid default auth.uid() references auth.users(id),
  updated_at timestamptz not null default now(),
  primary key (guide, day)
);
create index if not exists guide_roster_day_idx on public.guide_roster (day);

alter table public.guide_staff enable row level security;
alter table public.guide_roster enable row level security;

drop policy if exists guide_staff_read on public.guide_staff;
create policy guide_staff_read on public.guide_staff for select to authenticated using (public.has_section('guides'));
drop policy if exists guide_staff_write on public.guide_staff;
create policy guide_staff_write on public.guide_staff for all to authenticated
  using (public.has_section('guides_edit')) with check (public.has_section('guides_edit'));

drop policy if exists guide_roster_read on public.guide_roster;
create policy guide_roster_read on public.guide_roster for select to authenticated using (public.has_section('guides'));
drop policy if exists guide_roster_write on public.guide_roster;
create policy guide_roster_write on public.guide_roster for all to authenticated
  using (public.has_section('guides_edit')) with check (public.has_section('guides_edit'));

insert into public.guide_staff (name, sort_order) values
  ('Wira Yuda', 1), ('Sri', 2), ('April', 3), ('Mang Beby', 4), ('Jody', 5), ('Hans', 6), ('Topan', 7)
on conflict (name) do nothing;
