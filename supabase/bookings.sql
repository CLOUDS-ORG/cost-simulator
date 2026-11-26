-- Alam Bali Santhi bookings (run once in Supabase > SQL Editor > New query > Run).
-- Safe to run again. Requires supabase/schema.sql to have been run first.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  quote_id text references public.quotes(id) on delete set null,
  activity_date date not null,
  guest_names text[] not null default '{}',
  nationality text not null default '',
  pax integer not null default 1,
  agent text not null default '',
  package text not null default '',
  hotel text not null default '',
  pickup_time text not null default '',
  boat_sanur text not null default '',
  boat_panida text not null default '',
  guide text not null default '',
  driver text not null default '',
  restaurant text not null default '',
  special_request text not null default '',
  inclusions text[] not null default '{}',
  status text not null default 'Confirmed' check (status in ('Confirmed', 'Done', 'Cancelled')),
  created_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_activity_date_idx on public.bookings (activity_date);
create index if not exists bookings_quote_id_idx on public.bookings (quote_id);

alter table public.bookings enable row level security;

-- Every approved team member can see and edit bookings (passenger lists contain no prices).
-- Only GOD can delete; everyone else sets the status to Cancelled instead.
drop policy if exists bookings_read on public.bookings;
create policy bookings_read on public.bookings for select to authenticated
  using (public.is_active_user());

drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings for insert to authenticated
  with check (public.is_active_user());

drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings for update to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

drop policy if exists bookings_delete on public.bookings;
create policy bookings_delete on public.bookings for delete to authenticated
  using (public.is_god());

revoke all on public.bookings from anon;
