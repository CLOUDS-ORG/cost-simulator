-- Folder per agent for contract files (run once in Supabase > SQL Editor > New query > Run). Safe to run again.
-- Requires booking-rates.sql. Creates the private storage bucket "contract-files"; only accounts with the
-- Accounting permission can list, upload, open and delete files in it. Folder = one agent.

insert into storage.buckets (id, name, public)
values ('contract-files', 'contract-files', false)
on conflict (id) do nothing;

drop policy if exists contract_files_read on storage.objects;
create policy contract_files_read on storage.objects for select to authenticated
  using (bucket_id = 'contract-files' and public.has_section('accounting'));
drop policy if exists contract_files_insert on storage.objects;
create policy contract_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'contract-files' and public.has_section('accounting'));
drop policy if exists contract_files_update on storage.objects;
create policy contract_files_update on storage.objects for update to authenticated
  using (bucket_id = 'contract-files' and public.has_section('accounting'))
  with check (bucket_id = 'contract-files' and public.has_section('accounting'));
drop policy if exists contract_files_delete on storage.objects;
create policy contract_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'contract-files' and public.has_section('accounting'));
