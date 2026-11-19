-- STEP 2 (after schema.sql).
-- 1) In Supabase > Authentication > Users > Add user > Create new user:
--    enter your admin email + a strong password and TICK "Auto Confirm User".
-- 2) Put the SAME email below (and the username you want), then Run this file.
insert into public.profiles (id, username, email, name, role, status, min_margin,
  can_see_vendor_costs, can_edit_catalog, can_override_costs, can_edit_presets,
  can_see_all_dashboard_quotes, can_access_dashboard)
select id, 'admin', email, 'Master Admin', 'GOD', 'Approved', 0,
  true, true, true, true, true, true
from auth.users
where email = 'YOUR_ADMIN_EMAIL_HERE'
on conflict (id) do nothing;
