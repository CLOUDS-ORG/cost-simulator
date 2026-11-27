"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Folder, FolderOpen, Upload, FileText, Download, ArrowLeft, AlertTriangle } from "lucide-react";
import { supabase, supabaseConfigured } from "../../lib/supabase";
import { FORM_OPTIONS, baliDate } from "../lib";
import ThemeToggle from "../ThemeToggle";
import AppMenu from "../AppMenu";
import { canOpen } from "../sections";
import { idr } from "../costing";
import { parseCsv, readRateRows, templateCsv, folderKey } from "./importer";
import { WARN_MONTHS, expiryGroups, expiryByAgent, rowExpiry, describeDays } from "./expiry";

// Contract rates (CR) master data: the nett rate per pax of every agent contract, one folder per agent.
// The sale price of a booking without an entered price is the rate of the row that fits its agent, package,
// tour date and pax, multiplied by the pax. Car rule: 1 car = 3 guests + guide, so 1-3 pax use the 2-pax rate,
// 4-6 pax the 4-pax rate and 7 or more the 6-pax rate (change the ranges here if a contract says otherwise).
// An agent folder also takes a rate file (CSV or Excel, same columns as the template): it is read, shown for a check,
// and imported into the rates; the file itself is kept in the folder.

const BUCKET = "contract-files";
const ALL = "__all";
const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900";
const btnLight = "rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700";
const btnMain = "rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
const EMPTY = { agent: "", package: "", pax_min: "1", pax_max: "3", rate_per_pax: "", valid_from: "2026-01-01", valid_to: "", source: "", note: "" };

function download(name, text, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function RatesPage() {
  const [auth, setAuth] = useState({ state: "loading", profile: null });
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [view, setViewState] = useState(""); // "" = folders, ALL = every rate, otherwise an agent
  const [fPackage, setFPackage] = useState("");
  const [fAgent, setFAgent] = useState("");
  const [fDate, setFDate] = useState("");
  const [draft, setDraft] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  const setView = (v) => {
    setViewState(v);
    setFPackage(""); setFAgent(""); setFDate(""); setAdding(false); setError(""); setNotice("");
    const url = v ? `${window.location.pathname}?agent=${encodeURIComponent(v)}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  };

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
      const want = new URLSearchParams(window.location.search).get("agent");
      if (want) setViewState(want);
      load();
    })();
  }, [load]);

  const agents = useMemo(() => [...new Set([...FORM_OPTIONS.agents, ...rows.map((r) => r.agent)])].sort((a, b) => a.localeCompare(b)), [rows]);
  const packages = FORM_OPTIONS.tourPackages;

  // Rates that end within WARN_MONTHS months (or already ended with nothing newer): red mark on the folder and the row.
  const today = baliDate();
  const expiry = useMemo(() => expiryByAgent(rows, today), [rows, today]);
  const expiryList = useMemo(() => expiryGroups(rows, today), [rows, today]);

  const folders = useMemo(
    () =>
      agents.map((a) => {
        const mine = rows.filter((r) => r.agent === a);
        const from = mine.reduce((m, r) => (!m || r.valid_from > m ? r.valid_from : m), "");
        return { agent: a, count: mine.length, latest: from, alert: expiry[a] || null };
      }),
    [agents, rows, expiry],
  );

  const scoped = useMemo(() => (view && view !== ALL ? rows.filter((r) => r.agent === view) : rows), [rows, view]);
  const shown = useMemo(
    () =>
      scoped.filter(
        (r) =>
          (!fAgent || r.agent === fAgent) &&
          (!fPackage || r.package === fPackage) &&
          (!fDate || (r.valid_from <= fDate && (!r.valid_to || fDate <= r.valid_to))),
      ),
    [scoped, fAgent, fPackage, fDate],
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
    const d = { ...draft, agent: view && view !== ALL ? view : draft.agent };
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

  const agentView = view && view !== ALL;

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Contract rates (CR){agentView ? ` · ${view}` : view === ALL ? " · all rates" : ""}</h1>
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
        {notice && (
          <div className="flex items-start justify-between gap-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} className="font-semibold">Close</button>
          </div>
        )}

        {!view && expiryList.length > 0 && (
          <ExpiryBanner list={expiryList} open={setView} />
        )}

        {!view && (
          <>
            <p className="text-sm text-slate-600">
              One folder per agent. Open a folder to see and edit its rates, or upload a rate file (the template, CSV or Excel) and the app reads it into the rates.
              A booking without an entered price gets the rate that fits its agent, package, tour date and pax, times the pax.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setView(ALL)} className={btnLight}>All rates in one table</button>
              <button type="button" onClick={() => download("contract-rates-template.csv", templateCsv(""))} className={btnLight}>
                <Download size={14} className="mr-1 inline" />Download the template
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {folders.map((f) => (
                <button
                  key={f.agent}
                  type="button"
                  onClick={() => setView(f.agent)}
                  className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-sm hover:border-teal-600 ${f.alert ? "border-red-400 ring-1 ring-red-300" : f.count ? "border-slate-200" : "border-dashed border-slate-300"}`}
                >
                  <Folder size={28} className={f.alert ? "shrink-0 text-red-600" : f.count ? "shrink-0 text-teal-700" : "shrink-0 text-slate-400"} />
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-slate-900">{f.agent}</span>
                    <span className="block text-xs text-slate-500">{f.count ? `${f.count} rates · latest from ${f.latest}` : "No rates yet"}</span>
                    {f.alert && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
                        <AlertTriangle size={11} />
                        {f.alert.state === "expired"
                          ? `Expired ${f.alert.expired} package${f.alert.expired === 1 ? "" : "s"}`
                          : `Expires ${describeDays(f.alert.days).replace("ends ", "")}`}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {view && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setView("")} className={btnLight}><ArrowLeft size={14} className="mr-1 inline" />All agents</button>
              {agentView && (
                <button type="button" onClick={() => download(`rates-${folderKey(view)}.csv`, templateCsv(view, scoped))} className={btnLight}>
                  <Download size={14} className="mr-1 inline" />Download these rates (edit and upload again)
                </button>
              )}
              <button type="button" onClick={() => download("contract-rates-template.csv", templateCsv(agentView ? view : ""))} className={btnLight}>
                <Download size={14} className="mr-1 inline" />Empty template
              </button>
            </div>

            {view && (() => {
              const mine = agentView ? expiryList.filter((g) => g.agent === view) : expiryList;
              return mine.length > 0 ? <ExpiryBanner list={mine} open={agentView ? null : setView} /> : null;
            })()}

            {agentView && (
              <UploadPanel
                agent={view}
                packages={packages}
                existing={scoped}
                onDone={async (msg) => { setNotice(msg); await load(); }}
                onError={setError}
              />
            )}
            {agentView && <FilesPanel agent={view} onError={setError} refreshKey={notice} />}

            <div className="flex flex-wrap items-end gap-3">
              {!agentView && (
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Agent
                  <select className={`${inputCls} mt-1 w-56 normal-case`} value={fAgent} onChange={(e) => setFAgent(e.target.value)}>
                    <option value="">All agents</option>
                    {agents.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </label>
              )}
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
                <button type="button" onClick={() => { setFAgent(""); setFPackage(""); setFDate(""); }} className={btnLight}>Clear filters</button>
              )}
              <button
                type="button"
                onClick={() => { setAdding((a) => !a); setDraft((d) => ({ ...d, agent: d.agent || fAgent, package: d.package || fPackage })); }}
                className={`ml-auto ${btnMain}`}
              >
                {adding ? "Close" : "+ Add rate"}
              </button>
            </div>

            {adding && (
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
                {!agentView && (
                  <label className="text-xs font-semibold text-slate-500">Agent
                    <input list="rate-agents" className={`${inputCls} mt-1`} value={draft.agent} onChange={(e) => setDraft({ ...draft, agent: e.target.value })} />
                    <datalist id="rate-agents">{agents.map((a) => <option key={a} value={a} />)}</datalist>
                  </label>
                )}
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
                  <button type="button" disabled={busy} onClick={add} className={btnMain}>Save rate</button>
                  <span className="ml-3 text-xs text-slate-500">The package and dates stay filled so the next pax tier is quick to add.</span>
                </div>
              </div>
            )}

            {overlaps.size > 0 && shown.some((r) => overlaps.has(r.id)) && (
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                Some rates overlap (same agent and package, same dates and pax). They are marked in red: only the first one found is used for a booking.
                To change a price from a date, set "Valid to" on the old row and add a new row that starts the day after.
              </div>
            )}

            <RateTable expiryList={expiryList} rows={shown} total={scoped.length} agents={agents} packages={packages} overlaps={overlaps} patch={patch} remove={remove} />
            <p className="text-xs text-slate-500">Today in Bali: {baliDate(0)}. {shown.length} of {scoped.length} rates shown. Changes save when you leave a field.</p>
          </>
        )}
      </div>
    </Shell>
  );
}

// Red notice listing the rate groups (agent + package) that ended or end within WARN_MONTHS months.
function ExpiryBanner({ list, open }) {
  const expired = list.filter((g) => g.state === "expired").length;
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
      <p className="flex items-center gap-2 font-bold">
        <AlertTriangle size={16} className="shrink-0" />
        {expired ? `${expired} contract rate${expired === 1 ? " has" : "s have"} expired. ` : ""}
        {list.length - expired ? `${list.length - expired} more end${list.length - expired === 1 ? "s" : ""} within ${WARN_MONTHS} months. ` : ""}
        Ask the agent for the new contract and upload it.
      </p>
      <ul className="mt-2 space-y-0.5 text-xs">
        {list.map((g) => (
          <li key={`${g.agent}-${g.package}`}>
            {open ? (
              <button type="button" onClick={() => open(g.agent)} className="font-semibold underline">{g.agent}</button>
            ) : (
              <span className="font-semibold">{g.agent}</span>
            )}
            {" · "}{g.package}{" · valid to "}{g.end}{" ("}{describeDays(g.days)}{")"}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RateTable({ rows, total, agents, packages, overlaps, patch, remove, expiryList }) {
  const cellInput = `${inputCls} py-1`;
  return (
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
          {rows.length === 0 && (
            <tr><td colSpan={9} className="px-3 py-6 text-center text-slate-500">{total === 0 ? "No rates yet. Upload a rate file or add one." : "No rate matches the filters."}</td></tr>
          )}
          {rows.map((r) => (
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
              <td className="w-36 px-2 py-1">
                <input key={`${r.id}-${r.valid_to}`} type="date" className={`${cellInput} ${rowExpiry(r, expiryList) ? "border-red-500 font-semibold text-red-700" : ""}`} defaultValue={r.valid_to || ""} onBlur={(e) => e.target.value !== (r.valid_to || "") && patch(r, "valid_to", e.target.value)} />
                {rowExpiry(r, expiryList) && (
                  <span className="mt-0.5 block text-[11px] font-bold text-red-700">{rowExpiry(r, expiryList) === "expired" ? "Expired" : "Expires soon"}</span>
                )}
              </td>
              <td className="px-2 py-1"><input key={`${r.id}-${r.source}`} className={cellInput} defaultValue={r.source} title={r.source} onBlur={(e) => e.target.value !== r.source && patch(r, "source", e.target.value)} /></td>
              <td className="px-2 py-1 text-right">
                <button type="button" onClick={() => remove(r)} className="text-xs font-semibold text-red-700 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Upload a rate file into an agent folder: read it, show what will change, import on a click, keep the file in the folder.
function UploadPanel({ agent, packages, existing, onDone, onError }) {
  const [preview, setPreview] = useState(null); // { file, rows, fatal }
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  const reading = async (file) => {
    setPreview(null);
    onError("");
    try {
      const name = file.name.toLowerCase();
      let matrix;
      if (name.endsWith(".xlsx")) {
        const { readSheet } = await import("read-excel-file/browser");
        matrix = await readSheet(file);
      } else if (name.endsWith(".csv") || name.endsWith(".txt")) {
        matrix = parseCsv(await file.text());
      } else {
        return onError("Upload the rate file as .xlsx (Excel) or .csv. A PDF or Word contract cannot be read automatically: copy its rates into the template.");
      }
      setPreview({ file, ...readRateRows(matrix, { agent, packages, existing }) });
    } catch (e) {
      onError(`Could not read the file: ${e?.message || e}`);
    }
  };

  const counts = useMemo(() => {
    const c = { new: 0, update: 0, same: 0, error: 0 };
    for (const r of preview?.rows || []) c[r.errors.length ? "error" : r.action] += 1;
    return c;
  }, [preview]);

  const doImport = async () => {
    if (!preview) return;
    setBusy(true);
    onError("");
    const good = preview.rows.filter((r) => !r.errors.length);
    const fresh = good.filter((r) => r.action === "new").map((r) => ({
      agent: r.agent, package: r.package, pax_min: r.pax_min, pax_max: r.pax_max, rate_per_pax: r.rate_per_pax,
      valid_from: r.valid_from, valid_to: r.valid_to, source: r.source, note: r.note,
    }));
    const changed = good.filter((r) => r.action === "update");
    let failed = "";
    if (fresh.length) {
      const res = await supabase.from("contract_rates").insert(fresh);
      if (res.error) failed = res.error.message;
    }
    if (!failed) {
      const results = await Promise.all(
        changed.map((r) =>
          supabase.from("contract_rates").update({ rate_per_pax: r.rate_per_pax, valid_to: r.valid_to, source: r.source, note: r.note, updated_at: new Date().toISOString() }).eq("id", r.existingId),
        ),
      );
      failed = results.find((x) => x.error)?.error?.message || "";
    }
    if (failed) { setBusy(false); return onError(`Import stopped: ${failed}`); }

    // Keep the original file in the agent's folder.
    let fileNote = "";
    const safe = preview.file.name.replace(/[^A-Za-z0-9._-]+/g, "_");
    const up = await supabase.storage.from(BUCKET).upload(`${folderKey(agent)}/${Date.now()}-${safe}`, preview.file, { upsert: false });
    if (up.error) fileNote = ` The rates are saved, but the file could not be kept in the folder (${up.error.message}). Has supabase/booking-rate-files.sql been run?`;
    setBusy(false);
    setPreview(null);
    if (input.current) input.current.value = "";
    await onDone(`Imported ${agent}: ${fresh.length} new, ${changed.length} updated, ${counts.same} unchanged${counts.error ? `, ${counts.error} ${counts.error === 1 ? "line" : "lines"} skipped` : ""}.${fileNote}`);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"><Upload size={16} />Upload a rate file for {agent}</h2>
      <p className="mb-3 text-sm text-slate-600">
        Use the template columns: Agent, Package, From pax, To pax, Rate per pax, Valid from, Valid to, Source, Note (Agent may stay empty). A line with the same package, pax range and Valid from
        as a saved rate updates it; any other line is added. You see the result before anything is saved.
      </p>
      <input
        ref={input}
        type="file"
        accept=".xlsx,.csv,.txt"
        onChange={(e) => e.target.files?.[0] && reading(e.target.files[0])}
        className="block w-full max-w-md text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
      />

      {preview?.fatal && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{preview.fatal}</p>}

      {preview && !preview.fatal && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">
            {preview.file.name}: {counts.new} new, {counts.update} to update, {counts.same} unchanged{counts.error ? `, ${counts.error} with errors` : ""}
          </p>
          <div className="max-h-96 overflow-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[800px] text-left text-sm text-slate-800">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-2 py-2">Line</th><th className="px-2 py-2">Result</th><th className="px-2 py-2">Package</th>
                  <th className="px-2 py-2 text-right">Pax</th><th className="px-2 py-2 text-right">Rate per pax</th>
                  <th className="px-2 py-2">Valid</th><th className="px-2 py-2">Check</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => {
                  const bad = r.errors.length > 0;
                  const label = bad ? "Error" : r.action === "new" ? "New" : r.action === "update" ? "Update" : "Same";
                  const cls = bad ? "bg-red-100 text-red-800" : r.action === "new" ? "bg-emerald-100 text-emerald-800" : r.action === "update" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600";
                  return (
                    <tr key={r.line} className={`border-t border-slate-100 ${bad ? "bg-red-50" : ""}`}>
                      <td className="px-2 py-1 text-slate-500">{r.line}</td>
                      <td className="px-2 py-1"><span className={`rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span></td>
                      <td className="px-2 py-1">{r.package || "-"}</td>
                      <td className="px-2 py-1 text-right">{r.pax_min ?? "-"}-{r.pax_max ?? "-"}</td>
                      <td className="px-2 py-1 text-right font-semibold">{r.rate_per_pax === null ? "-" : idr(r.rate_per_pax)}</td>
                      <td className="px-2 py-1">{r.valid_from || "-"} → {r.valid_to || "open"}</td>
                      <td className="px-2 py-1 text-xs">
                        {r.errors.map((m, i) => <div key={`e${i}`} className="text-red-700">{m}</div>)}
                        {r.warnings.map((m, i) => <div key={`w${i}`} className="text-amber-700">{m}</div>)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" disabled={busy || counts.new + counts.update === 0} onClick={doImport} className={btnMain}>
              {busy ? "Importing…" : `Import ${counts.new + counts.update} rates${counts.error ? ` (skip ${counts.error} ${counts.error === 1 ? "line" : "lines"} with errors)` : ""}`}
            </button>
            <button type="button" disabled={busy} onClick={() => { setPreview(null); if (input.current) input.current.value = ""; }} className={btnLight}>Cancel</button>
            {counts.new + counts.update === 0 && <span className="text-sm text-slate-500">Nothing to import from this file.</span>}
          </div>
        </div>
      )}
    </section>
  );
}

// Files kept in the agent's folder (contract-files bucket, one folder per agent).
function FilesPanel({ agent, onError, refreshKey }) {
  const [files, setFiles] = useState(null);
  const dir = folderKey(agent);

  const reload = useCallback(async () => {
    const r = await supabase.storage.from(BUCKET).list(dir, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (r.error) setFiles({ error: r.error.message });
    else setFiles({ list: (r.data || []).filter((f) => f.name && !f.name.startsWith(".")) });
  }, [dir]);

  useEffect(() => { reload(); }, [reload, refreshKey]);

  const open = async (f) => {
    const s = await supabase.storage.from(BUCKET).createSignedUrl(`${dir}/${f.name}`, 300);
    if (s.error) return onError(`Could not open the file: ${s.error.message}`);
    window.open(s.data.signedUrl, "_blank", "noopener");
  };
  const del = async (f) => {
    if (!window.confirm(`Delete the file "${f.name.replace(/^\d+-/, "")}" from this folder? The rates already imported stay.`)) return;
    const r = await supabase.storage.from(BUCKET).remove([`${dir}/${f.name}`]);
    if (r.error) onError(`Could not delete the file: ${r.error.message}`);
    reload();
  };

  if (!files) return null;
  if (files.error) {
    return <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">The file folder is not ready: {files.error}. Run supabase/booking-rate-files.sql once. Importing rates works without it.</p>;
  }
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"><FolderOpen size={16} />Files in the {agent} folder</h2>
      {files.list.length === 0 ? (
        <p className="text-sm text-slate-500">No file yet. A file you import is kept here.</p>
      ) : (
        <ul className="divide-y divide-slate-100 text-sm text-slate-800">
          {files.list.map((f) => (
            <li key={f.name} className="flex flex-wrap items-center gap-3 py-2">
              <FileText size={16} className="text-slate-400" />
              <span className="min-w-0 flex-1 truncate">{f.name.replace(/^\d+-/, "")}</span>
              <span className="text-xs text-slate-500">{f.created_at ? new Date(f.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Makassar" }) : ""}</span>
              <button type="button" onClick={() => open(f)} className="text-xs font-semibold text-teal-700 hover:underline">Open</button>
              <button type="button" onClick={() => del(f)} className="text-xs font-semibold text-red-700 hover:underline">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Shell({ children }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
}
