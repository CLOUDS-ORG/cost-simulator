"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { ACCESS_KEYS, sectionsFor } from "../bookings/sections";
import ThemeToggle from "../bookings/ThemeToggle";
import AppMenu from "../bookings/AppMenu";

// Accounts & permissions: the master admin sees every account and changes role and permissions in one place.
// Creating, deleting and password resets stay in the Cost simulator (Accounts page there).

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

const FLAGS = [
  ["can_see_vendor_costs", "canSeeVendorCosts", "See vendor costs in the Cost simulator"],
  ["can_edit_catalog", "canEditCatalog", "Edit the catalog (also opens Vendor lists)"],
  ["can_override_costs", "canOverrideCosts", "Override costs in a quote"],
  ["can_edit_presets", "canEditPresets", "Edit presets"],
  ["can_see_all_dashboard_quotes", "canSeeAllDashboardQuotes", "See everyone's quotes"],
  ["can_access_dashboard", "canAccessDashboard", "Open the Cost simulator dashboard"],
];

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

function draftFrom(p) {
  return {
    name: p.name,
    role: p.role,
    minMargin: Number(p.min_margin),
    flags: Object.fromEntries(FLAGS.map(([col, key]) => [key, !!p[col]])),
    customAccess: Array.isArray(p.section_access),
    access: Array.isArray(p.section_access) ? p.section_access : [],
  };
}

export default function AccountsPage() {
  const [auth, setAuth] = useState({ state: "loading", profile: null });
  const [people, setPeople] = useState([]);
  const [editing, setEditing] = useState(null); // id
  const [draft, setDraft] = useState(null);
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

  const startEdit = (p) => { setEditing(p.id); setDraft(draftFrom(p)); setNotice(""); setError(""); };

  const save = async (p) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await supabase.auth.getSession();
      const restricted = RESTRICTED.includes(draft.role);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data?.session?.access_token}` },
        body: JSON.stringify({
          id: p.id,
          rules: {
            name: draft.name,
            role: draft.role,
            minMargin: Number(draft.minMargin),
            ...draft.flags,
            sectionAccess: restricted ? null : draft.customAccess ? draft.access : null,
          },
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Request failed.");
      setNotice(`Saved ${draft.name}.`);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
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
          <AppMenu profile={auth.profile} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl p-4">
        {error && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {notice && <div className="mb-3 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{notice}</div>}
        <p className="mb-4 text-sm text-slate-600">
          Pick an account and press Edit to change its role and what it may open. Changes apply the next time that person opens a page.
          To create an account, delete one or reset a password, use Accounts in the Cost simulator.
        </p>

        <div className="space-y-3">
          {people.map((p) => {
            const opens = sectionsFor(p).map((s) => s.title);
            if (p.role === "GOD") opens.push("Accounts & permissions");
            const isEditing = editing === p.id && draft;
            const restricted = isEditing && RESTRICTED.includes(draft.role);
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
                      <button onClick={() => startEdit(p)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">Edit</button>
                    )
                  )}
                </div>
                {!isEditing && (
                  <p className="mt-2 flex flex-wrap gap-1 text-xs">
                    {opens.map((t) => <span key={t} className="rounded-full bg-teal-100 px-2 py-0.5 font-semibold text-teal-800">{t}</span>)}
                    {Array.isArray(p.section_access) && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">custom access</span>}
                  </p>
                )}

                {isEditing && (
                  <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="block sm:col-span-1">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Full name</span>
                        <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Role</span>
                        <select className={inputCls} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                          {ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Min profit margin %</span>
                        <input className={inputCls} inputMode="decimal" value={draft.minMargin} onChange={(e) => setDraft({ ...draft, minMargin: e.target.value })} />
                      </label>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Cost simulator permissions</p>
                      {restricted && <p className="mb-2 text-sm text-amber-800">This role is restricted: these permissions are always off, and Accounting and Dashboard stay closed.</p>}
                      <div className="grid gap-2 sm:grid-cols-2">
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

                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Bookings app pages</p>
                      <label className="mb-1 flex items-center gap-2 text-sm text-slate-800">
                        <input type="radio" disabled={restricted} checked={restricted || !draft.customAccess} onChange={() => setDraft({ ...draft, customAccess: false })} />
                        Follow the role (Operations &amp; Finance and Admin Manager open Accounting and Dashboard)
                      </label>
                      <label className="mb-1 flex items-center gap-2 text-sm text-slate-800">
                        <input type="radio" disabled={restricted} checked={!restricted && draft.customAccess} onChange={() => setDraft({ ...draft, customAccess: true })} />
                        Choose pages for this account
                      </label>
                      {!restricted && draft.customAccess && (
                        <div className="ml-6 space-y-1">
                          {ACCESS_KEYS.map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 text-sm text-slate-800">
                              <input
                                type="checkbox"
                                checked={draft.access.includes(key)}
                                onChange={(e) =>
                                  setDraft({ ...draft, access: e.target.checked ? [...draft.access, key] : draft.access.filter((k) => k !== key) })
                                }
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-slate-500">Bookings, Quotes and the Cost simulator are open to everyone except Booking Staff (Bookings only).</p>
                    </div>

                    <div className="flex gap-2">
                      <button disabled={busy} onClick={() => save(p)} className="rounded-lg bg-teal-700 px-5 py-2 font-semibold text-white disabled:opacity-60">
                        {busy ? "Saving…" : "Save"}
                      </button>
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
