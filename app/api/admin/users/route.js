import { createClient } from "@supabase/supabase-js";

// Server-only route: creates, deletes, edits rules of and resets passwords for team accounts.
// Uses the secret service-role key, which must NEVER be exposed to the browser.

const FREELANCE_ROLES = ["Freelance Sales", "Partner Agency / B2B Reseller"];
// Booking Staff only see and edit bookings: no costs, quotes, catalog or dashboard, whatever the form says.
const BOOKING_ROLE = "Booking Staff";
const isRestricted = (role) => FREELANCE_ROLES.includes(role) || role === BOOKING_ROLE;
const EDITABLE_ROLES = [
  "Staff Agent",
  "Freelance Sales",
  "Partner Agency / B2B Reseller",
  "Tour Guide / Field Lead",
  "Operations & Finance",
  "Admin Manager",
  BOOKING_ROLE,
];

// Permissions of the bookings app that can be switched on or off per account (null = the role's defaults).
// Keep in step with PERMISSIONS in app/bookings/sections.js and has_section() in supabase/booking-permissions.sql.
const ALL_PERMS = ["bookings", "booking_add", "booking_edit", "quotes", "lists", "guides", "guides_edit", "dashboard", "accounting", "simulator"];
function allowedPerms(role) {
  if (role === BOOKING_ROLE) return ["bookings", "booking_add", "booking_edit", "lists", "guides"]; // never money or quotes
  if (FREELANCE_ROLES.includes(role)) return ALL_PERMS.filter((k) => k !== "dashboard" && k !== "accounting" && k !== "guides_edit");
  return ALL_PERMS;
}
const cleanAccess = (role, list) => (Array.isArray(list) ? allowedPerms(role).filter((k) => list.includes(k)) : null);

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function json(body, status = 200) {
  return Response.json(body, { status });
}

// Confirms the caller is a signed-in, approved GOD user.
async function requireGod(request, admin) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return { error: json({ error: "Not signed in." }, 401) };

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { error: json({ error: "Not signed in." }, 401) };

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "GOD" || profile.status !== "Approved") {
    return { error: json({ error: "Only the master admin can manage accounts." }, 403) };
  }
  return { caller: profile };
}

function toClient(p) {
  return {
    id: p.id,
    username: p.username,
    email: p.email,
    name: p.name,
    role: p.role,
    status: p.status,
    minMargin: Number(p.min_margin),
    canSeeVendorCosts: p.can_see_vendor_costs,
    canEditCatalog: p.can_edit_catalog,
    canOverrideCosts: p.can_override_costs,
    canEditPresets: p.can_edit_presets,
    canSeeAllDashboardQuotes: p.can_see_all_dashboard_quotes,
    canAccessDashboard: p.can_access_dashboard,
    sectionAccess: p.section_access ?? null,
    createdAt: (p.created_at || "").slice(0, 10),
  };
}

export async function POST(request) {
  const admin = adminClient();
  if (!admin) return json({ error: "Server is missing SUPABASE_SERVICE_ROLE_KEY." }, 500);
  const auth = await requireGod(request, admin);
  if (auth.error) return auth.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const username = String(body.username || "").trim().toLowerCase();
  const name = String(body.name || "").trim();
  const password = String(body.password || "");
  const role = String(body.role || "Staff Agent");
  // Sign-in address is derived from the username so "username + password" always works.
  const loginEmail = `${username}@tourhq.com`;
  const email = String(body.email || "").trim().toLowerCase() || loginEmail;

  if (!/^[a-z0-9._-]{2,32}$/.test(username)) {
    return json({ error: "Username must be 2-32 characters: letters, numbers, dot, dash or underscore." }, 400);
  }
  if (!/^[^\s@,()"']+@[^\s@,()"']+\.[^\s@,()"']+$/.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }
  if (!name) return json({ error: "Full name is required." }, 400);
  if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);

  const { data: taken } = await admin
    .from("profiles")
    .select("id")
    .or(`username.eq.${username},email.eq.${email}`)
    .limit(1);
  if (taken && taken.length) return json({ error: "Username or email already exists." }, 409);

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: loginEmail,
    password,
    email_confirm: true,
  });
  if (createErr || !created?.user) {
    return json({ error: createErr?.message || "Could not create the account." }, 400);
  }

  const isFreelance = isRestricted(role);
  const row = {
    id: created.user.id,
    username,
    email,
    name,
    role,
    status: "Approved",
    min_margin: Number(body.minMargin) || 0,
    can_see_vendor_costs: isFreelance ? false : body.canSeeVendorCosts !== false,
    can_edit_catalog: isFreelance ? false : !!body.canEditCatalog,
    can_override_costs: isFreelance ? false : !!body.canOverrideCosts,
    can_edit_presets: isFreelance ? false : !!body.canEditPresets,
    can_see_all_dashboard_quotes: isFreelance ? false : !!body.canSeeAllDashboardQuotes,
    can_access_dashboard: role === BOOKING_ROLE ? false : body.canAccessDashboard !== false,
    section_access: cleanAccess(role, body.sectionAccess),
  };

  const { data: profile, error: profileErr } = await admin.from("profiles").insert(row).select().single();
  if (profileErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: profileErr.message }, 400);
  }
  return json({ user: toClient(profile) });
}

export async function DELETE(request) {
  const admin = adminClient();
  if (!admin) return json({ error: "Server is missing SUPABASE_SERVICE_ROLE_KEY." }, 500);
  const auth = await requireGod(request, admin);
  if (auth.error) return auth.error;

  const { id } = await request.json().catch(() => ({}));
  if (!id) return json({ error: "Missing account id." }, 400);
  if (id === auth.caller.id) return json({ error: "You cannot delete your own account." }, 400);

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}

export async function PATCH(request) {
  const admin = adminClient();
  if (!admin) return json({ error: "Server is missing SUPABASE_SERVICE_ROLE_KEY." }, 500);
  const auth = await requireGod(request, admin);
  if (auth.error) return auth.error;

  const { id, password, rules } = await request.json().catch(() => ({}));

  // Edit an account's rules: name, role, minimum margin and permissions.
  if (id && rules && typeof rules === "object") {
    const name = String(rules.name || "").trim();
    const role = String(rules.role || "");
    const minMargin = Number(rules.minMargin);
    if (!name) return json({ error: "Full name is required." }, 400);
    if (!EDITABLE_ROLES.includes(role)) return json({ error: "Please choose a valid role." }, 400);
    if (!Number.isFinite(minMargin) || minMargin < 0 || minMargin > 100) {
      return json({ error: "Min profit margin must be between 0 and 100." }, 400);
    }

    const { data: target } = await admin.from("profiles").select("id, role, section_access").eq("id", id).maybeSingle();
    if (!target) return json({ error: "Account not found." }, 404);
    if (target.role === "GOD") return json({ error: "The master admin's rules cannot be changed." }, 400);

    const isFreelance = isRestricted(role);
    const update = {
      name,
      role,
      min_margin: minMargin,
      can_see_vendor_costs: isFreelance ? false : !!rules.canSeeVendorCosts,
      can_edit_catalog: isFreelance ? false : !!rules.canEditCatalog,
      can_override_costs: isFreelance ? false : !!rules.canOverrideCosts,
      can_edit_presets: isFreelance ? false : !!rules.canEditPresets,
      can_see_all_dashboard_quotes: isFreelance ? false : !!rules.canSeeAllDashboardQuotes,
      can_access_dashboard: role === BOOKING_ROLE ? false : rules.canAccessDashboard !== false,
    };
    // The Accounts page sends the list; the old editor does not, so the saved list is kept (and trimmed to what the role may have).
    update.section_access = cleanAccess(role, "sectionAccess" in rules ? rules.sectionAccess : target.section_access);
    const { data: updated, error: updateErr } = await admin
      .from("profiles")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (updateErr) return json({ error: updateErr.message }, 400);
    return json({ user: toClient(updated) });
  }

  if (!id || typeof password !== "string" || password.length < 8) {
    return json({ error: "Password must be at least 8 characters." }, 400);
  }
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}
