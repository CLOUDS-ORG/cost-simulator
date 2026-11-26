"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "../../lib/supabase";
import { FORM_OPTIONS, baliDate } from "../lib";
import ThemeToggle from "../ThemeToggle";
import AppMenu from "../AppMenu";
import { canOpen } from "../sections";
import { idr } from "../costing";

// Contract rates (CR) master data: the nett rate per pax of every agent contract.
// The sale price of a booking without an entered price is the rate of the row that fits its agent, package,
// tour date and pax, multiplied by the pax. Car rule: 1 car = 3 guests + guide, so 1-3 pax use the 2-pax rate,
// 4-6 pax the 4-pax rate and 7 or more the 6-pax rate (change the ranges here if a contract says otherwise).

const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900";
const EMPTY = { agent: "", package: "", pax_min: "1", pax_max: "3", rate_per_pax: "", valid_from: "2026-01-01", valid_to: "", source: "", note: "" };

export default function RatesPage() {
  const [auth, setAuth] = useState({ state: "loading", profile: null });
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [fAgent, setFAgent] = useState("");
  const [fPackage, setFPackage] = useState("");
  const [fDate, setFDate] = useState("");
  const [draft, setDraft] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await supabase.from("contract_rates").select("*").order("agent").order("package").order("valid_from").order("pax_min");
    if (r.error) setError(`Could not load the rates: ${r.error.message}. Has supabase/booking-rates.sql been run?`);
    else { setError(""); setRows(r.data || []); }
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return setAuth({ state: "noconfig", profile: null });
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return setAuth({ state: "loggedout", profile: null });
      const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (!p || p.status !== "Approved") return setAuth({ state: "loggedout", profile: null });
      if (!canOpen(p, "accounting")) return setAuth({ state: "denied", profile: p });
      setAuth({ state: "ok", profile: p });
      load();
    })();
  }, [load]);

  const agents = useMemo(() => [...new Set([...FORM_OPTIONS.agents, ...rows.map((r) => r.agent)])].sort((a, b) => a.localeCompare(b)), [rows]);
  const packages = FORM_OPTIONS.tourPackages;

  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!fAgent || r.agent === fAgent) &&
          (!fPackage || r.package === fPackage) &&
          (!fDate || (r.valid_from <= fDate && (!r.valid_to || fDate <= r.valid_to))),
      ),
    [rows, fAgent, fPackage, fDate],
  );

  // Rows of the same agent and package whose dates and pax ranges overlap: two rates would fit one booking.
  const overlaps = useMemo(() => {
    const bad = new Set();
    const lastDay = "9999-12-31";
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const a = rows[i], b = rows[j];
        if (a.agent !== b.agent || a.package !== b.package) continue;
        const dates = a.valid_from <= (b.valid_to || lastDay) && b.valid_from <= (a.valid_to || lastDay);
        const pax = a.pax_min <= b.pax_max && b.pax_min <= a.pax_max;
        if (dates && pax) { bad.add(a.id); bad.add(b.id); }
      }
    }
    return bad;
  }, [rows]);

  const run = async (promise) => {
    setBusy(true);
    const res = await promise;
    setBusy(false);
    if (res.error) { setError(res.error.message); return false; }
    await load();
    return true;
  };

  const patch = (r, field, value) => {
    const v = field === "pax_min" || field === "pax_max" ? parseInt(value, 10)
      : field === "rate_per_pax" ? Number(String(value).replace(/[^\d.]/g, ""))
      : field === "valid_to" ? (value || null)
      : value;
    if ((field === "pax_min" || field === "pax_max") && !(v >= 1)) return setError("Pax must be 1 or more.");
    if (field === "rate_per_pax" && !(v >= 0)) return setError("Enter the rate per pax in Rp.");
    if (field === "valid_from" && !value) return setError("Valid from needs a date.");
    if (v === r[field] || (v === null && r[field] === null)) return;
    return run(supabase.from("contract_rates").update({ [field]: v, updated_at: new Date().toISOString() }).eq("id", r.id));
  };

  const add = async () => {
    const d = draft;
    if (!d.agent.trim() || !d.package.trim()) return setError("Choose the agent and the package.");
    const rate = Number(String(d.rate_per_pax).replace(/[^\d.]/g, ""));
    if (!(rate > 0)) return setError("Enter the rate per pax in Rp.");
    const lo = parseInt(d.pax_min, 10), hi = parseInt(d.pax_max, 10);
    if (!(lo >= 1) || !(hi >= lo)) return setError("Pax range is not valid (from 1, and the last pax is not below the first).");
    if (!d.valid_from) return setError("Valid from needs a date.");
    const ok = await run(
      supabase.from("contract_rates").insert({
        agent: d.agent.trim(), package: d.package.trim(), pax_min: lo, pax_max: hi, rate_per_pax: rate,
        valid_from: d.valid_from, valid_to: d.valid_to || null, source: d.source.trim(), note: d.note.trim(),
      }),
    );
    if (ok) { setDraft({ ...EMPTY, agent: d.agent, package: d.package, valid_from: d.valid_from, valid_to: d.valid_to, source: d.source }); setAdding(false); }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete this rate?\n${r.agent} · ${r.package} · ${r.pax_min}-${r.pax_max} pax · ${idr(r.rate_per_pax)}`)) return;
    await run(supabase.from("contract_rates").delete().eq("id", r.id));
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
          <p className="mb-3 text-slate-700">You do not have access to the contract rates. Ask the master admin to switch Accounting on for your account.</p>
          <Link href="/portal" className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white">Back to home</Link>
        </div>
      </Shell>
    );

  const cellInput = `${inputCls} py-1`;

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Contract rates (CR)</h1>
          <p className="text-xs text-slate-500">Alam Bali Santhi · {auth.profile.name} · {rows.length} rates</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ThemeToggle />
          <AppMenu profile={auth.profile} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] space-y-4 p-4">
        {error && (
          <div className="flex items-start justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="font-semibold">Close</button>
          </div>
        )}

        <p className="text-sm text-slate-600">
          Nett rate per pax of each agent contract. A booking without an entered price gets the rate that fits its agent, package, tour date and pax, times the pax.
          Car rule: 1 car = 3 guests + guide, so 1-3 pax use the 2-pax rate, 4-6 pax the 4-pax rate, 7 or more the 6-pax rate. Changes save when you leave a field.
          To change a price from a date, set "Valid to" on the old row and add a new row that starts the day after.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Agent
            <select className={`${inputCls} mt-1 w-56 normal-case`} value={fAgent} onChange={(e) => setFAgent(e.target.value)}>
              <option value="">All agents</option>
              {agents.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Package
            <select className={`${inputCls} mt-1 w-56 normal-case`} value={fPackage} onChange={(e) => setFPackage(e.target.value)}>
              <option value="">All packages</option>
              {packages.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Valid on
            <input type="date" className={`${inputCls} mt-1 w-40`} value={fDate} onChange={(e) => setFDate(e.target.value)} />
          </label>
          {(fAgent || fPackage || fDate) && (
            <button type="button" onClick={() => { setFAgent(""); setFPackage(""); setFDate(""); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Clear filters</button>
          )}
          <button
            type="button"
            onClick={() => { setAdding((a) => !a); setDraft((d) => ({ ...d, agent: d.agent || fAgent, package: d.package || fPackage })); }}
            className="ml-auto rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
          >
            {adding ? "Close" : "+ Add rate"}
          </button>
        </div>

        {adding && (
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold text-slate-500">Agent
              <input list="rate-agents" className={`${inputCls} mt-1`} value={draft.agent} onChange={(e) => setDraft({ ...draft, agent: e.target.value })} />
              <datalist id="rate-agents">{agents.map((a) => <option key={a} value={a} />)}</datalist>
            </label>
            <label className="text-xs font-semibold text-slate-500">Package
              <input list="rate-packages" className={`${inputCls} mt-1`} value={draft.package} onChange={(e) => setDraft({ ...draft, package: e.target.value })} />
              <datalist id="rate-packages">{packages.map((p) => <option key={p} value={p} />)}</datalist>
            </label>
            <label className="text-xs font-semibold text-slate-500">Rate per pax (Rp)
              <input inputMode="numeric" className={`${inputCls} mt-1`} value={draft.rate_per_pax} onChange={(e) => setDraft({ ...draft, rate_per_pax: e.target.value })} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-semibold text-slate-500">From pax
                <input inputMode="numeric" className={`${inputCls} mt-1`} value={draft.pax_min} onChange={(e) => setDraft({ ...draft, pax_min: e.target.value })} />
              </label>
              <label className="text-xs font-semibold text-slate-500">To pax
                <input inputMode="numeric" className={`${inputCls} mt-1`} value={draft.pax_max} onChange={(e) => setDraft({ ...draft, pax_max: e.target.value })} />
              </label>
            </div>
            <label className="text-xs font-semibold text-slate-500">Valid from
              <input type="date" className={`${inputCls} mt-1`} value={draft.valid_from} onChange={(e) => setDraft({ ...draft, valid_from: e.target.value })} />
            </label>
            <label className="text-xs font-semibold text-slate-500">Valid to (empty = no end date)
              <input type="date" className={`${inputCls} mt-1`} value={draft.valid_to} onChange={(e) => setDraft({ ...draft, valid_to: e.target.value })} />
            </label>
            <label className="text-xs font-semibold text-slate-500 sm:col-span-2">Source (contract number, addendum)
              <input className={`${inputCls} mt-1`} value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} />
            </label>
            <div className="sm:col-span-2 lg:col-span-4">
              <button type="button" disabled={busy} onClick={add} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save rate</button>
              <span className="ml-3 text-xs text-slate-500">The agent and package stay filled so the next pax tier is quick to add.</span>
            </div>
          </div>
        )}

        {overlaps.size > 0 && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {overlaps.size} rates overlap (same agent and package, same dates and pax). They are marked in red: only the first one found is used for a booking.
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[1000px] text-left text-sm text-slate-800">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Agent</th>
                <th className="px-2 py-2">Package</th>
                <th className="px-2 py-2 text-right">From pax</th>
                <th className="px-2 py-2 text-right">To pax</th>
                <th className="px-2 py-2 text-right">Rate per pax (Rp)</th>
                <th className="px-2 py-2">Valid from</th>
                <th className="px-2 py-2">Valid to</th>
                <th className="px-2 py-2">Source</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-slate-500">{rows.length === 0 ? "No rates yet. Run supabase/booking-rates.sql or add one." : "No rate matches the filters."}</td></tr>
              )}
              {shown.map((r) => (
                <tr key={r.id} className={`border-t border-slate-100 ${overlaps.has(r.id) ? "bg-red-50" : ""}`}>
                  <td className="px-2 py-1">
                    <select className={cellInput} value={r.agent} onChange={(e) => patch(r, "agent", e.target.value)}>
                      {agents.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1">
                    <select className={cellInput} value={r.package} onChange={(e) => patch(r, "package", e.target.value)}>
                      {[...new Set([...packages, r.package])].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="w-20 px-2 py-1"><input key={`${r.id}-${r.pax_min}`} inputMode="numeric" className={`${cellInput} text-right`} defaultValue={r.pax_min} onBlur={(e) => e.target.value !== String(r.pax_min) && patch(r, "pax_min", e.target.value)} /></td>
                  <td className="w-20 px-2 py-1"><input key={`${r.id}-${r.pax_max}`} inputMode="numeric" className={`${cellInput} text-right`} defaultValue={r.pax_max} onBlur={(e) => e.target.value !== String(r.pax_max) && patch(r, "pax_max", e.target.value)} /></td>
                  <td className="w-36 px-2 py-1"><input key={`${r.id}-${r.rate_per_pax}`} inputMode="numeric" className={`${cellInput} text-right font-semibold`} defaultValue={Math.round(Number(r.rate_per_pax))} onBlur={(e) => patch(r, "rate_per_pax", e.target.value)} /></td>
                  <td className="w-36 px-2 py-1"><input key={`${r.id}-${r.valid_from}`} type="date" className={cellInput} defaultValue={r.valid_from} onBlur={(e) => e.target.value !== r.valid_from && patch(r, "valid_from", e.target.value)} /></td>
                  <td className="w-36 px-2 py-1"><input key={`${r.id}-${r.valid_to}`} type="date" className={cellInput} defaultValue={r.valid_to || ""} onBlur={(e) => e.target.value !== (r.valid_to || "") && patch(r, "valid_to", e.target.value)} /></td>
                  <td className="px-2 py-1"><input key={`${r.id}-${r.source}`} className={cellInput} defaultValue={r.source} title={r.source} onBlur={(e) => e.target.value !== r.source && patch(r, "source", e.target.value)} /></td>
                  <td className="px-2 py-1 text-right">
                    <button type="button" onClick={() => remove(r)} className="text-xs font-semibold text-red-700 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">Today in Bali: {baliDate(0)}. {shown.length} of {rows.length} rates shown.</p>
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
}
