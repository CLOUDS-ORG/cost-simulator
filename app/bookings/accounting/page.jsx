"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "../../lib/supabase";
import { baliDate, longDate } from "../lib";
import ThemeToggle from "../ThemeToggle";
import AppMenu from "../AppMenu";
import { ACCOUNTING_ROLES, costBooking, guessArea, hotelSegments, idr, transferAreas } from "../costing";

// Accounting view: every booking with its cost, worked out from the cost simulator catalog.
// Open to the roles in ACCOUNTING_ROLES only.

const inputCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

const STATUS_BADGE = {
  ok: null,
  guess: "bg-amber-100 text-amber-800",
  missing: "bg-red-100 text-red-800",
};

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export default function AccountingPage() {
  const [auth, setAuth] = useState({ state: "loading", profile: null });
  const [bookings, setBookings] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [areaRows, setAreaRows] = useState([]);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(baliDate(0).slice(0, 7));
  const [search, setSearch] = useState("");
  const [showCancelled, setShowCancelled] = useState(false);
  const [open, setOpen] = useState({});
  const [showAreas, setShowAreas] = useState(false);

  const load = useCallback(async () => {
    const all = [];
    for (let from = 0; ; from += 1000) {
      const page = await supabase
        .from("bookings")
        .select("*")
        .order("activity_date", { ascending: true })
        .order("created_at", { ascending: true })
        .range(from, from + 999);
      if (page.error) return setError(`Could not load bookings: ${page.error.message}`);
      all.push(...page.data);
      if (page.data.length < 1000) break;
    }
    setBookings(all);

    const cat = await supabase.from("app_state").select("value").eq("key", "catalog").maybeSingle();
    if (cat.error) setError(`Could not load the cost catalog: ${cat.error.message}`);
    else if (!cat.data?.value) setError("The cost catalog has not been saved yet. Open the Cost simulator > Catalog and save it once.");
    else setCatalog(cat.data.value);

    const areas = await supabase.from("booking_hotel_areas").select("*");
    if (areas.error) setError((e) => e || `Could not load hotel areas: ${areas.error.message}. Has supabase/booking-accounting.sql been run?`);
    else setAreaRows(areas.data || []);
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return setAuth({ state: "noconfig", profile: null });
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return setAuth({ state: "loggedout", profile: null });
      const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (!p || p.status !== "Approved") return setAuth({ state: "loggedout", profile: null });
      if (!ACCOUNTING_ROLES.includes(p.role)) return setAuth({ state: "denied", profile: p });
      setAuth({ state: "ok", profile: p });
      load();
    })();
  }, [load]);

  const areaMap = useMemo(() => Object.fromEntries(areaRows.map((r) => [r.hotel_key, r.area])), [areaRows]);
  const areas = useMemo(() => (catalog ? transferAreas(catalog) : []), [catalog]);

  const months = useMemo(() => {
    const set = new Set(bookings.map((b) => b.activity_date.slice(0, 7)));
    set.add(baliDate(0).slice(0, 7));
    return [...set].sort();
  }, [bookings]);

  const rows = useMemo(() => {
    if (!catalog) return [];
    const s = search.trim().toLowerCase();
    return bookings
      .filter((b) => month === "all" || b.activity_date.startsWith(month))
      .filter((b) => showCancelled || b.status !== "Cancelled")
      .filter((b) => !s || [b.guest_names.join(" "), b.agent, b.package, b.hotel].join(" ").toLowerCase().includes(s))
      .map((b) => ({ b, cost: costBooking(b, catalog, areaMap) }));
  }, [bookings, catalog, areaMap, month, search, showCancelled]);

  const summary = useMemo(() => {
    const active = rows.filter((r) => r.b.status !== "Cancelled");
    return {
      count: active.length,
      pax: active.reduce((s, r) => s + (Number(r.b.pax) || 0), 0),
      total: active.reduce((s, r) => s + r.cost.total, 0),
      missing: active.reduce((s, r) => s + r.cost.missing, 0),
      bookingsWithIssues: active.filter((r) => r.cost.issues > 0).length,
    };
  }, [rows]);

  // Hotels in the bookings on screen, with the area in use (confirmed, guessed or none).
  const hotels = useMemo(() => {
    const seen = new Map();
    for (const { b } of rows) {
      for (const seg of hotelSegments(b.hotel, b.pax)) {
        if (!seen.has(seg.key)) seen.set(seg.key, { key: seg.key, name: seg.name, count: 0 });
        seen.get(seg.key).count += 1;
      }
    }
    return [...seen.values()]
      .map((h) => ({ ...h, saved: areaMap[h.key] || "", guessed: guessArea(h.name) || "" }))
      .sort((a, z) => Number(Boolean(a.saved)) - Number(Boolean(z.saved)) || a.name.localeCompare(z.name));
  }, [rows, areaMap]);

  const saveArea = async (h, area) => {
    const res = area
      ? await supabase.from("booking_hotel_areas").upsert({ hotel_key: h.key, hotel_name: h.name, area, updated_at: new Date().toISOString() })
      : await supabase.from("booking_hotel_areas").delete().eq("hotel_key", h.key);
    if (res.error) setError(`Could not save the area: ${res.error.message}`);
    else setError("");
    const fresh = await supabase.from("booking_hotel_areas").select("*");
    if (!fresh.error) setAreaRows(fresh.data || []);
  };

  const exportCsv = () => {
    const head = ["Date", "Status", "Agent", "Guests", "Pax", "Package", "Hotel", "Cost total (IDR)", "Cost per pax (IDR)", "Cost lines", "Needs checking"];
    const body = rows.map(({ b, cost }) => [
      b.activity_date,
      b.status,
      b.agent,
      b.guest_names.join("; "),
      b.pax,
      b.package,
      b.hotel,
      Math.round(cost.total),
      Math.round(cost.perPax),
      cost.lines.map((l) => `${l.label}: ${Math.round(l.cost)}`).join(" | "),
      cost.lines.filter((l) => l.status !== "ok").map((l) => `${l.status}: ${l.label}`).join(" | "),
    ]);
    const csv = "﻿" + [head, ...body].map((r) => r.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-costs-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <p className="mb-3 text-slate-700">This page is for accounting and management accounts only.</p>
          <Link href="/bookings" className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white">Back to bookings</Link>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Accounting · booking costs</h1>
          <p className="text-xs text-slate-500">Alam Bali Santhi · {auth.profile.name} · costs come from the Cost simulator catalog</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ThemeToggle />
          <button onClick={exportCsv} className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white">Download CSV (Google Sheets)</button>
          <AppMenu profile={auth.profile} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl p-4">
        {error && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <select className={inputCls} value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="all">All months</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input className={`${inputCls} max-w-xs`} placeholder="Search guest, agent, hotel…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} /> Show cancelled
          </label>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <Stat label="Bookings" value={summary.count} />
          <Stat label="Pax" value={summary.pax} />
          <Stat label="Total cost" value={idr(summary.total)} />
          <Stat
            label="Need checking"
            value={`${summary.bookingsWithIssues} booking${summary.bookingsWithIssues === 1 ? "" : "s"}`}
            tone={summary.bookingsWithIssues ? "warn" : "ok"}
            hint={summary.missing ? `${summary.missing} line(s) have no rate in the catalog` : undefined}
          />
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <button onClick={() => setShowAreas(!showAreas)} className="text-sm font-semibold text-teal-800">
            {showAreas ? "Hide" : "Show"} hotel areas ({hotels.filter((h) => !h.saved).length} not confirmed)
          </button>
          {showAreas && (
            <div className="mt-3">
              <p className="mb-2 text-sm text-slate-600">
                The area decides which “&lt;Area&gt; Transfer” rate is used for the hotel pick-up. Amber = guessed from the hotel name, please confirm.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {hotels.map((h) => (
                  <div key={h.key} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-800" title={h.name}>{h.name}</span>
                    <select
                      className={`${inputCls} w-44 py-1 text-sm ${h.saved ? "" : "border-amber-400 bg-amber-50"}`}
                      value={h.saved}
                      onChange={(e) => saveArea(h, e.target.value)}
                    >
                      <option value="">{h.guessed ? `${h.guessed} (guess)` : "Not set"}</option>
                      {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                ))}
                {hotels.length === 0 && <p className="text-sm text-slate-500">No hotels in these bookings.</p>}
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Guests</th>
                <th className="px-3 py-2">Agent</th>
                <th className="px-3 py-2 text-right">Pax</th>
                <th className="px-3 py-2 text-right">Cost</th>
                <th className="px-3 py-2 text-right">Per pax</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ b, cost }) => (
                <React.Fragment key={b.id}>
                  <tr
                    className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${b.status === "Cancelled" ? "opacity-50" : ""}`}
                    onClick={() => setOpen((o) => ({ ...o, [b.id]: !o[b.id] }))}
                  >
                    <td className="whitespace-nowrap px-3 py-2">{longDate(b.activity_date).replace(/^\w+, /, "")}</td>
                    <td className="px-3 py-2">
                      {b.guest_names[0] || "-"}
                      {b.guest_names.length > 1 && <span className="text-slate-500"> +{b.guest_names.length - 1}</span>}
                      <div className="text-xs text-slate-500">{b.package.length > 48 ? `${b.package.slice(0, 48)}…` : b.package}</div>
                    </td>
                    <td className="px-3 py-2">{b.agent}</td>
                    <td className="px-3 py-2 text-right">{b.pax}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">{idr(cost.total)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-slate-600">{idr(cost.perPax)}</td>
                    <td className="px-3 py-2 text-right">
                      {cost.missing > 0 && <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">{cost.missing} missing</span>}
                      {cost.missing === 0 && cost.issues > 0 && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{cost.issues} to check</span>}
                    </td>
                  </tr>
                  {open[b.id] && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-3 py-3">
                        <table className="w-full text-left text-sm">
                          <tbody>
                            {cost.lines.map((l, i) => (
                              <tr key={i} className="border-b border-slate-200 last:border-0">
                                <td className="w-32 py-1 pr-2 text-xs font-semibold uppercase text-slate-500">{l.category}</td>
                                <td className="py-1 pr-2">
                                  {l.label}
                                  <div className="text-xs text-slate-500">
                                    {l.item ? `${l.item} · ${l.caption}` : l.caption}
                                  </div>
                                </td>
                                <td className="w-24 py-1 pr-2">
                                  {STATUS_BADGE[l.status] && (
                                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[l.status]}`}>{l.status === "guess" ? "guess" : "no rate"}</span>
                                  )}
                                </td>
                                <td className="whitespace-nowrap py-1 text-right font-semibold">{idr(l.cost)}</td>
                              </tr>
                            ))}
                            {cost.lines.length === 0 && <tr><td className="py-1 text-slate-500">Nothing to cost on this booking yet (no package, boat, lunch or inclusions).</td></tr>}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500">{catalog ? "No bookings for this filter." : "Loading the cost catalog…"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Amber “guess” = the booking did not say enough, so a default was used (for example the cheapest menu of a restaurant, or the Bali
          transfer area guessed from the hotel name). Red “no rate” = the catalog has no matching item, so it is not in the total yet.
          Bali transfers are priced per car (4 pax per car) like the cost simulator.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
}

function Stat({ label, value, tone, hint }) {
  const color = tone === "warn" ? "text-amber-700" : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
