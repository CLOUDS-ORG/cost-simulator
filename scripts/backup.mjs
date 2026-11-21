// Exports all app data from Supabase to a single JSON file.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backup.mjs out.json
import { writeFileSync } from "node:fs";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const out = process.argv[2] || "backup.json";
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function getJson(path) {
  const res = await fetch(`${url}${path}`, { headers });
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
}

async function table(name) {
  const rows = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const res = await fetch(`${url}/rest/v1/${name}?select=*`, {
      headers: { ...headers, Range: `${from}-${from + size - 1}` },
    });
    if (!res.ok) throw new Error(`${name} -> HTTP ${res.status}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < size) break;
  }
  return rows;
}

const data = { exportedAt: new Date().toISOString(), tables: {}, authUsers: [] };
for (const t of ["profiles", "app_state", "quotes", "activity_logs"]) {
  data.tables[t] = await table(t);
  console.log(`${t}: ${data.tables[t].length} rows`);
}
for (let page = 1; ; page++) {
  const res = await getJson(`/auth/v1/admin/users?page=${page}&per_page=200`);
  const users = res.users || [];
  data.authUsers.push(...users.map((u) => ({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at })));
  if (users.length < 200) break;
}
console.log(`auth users: ${data.authUsers.length}`);
writeFileSync(out, JSON.stringify(data, null, 2));
