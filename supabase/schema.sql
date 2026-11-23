-- Tour HQ / Cost Simulator - Supabase schema
-- Run this whole file once in Supabase > SQL Editor > New query > Run.

-- ============ Tables ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null,
  name text not null,
  role text not null default 'Staff Agent',
  status text not null default 'Approved',
  min_margin numeric not null default 20,
  can_see_vendor_costs boolean not null default true,
  can_edit_catalog boolean not null default false,
  can_override_costs boolean not null default false,
  can_edit_presets boolean not null default false,
  can_see_all_dashboard_quotes boolean not null default false,
  can_access_dashboard boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.app_state (
  key text primary key,            -- 'catalog' | 'presets' | 'ai_prompt' | 'quote_templates'
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.quotes (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id),
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- ============ Helper functions (avoid RLS recursion) ============
create or replace function public.is_god() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'GOD' and status = 'Approved');
$$;

create or replace function public.has_flag(flag text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((
    select case flag
      when 'catalog' then can_edit_catalog
      when 'presets' then can_edit_presets
      when 'all_quotes' then can_see_all_dashboard_quotes
      else false end
    from public.profiles where id = auth.uid() and status = 'Approved'
  ), false);
$$;

create or replace function public.is_active_user() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'Approved');
$$;

-- ============ Row level security ============
alter table public.profiles enable row level security;
alter table public.app_state enable row level security;
alter table public.quotes enable row level security;
alter table public.activity_logs enable row level security;

-- profiles: you can read your own row; GOD reads all. Writes happen only through the
-- server route (service role), so there are no insert/update/delete policies.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_god());

-- app_state: all approved users read; only permitted editors write.
drop policy if exists app_state_read on public.app_state;
create policy app_state_read on public.app_state for select to authenticated
  using (public.is_active_user());

drop policy if exists app_state_insert on public.app_state;
create policy app_state_insert on public.app_state for insert to authenticated
  with check (
    public.is_god()
    or (key = 'catalog' and public.has_flag('catalog'))
    or (key = 'presets' and public.has_flag('presets'))
    or (key = 'quote_templates' and public.has_flag('presets'))
  );

drop policy if exists app_state_update on public.app_state;
create policy app_state_update on public.app_state for update to authenticated
  using (
    public.is_god()
    or (key = 'catalog' and public.has_flag('catalog'))
    or (key = 'presets' and public.has_flag('presets'))
    or (key = 'quote_templates' and public.has_flag('presets'))
  )
  with check (
    public.is_god()
    or (key = 'catalog' and public.has_flag('catalog'))
    or (key = 'presets' and public.has_flag('presets'))
    or (key = 'quote_templates' and public.has_flag('presets'))
  );

-- quotes: own quotes; GOD or "see all quotes" users see and update everyone's.
drop policy if exists quotes_read on public.quotes;
create policy quotes_read on public.quotes for select to authenticated
  using (public.is_active_user() and (owner_id = auth.uid() or public.is_god() or public.has_flag('all_quotes')));

drop policy if exists quotes_insert on public.quotes;
create policy quotes_insert on public.quotes for insert to authenticated
  with check (public.is_active_user() and owner_id = auth.uid());

drop policy if exists quotes_update on public.quotes;
create policy quotes_update on public.quotes for update to authenticated
  using (public.is_active_user() and (owner_id = auth.uid() or public.is_god() or public.has_flag('all_quotes')))
  with check (public.is_active_user() and (owner_id = auth.uid() or public.is_god() or public.has_flag('all_quotes')));

-- activity logs: anyone approved can write their own entries; only GOD reads.
drop policy if exists logs_insert on public.activity_logs;
create policy logs_insert on public.activity_logs for insert to authenticated
  with check (public.is_active_user() and user_id = auth.uid());

drop policy if exists logs_read on public.activity_logs;
create policy logs_read on public.activity_logs for select to authenticated
  using (public.is_god());

-- Make sure nothing is open to anonymous visitors.
revoke all on public.profiles, public.app_state, public.quotes, public.activity_logs from anon;
