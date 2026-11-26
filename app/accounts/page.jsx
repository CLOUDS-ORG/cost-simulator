"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { PERMISSIONS, defaultPermissions, sectionsFor } from "../bookings/sections";
import ThemeToggle from "../bookings/ThemeToggle";
import AppMenu from "../bookings/AppMenu";

// Accounts & permissions: the master admin adds people, resets passwords, and decides who can open and do what.

const ROLES = [
  "Staff Agent",
  "Freelance Sales",
  "Partner Agency / B2B Reseller",
  "Tour Guide / Field Lead",
  "Operations & Finance",
  "Admin Manager",
  "Booking Staff",
];
const RESTRICTED = ["Freelance Sales", "Partner Agency / B2B Reseller", "Booking Staff"];
// Permissions a restricted role can never have (money and, for Booking Staff, quotes and the simulator).
const BLOCKED = {
  "Booking Staff": ["quotes", "dashboard", "accounting", "simulator"],
  "Freelance Sales": ["dashboard", "accounting"],
  "Partner Agency / B2B Reseller": ["dashboard", "accounting"],
};

const FLAGS = [
  ["can_see_vendor_costs", "canSeeVendorCosts", "See vendor costs in the Cost simulator"],
  ["can_edit_catalog", "canEditCatalog", "Edit the catalog in the Cost simulator"],
  ["can_override_costs", "canOverrideCosts", "Override costs in a quote"],
  ["can_edit_presets", "canEditPresets", "Edit presets"],
  ["can_see_all_dashboard_quotes", "canSeeAllDashboardQuotes", "See everyone's quotes"],
  ["can_access_dashboard", "canAccessDashboard", "Open the Cost simulator's own dashboard"],
];

const PRESETS = [
  { label: "Only view bookings", keys: ["bookings"] },
  { label: "View + add + edit bookings", keys: ["bookings", "booking_add", "booking_edit"] },
  { label: "Bookings + edit vendor lists", keys: ["bookings", "booking_add", "booking_edit", "lists"] },
];

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

const flagsFrom = (p) => Object.fromEntries(FLAGS.map(([col, key]) => [key, !!p[col]]));

function draftFrom(p) {
  return {
    name: p.name,
    role: p.role,
    minMargin: Number(p.min_margin),
    flags: flagsFrom(p),
    custom: Array.isArray(p.section_access),
    access: Array.isArray(p.section_access) ? p.section_access : [],
  };
}

const emptyNew = () => ({
  name: "",
  username: "",
  password: "",
  role: "Booking Staff",
  minMargin: 20,
  flags: Object.fromEntries(FLAGS.map(([, key]) => [key, key === "canSeeVendorCosts" || key === "canAccessDashboard"])),
  custom: false,
  access: [],
});

function PermissionEditor({ draft, setDraft }) {
  const restricted = RESTRICTED.includes(draft.role);
  const blocked = BLOCKED[draft.role] || [];
  const effective = draft.custom ? draft.access : defaultPermissions({ role: draft.role, can_edit_catalog: draft.flags.canEditCatalog });
  const toggle = (key, on) => setDraft({ ...draft, custom: true, access: on ? [...new Set([...effective, key])] : effective.filter((k) => k !== key) });

  return (
    <div className="space-y-4">
      <div>
        <p className={labelCls}>What this account can open and do</p>
        <label className="mb-1 flex items-center gap-2 text-sm text-slate-800">
          <input type="radio" checked={!draft.custom} onChange={() => setDraft({ ...draft, custom: false })} />
          Follow the role
        </label>
        <label className="mb-2 flex items-center gap-2 text-sm text-slate-800">
          <input type="radio" checked={draft.custom} onChange={() => setDraft({ ...draft, custom: true, access: effective.filter((k) => !blocked.includes(k)) })} />
          Choose exactly what this account can do
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {PRESETS.map((pr) => (
            <button
              key={pr.label}
              type="button"
              onClick={() => setDraft({ ...draft, custom: true, access: pr.keys })}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {pr.label}
            </button>
          ))}
        </div>
        <div className="grid gap-1 sm:grid-cols-2">
          {PERMISSIONS.map(({ key, label }) => {
            const off = blocked.includes(key);
            return (
              <label key={key} className={`flex items-center gap-2 text-sm ${off ? "text-slate-400" : "text-slate-800"}`}>
                <input
                  type="checkbox"
                  disabled={off || !draft.custom}
                  checked={!off && effective.includes(key)}
                  onChange={(e) => toggle(key, e.target.checked)}
                />
                {label}
              </label>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {draft.custom ? "Anything left unticked is closed to this account." : "Greyed ticks show what the role gives today. Choose “exactly” to change them."}
          {" "}An account with nothing ticked cannot open anything.
        </p>
      </div>

      <div>
        <p className={labelCls}>Cost simulator permissions</p>
        {restricted && <p className="mb-2 text-sm text-amber-800">This role is restricted: these are always off.</p>}
        <div className="grid gap-1 sm:grid-cols-2">
          {FLAGS.map(([, key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-800">
              <input
                type="checkbox"
                disabled={restricted}
                checked={restricted ? false : !!draft.flags[key]}
                onChange={(e) => setDraft({ ...draft, flags: { ...draft.flags, [key]: e.target.checked } })}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const [auth, setAuth] = useState({ state: "loading", profile: null });
  const [people, setPeople] = useState([]);
  const [editing, setEditing] = useState(null); // id
  const [draft, setDraft] = useState(null);
  const [adding, setAdding] = useState(false);
  const [fresh, setFresh] = useState(emptyNew());
  const [pwFor, setPwFor] = useState(null);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
    if (r.error) setError(`Could not load accounts: ${r.error.message}`);
    else setPeople(r.data || []);
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return setAuth({ state: "noconfig", profile: null });
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return setAuth({ state: "loggedout", profile: null });
      const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (!p || p.status !== "Approved") return setAuth({ state: "loggedout", profile: null });
      if (p.role !== "GOD") return setAuth({ state: "denied", profile: p });
      setAuth({ state: "ok", profile: p });
      load();
    })();
  }, [load]);

  const call = async (method, body) => {
    const { data } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/users", {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${data?.session?.access_token}` },
      body: JSON.stringify(body),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || "Request failed.");
    return payload;
  };

  const run = async (fn, okText) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      setNotice(okText);
      await load();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const accessToSend = (d) => (d.custom ? d.access : null);

  const save = (p) =>
    run(async () => {
      await call("PATCH", {
        id: p.id,
        rules: { name: draft.name, role: draft.role, minMargin: Number(draft.minMargin), ...draft.flags, sectionAccess: accessToSend(draft) },
      });
      setEditing(null);
    }, `Saved ${draft.name}.`);

  const create = async (e) => {
    e.preventDefault();
    const ok = await run(async () => {
      await call("POST", {
        username: fresh.username,
        name: fresh.name,
        password: fresh.password,
        role: fresh.role,
        minMargin: Number(fresh.minMargin),
        canSeeVendorCosts: fresh.flags.canSeeVendorCosts,
        canEditCatalog: fresh.flags.canEditCatalog,
        canOverrideCosts: fresh.flags.canOverrideCosts,
        canEditPresets: fresh.flags.canEditPresets,
        canSeeAllDashboardQuotes: fresh.flags.canSeeAllDashboardQuotes,
        canAccessDashboard: fresh.flags.canAccessDashboard,
        sectionAccess: accessToSend(fresh),
      });
    }, `Account ${fresh.username} created. Give them the username and the password you typed.`);
    if (ok) { setAdding(false); setFresh(emptyNew()); }
  };

  const resetPassword = (p) =>
    run(async () => {
      await call("PATCH", { id: p.id, password: pw });
      setPwFor(null);
      setPw("");
    }, `Password for ${p.name} changed.`);

  const remove = (p) => {
    if (!window.confirm(`Delete the account of ${p.name} (@${p.username})? This cannot be undone.`)) return;
    run(async () => { await call("DELETE", { id: p.id }); }, `Deleted ${p.name}.`);
  };

  if (auth.state === "loading") return <Shell><p className="p-6 text-slate-500">Loading…</p></Shell>;
  if (auth.state === "noconfig") return <Shell><p className="p-6 text-red-700">Supabase is not configured.</p></Shell>;
  if (auth.state === "loggedout")
    return (
      <Shell>
        <div className="p-6">
          <p className="mb-3 text-slate-700">Please log in first.</p>
          <Link href="/" className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white">Go to login</Link>
        </div>
      </Shell>
    );
  if (auth.state === "denied")
    return (
      <Shell>
        <div className="p-6">
          <p className="mb-3 text-slate-700">Only the master admin can manage accounts and permissions.</p>
          <Link href="/portal" className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white">Back to home</Link>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Accounts &amp; permissions</h1>
          <p className="text-xs text-slate-500">Alam Bali Santhi · {auth.profile.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ThemeToggle />
          <button onClick={() => { setAdding(true); setEditing(null); setNotice(""); setError(""); }} className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white">+ Add account</button>
          <AppMenu profile={auth.profile} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl p-4">
        {error && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {notice && <div className="mb-3 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{notice}</div>}
        <p className="mb-4 text-sm text-slate-600">
          Add people, then press Edit on an account to change its role and exactly what it can open or do. Changes apply the next time that person opens a page.
        </p>

        {adding && (
          <form onSubmit={create} className="mb-4 space-y-4 rounded-xl border-2 border-teal-600 bg-white p-4">
            <p className="font-bold text-slate-900">New account</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><span className={labelCls}>Full name</span>
                <input className={inputCls} required value={fresh.name} onChange={(e) => setFresh({ ...fresh, name: e.target.value })} /></label>
              <label className="block"><span className={labelCls}>Username (used to log in)</span>
                <input className={inputCls} required value={fresh.username} autoCapitalize="none" onChange={(e) => setFresh({ ...fresh, username: e.target.value })} /></label>
              <label className="block"><span className={labelCls}>Password (at least 8 characters)</span>
                <input className={inputCls} required minLength={8} type="password" autoComplete="new-password" value={fresh.password} onChange={(e) => setFresh({ ...fresh, password: e.target.value })} /></label>
              <label className="block"><span className={labelCls}>Role</span>
                <select className={inputCls} value={fresh.role} onChange={(e) => setFresh({ ...fresh, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select></label>
            </div>
            <PermissionEditor draft={fresh} setDraft={setFresh} />
            <div className="flex gap-2">
              <button disabled={busy} className="rounded-lg bg-teal-700 px-5 py-2 font-semibold text-white disabled:opacity-60">{busy ? "Creating…" : "Create account"}</button>
              <button type="button" disabled={busy} onClick={() => setAdding(false)} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {people.map((p) => {
            const opens = sectionsFor(p).map((s) => s.title);
            const isEditing = editing === p.id && draft;
            return (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">
                      {p.name} <span className="font-normal text-slate-500">@{p.username}</span>
                    </p>
                    <p className="text-sm text-slate-600">{p.role}{p.status !== "Approved" ? ` · ${p.status}` : ""}</p>
                  </div>
                  {p.role === "GOD" ? (
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">Master admin: full access, cannot be edited</span>
                  ) : (
                    editing !== p.id && (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => { setEditing(p.id); setDraft(draftFrom(p)); setAdding(false); setNotice(""); setError(""); }} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">Edit</button>
                        <button onClick={() => { setPwFor(pwFor === p.id ? null : p.id); setPw(""); }} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">Reset password</button>
                        <button onClick={() => remove(p)} className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-700">Delete</button>
                      </div>
                    )
                  )}
                </div>

                {pwFor === p.id && (
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <label className="block"><span className={labelCls}>New password (at least 8 characters)</span>
                      <input className={inputCls} type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
                    <button disabled={busy || pw.length < 8} onClick={() => resetPassword(p)} className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-60">Set password</button>
                  </div>
                )}

                {!isEditing && (
                  <p className="mt-2 flex flex-wrap gap-1 text-xs">
                    {opens.length === 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-800">nothing open</span>}
                    {opens.map((t) => <span key={t} className="rounded-full bg-teal-100 px-2 py-0.5 font-semibold text-teal-800">{t}</span>)}
                    {Array.isArray(p.section_access) && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">custom</span>}
                    {Array.isArray(p.section_access) && !p.section_access.includes("booking_add") && p.section_access.includes("bookings") && <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">cannot add bookings</span>}
                    {Array.isArray(p.section_access) && !p.section_access.includes("booking_edit") && p.section_access.includes("bookings") && <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">cannot edit bookings</span>}
                  </p>
                )}

                {isEditing && (
                  <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="block"><span className={labelCls}>Full name</span>
                        <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
                      <label className="block"><span className={labelCls}>Role</span>
                        <select className={inputCls} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                          {ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select></label>
                      <label className="block"><span className={labelCls}>Min profit margin %</span>
                        <input className={inputCls} inputMode="decimal" value={draft.minMargin} onChange={(e) => setDraft({ ...draft, minMargin: e.target.value })} /></label>
                    </div>
                    <PermissionEditor draft={draft} setDraft={setDraft} />
                    <div className="flex gap-2">
                      <button disabled={busy} onClick={() => save(p)} className="rounded-lg bg-teal-700 px-5 py-2 font-semibold text-white disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
                      <button disabled={busy} onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {people.length === 0 && !error && <p className="text-slate-500">Loading accounts…</p>}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
}
