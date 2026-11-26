"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { baliDate, longDate } from "../bookings/lib";
import { canOpen } from "../bookings/sections";
import ThemeToggle from "../bookings/ThemeToggle";
import AppMenu from "../bookings/AppMenu";

// Guide schedule: the "GUIDE" block of the Schedule sheet (guides down, days across), plus a check
// of which bookings have no guide or a guide who is off.

const CODES = [
  { code: "M", label: "Office", cls: "bg-slate-100 text-slate-800" },
  { code: "S", label: "Snorkeling", cls: "bg-sky-100 text-sky-800" },
  { code: "T", label: "Tour", cls: "bg-emerald-100 text-emerald-800" },
  { code: "G", label: "Group", cls: "bg-violet-100 text-violet-800" },
  { code: "INSP", label: "Inspection", cls: "bg-indigo-100 text-indigo-800" },
  { code: "DO", label: "Day off", cls: "bg-amber-100 text-amber-800" },
  { code: "DO REQ", label: "Day off requested", cls: "bg-orange-100 text-orange-800" },
  { code: "DC", label: "Doctor certificate", cls: "bg-rose-100 text-rose-800" },
  { code: "CT", label: "Leave (cuti)", cls: "bg-pink-100 text-pink-800" },
  { code: "PH", label: "Public holiday", cls: "bg-teal-100 text-teal-800" },
];
const CODE_CLS = Object.fromEntries(CODES.map((c) => [c.code, c.cls]));
const OFF = ["DO", "DO REQ", "DC", "CT"];
const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const splitNames = (text) => String(text || "").split(/[,;&\n]+|\band\b|\//i).map((x) => x.trim()).filter(Boolean);

function monthDays(month) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: last }, (_, i) => {
    const d = String(i + 1).padStart(2, "0");
    const iso = `${month}-${d}`;
    return { iso, n: i + 1, dow: new Date(Date.UTC(y, m - 1, i + 1)).getUTCDay() };
  });
}
function shiftMonth(month, delta) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function GuidesPage() {
  const [auth, setAuth] = useState({ state: "loading", profile: null });
  const today = baliDate(0);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [guides, setGuides] = useState([]);
  const [roster, setRoster] = useState({}); // "guide|iso" -> code
  const [bookings, setBookings] = useState([]);
  const [bookingsOk, setBookingsOk] = useState(true);
  const [checkDate, setCheckDate] = useState(baliDate(1));
  const [newGuide, setNewGuide] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canEdit = auth.profile ? canOpen(auth.profile, "guides_edit") : false;
  const days = useMemo(() => monthDays(month), [month]);
  const monthName = new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  useEffect(() => {
    if (!supabaseConfigured) return setAuth({ state: "noconfig", profile: null });
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return setAuth({ state: "loggedout", profile: null });
      const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (!p || p.status !== "Approved") return setAuth({ state: "loggedout", profile: null });
      if (!canOpen(p, "guides")) return setAuth({ state: "denied", profile: p });
      setAuth({ state: "ok", profile: p });
    })();
  }, []);

  useEffect(() => {
    if (auth.state !== "ok") return;
    (async () => {
      const first = days[0].iso;
      const last = days[days.length - 1].iso;
      const g = await supabase.from("guide_staff").select("name").order("sort_order").order("name");
      if (g.error) return setError(`Could not load guides: ${g.error.message}. Has supabase/booking-guides.sql been run?`);
      setGuides((g.data || []).map((r) => r.name));
      const r = await supabase.from("guide_roster").select("guide,day,code").gte("day", first).lte("day", last);
      if (r.error) return setError(`Could not load the schedule: ${r.error.message}`);
      setRoster(Object.fromEntries((r.data || []).map((x) => [`${x.guide}|${x.day}`, x.code])));
      const b = await supabase
        .from("bookings")
        .select("id,activity_date,guest_names,guide,status,pax,package")
        .gte("activity_date", first)
        .lte("activity_date", last)
        .order("activity_date");
      if (b.error) setBookingsOk(false);
      else { setBookingsOk(true); setBookings(b.data || []); }
    })();
  }, [auth.state, days]);

  // Match a guide name typed in a booking to a roster name ("Beby" -> "Mang Beby").
  const matchGuide = useMemo(() => {
    const lower = guides.map((g) => [g, g.toLowerCase()]);
    return (token) => {
      const t = token.toLowerCase();
      const exact = lower.find(([, l]) => l === t);
      if (exact) return exact[0];
      const near = lower.filter(([, l]) => l.split(/\s+/).includes(t) || t.split(/\s+/).includes(l));
      return near.length === 1 ? near[0][0] : null;
    };
  }, [guides]);

  const live = useMemo(() => bookings.filter((b) => b.status !== "Cancelled"), [bookings]);
  const bookedBy = useMemo(() => {
    const m = {}; // "guide|iso" -> bookings
    const unknown = new Set();
    for (const b of live) {
      for (const tok of splitNames(b.guide)) {
        const g = matchGuide(tok);
        if (!g) { unknown.add(tok); continue; }
        (m[`${g}|${b.activity_date}`] ||= []).push(b);
      }
    }
    return { m, unknown: [...unknown] };
  }, [live, matchGuide]);

  const codeOf = (g, iso) => roster[`${g}|${iso}`] || "";

  async function setCode(g, iso, code) {
    const key = `${g}|${iso}`;
    const before = roster[key];
    setRoster((r) => { const n = { ...r }; if (code) n[key] = code; else delete n[key]; return n; });
    const res = code
      ? await supabase.from("guide_roster").upsert({ guide: g, day: iso, code, updated_at: new Date().toISOString() })
      : await supabase.from("guide_roster").delete().eq("guide", g).eq("day", iso);
    if (res.error) {
      setError(`Could not save: ${res.error.message}`);
      setRoster((r) => { const n = { ...r }; if (before) n[key] = before; else delete n[key]; return n; });
    }
  }

  async function addGuide() {
    const name = newGuide.trim();
    if (!name || guides.some((g) => g.toLowerCase() === name.toLowerCase())) return;
    setBusy(true);
    const res = await supabase.from("guide_staff").insert({ name, sort_order: guides.length + 1 });
    setBusy(false);
    if (res.error) return setError(`Could not add the guide: ${res.error.message}`);
    setGuides((g) => [...g, name]);
    setNewGuide("");
  }
  async function removeGuide(g) {
    if (!window.confirm(`Remove ${g} from the schedule? Their codes in every month are deleted too.`)) return;
    const res = await supabase.from("guide_staff").delete().eq("name", g);
    if (res.error) return setError(`Could not remove the guide: ${res.error.message}`);
    setGuides((x) => x.filter((n) => n !== g));
  }

  const totals = (g) => {
    const t = { M: 0, S: 0, T: 0, off: 0, leave: 0 };
    for (const d of days) {
      const c = codeOf(g, d.iso);
      if (c === "M") t.M++;
      else if (c === "S") t.S++;
      else if (c === "T") t.T++;
      else if (c === "DO" || c === "DO REQ") t.off++;
      else if (c === "CT" || c === "DC") t.leave++;
    }
    return t;
  };

  // Everything to look at in the check: per day, who is off, who is free, bookings without a guide or with an off guide.
  const dayCheck = (iso) => {
    const dayBookings = live.filter((b) => b.activity_date === iso);
    const off = guides.filter((g) => OFF.includes(codeOf(g, iso)));
    const free = guides.filter((g) => !OFF.includes(codeOf(g, iso)));
    const noGuide = dayBookings.filter((b) => splitNames(b.guide).length === 0);
    const clash = [];
    for (const b of dayBookings) {
      for (const tok of splitNames(b.guide)) {
        const g = matchGuide(tok);
        if (g && OFF.includes(codeOf(g, iso))) clash.push({ b, g, code: codeOf(g, iso) });
      }
    }
    return { dayBookings, off, free, noGuide, clash };
  };

  const problems = useMemo(() => {
    const out = [];
    for (const d of days) {
      if (d.iso < today) continue;
      const c = dayCheck(d.iso);
      if (c.noGuide.length || c.clash.length) out.push({ iso: d.iso, ...c });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, live, roster, guides, today]);

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
          <p className="mb-3 text-slate-700">You do not have access to the guide schedule. Ask the master admin to switch it on for your account.</p>
          <Link href="/portal" className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white">Back to home</Link>
        </div>
      </Shell>
    );

  const check = dayCheck(checkDate);
  const cell = "border border-slate-200 px-0.5 py-1 text-center text-xs";

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Guide schedule · {monthName}</h1>
          <p className="text-xs text-slate-500">Alam Bali Santhi · {auth.profile.name}{canEdit ? "" : " · view only"}</p>
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

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">← Previous</button>
          <button type="button" onClick={() => setMonth(today.slice(0, 7))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">This month</button>
          <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">Next →</button>
          <span className="ml-2 text-xs text-slate-500">
            {CODES.map((c) => (
              <span key={c.code} className={`mr-1 inline-block rounded px-1.5 py-0.5 font-semibold ${c.cls}`}>{c.code} {c.label}</span>
            ))}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-slate-800">
            <thead>
              <tr>
                <th className={`${cell} sticky left-0 z-10 min-w-[120px] bg-white text-left font-bold`}>GUIDE</th>
                {days.map((d) => (
                  <th key={d.iso} className={`${cell} min-w-[44px] font-semibold ${d.iso === today ? "bg-teal-100 text-teal-800" : d.dow === 0 || d.dow === 6 ? "bg-slate-100" : ""}`}>
                    <div className="text-[10px] font-normal text-slate-500">{WEEKDAY[d.dow]}</div>
                    {d.n}
                  </th>
                ))}
                <th className={`${cell} px-2 font-bold`}>Office</th>
                <th className={`${cell} px-2 font-bold`}>Snork.</th>
                <th className={`${cell} px-2 font-bold`}>Tour</th>
                <th className={`${cell} px-2 font-bold`}>Off</th>
                <th className={`${cell} px-2 font-bold`}>Leave</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((g) => {
                const t = totals(g);
                return (
                  <tr key={g}>
                    <td className={`${cell} sticky left-0 z-10 bg-white px-2 text-left font-semibold`}>
                      <div className="flex items-center justify-between gap-1">
                        <span>{g}</span>
                        {canEdit && (
                          <button type="button" onClick={() => removeGuide(g)} aria-label={`Remove ${g}`} className="text-slate-400 hover:text-red-700">×</button>
                        )}
                      </div>
                    </td>
                    {days.map((d) => {
                      const c = codeOf(g, d.iso);
                      const booked = bookedBy.m[`${g}|${d.iso}`] || [];
                      const clash = booked.length > 0 && OFF.includes(c);
                      const tip = booked.length ? `${booked.length} booking(s): ${booked.map((b) => b.guest_names[0] || "-").join(", ")}` : undefined;
                      return (
                        <td key={d.iso} title={tip} className={`${cell} relative ${CODE_CLS[c] || ""} ${clash ? "outline outline-2 -outline-offset-2 outline-red-600" : ""}`}>
                          {canEdit ? (
                            <select
                              value={c}
                              onChange={(e) => setCode(g, d.iso, e.target.value)}
                              className="w-full cursor-pointer appearance-none bg-transparent text-center text-xs font-semibold"
                              aria-label={`${g} ${d.iso}`}
                            >
                              <option value="">·</option>
                              {CODES.map((x) => <option key={x.code} value={x.code}>{x.code}</option>)}
                            </select>
                          ) : (
                            <span className="font-semibold">{c || "·"}</span>
                          )}
                          {booked.length > 0 && <span className="absolute right-0.5 top-0 text-[9px] font-bold text-emerald-700">●{booked.length > 1 ? booked.length : ""}</span>}
                        </td>
                      );
                    })}
                    <td className={`${cell} px-2`}>{t.M}</td>
                    <td className={`${cell} px-2`}>{t.S}</td>
                    <td className={`${cell} px-2`}>{t.T}</td>
                    <td className={`${cell} px-2`}>{t.off}</td>
                    <td className={`${cell} px-2`}>{t.leave}</td>
                  </tr>
                );
              })}
              {guides.length === 0 && (
                <tr><td colSpan={days.length + 6} className="p-4 text-center text-sm text-slate-500">No guides yet.</td></tr>
              )}
              <tr className="bg-slate-50 font-semibold">
                <td className={`${cell} sticky left-0 z-10 bg-slate-50 px-2 text-left`}>Guides free</td>
                {days.map((d) => <td key={d.iso} className={cell}>{guides.filter((g) => !OFF.includes(codeOf(g, d.iso))).length}</td>)}
                <td colSpan={5} className={cell} />
              </tr>
              {bookingsOk && (
                <tr className="bg-slate-50 font-semibold">
                  <td className={`${cell} sticky left-0 z-10 bg-slate-50 px-2 text-left`}>Bookings</td>
                  {days.map((d) => {
                    const n = live.filter((b) => b.activity_date === d.iso).length;
                    const free = guides.filter((g) => !OFF.includes(codeOf(g, d.iso))).length;
                    return <td key={d.iso} className={`${cell} ${n > free && guides.length ? "bg-red-100 text-red-800" : ""}`}>{n || "·"}</td>;
                  })}
                  <td colSpan={5} className={cell} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          ● in a cell = the guide is named on a booking that day (hover for the guest). A red frame means that guide is marked off but is on a booking.
          A red number under Bookings means more bookings than guides who are free.
        </p>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="New guide name"
              value={newGuide}
              onChange={(e) => setNewGuide(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGuide()}
            />
            <button type="button" disabled={busy || !newGuide.trim()} onClick={addGuide} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">+ Add guide</button>
          </div>
        )}

        {!bookingsOk && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Your account cannot view bookings, so the booking checks below are hidden.</div>
        )}

        {bookingsOk && (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Check a day</h2>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <input type="date" value={checkDate} onChange={(e) => { setCheckDate(e.target.value); if (e.target.value) setMonth(e.target.value.slice(0, 7)); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
                <button type="button" onClick={() => { setCheckDate(today); setMonth(today.slice(0, 7)); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Today</button>
                <button type="button" onClick={() => { const t = baliDate(1); setCheckDate(t); setMonth(t.slice(0, 7)); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Tomorrow</button>
              </div>
              <p className="mb-2 text-sm font-semibold">{longDate(checkDate)}</p>
              {checkDate.slice(0, 7) !== month ? null : (
                <ul className="space-y-2 text-sm">
                  <li><span className="font-semibold">Day off: </span>{check.off.length ? check.off.map((g) => `${g} (${codeOf(g, checkDate)})`).join(", ") : "nobody"}</li>
                  <li><span className="font-semibold">Free: </span>{check.free.length ? check.free.map((g) => `${g}${codeOf(g, checkDate) ? ` (${codeOf(g, checkDate)})` : ""}`).join(", ") : "nobody"}</li>
                  <li><span className="font-semibold">Bookings: </span>{check.dayBookings.length}</li>
                  {check.noGuide.length > 0 && (
                    <li className="rounded-lg bg-red-50 p-2 text-red-800">
                      No guide yet: {check.noGuide.map((b) => `${b.guest_names[0] || "-"} (${b.pax} pax)`).join(", ")}
                    </li>
                  )}
                  {check.clash.length > 0 && (
                    <li className="rounded-lg bg-red-50 p-2 text-red-800">
                      Guide is off: {check.clash.map((c) => `${c.g} (${c.code}) on ${c.b.guest_names[0] || "-"}`).join(", ")}
                    </li>
                  )}
                  {check.dayBookings.length > 0 && check.noGuide.length === 0 && check.clash.length === 0 && (
                    <li className="rounded-lg bg-emerald-50 p-2 text-emerald-800">Every booking has a guide who is not off.</li>
                  )}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Needs attention this month</h2>
              {problems.length === 0 ? (
                <p className="text-sm text-slate-500">No booking without a guide, and no guide on a booking while off, from today to the end of the month.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {problems.map((p) => (
                    <li key={p.iso} className="py-2">
                      <button type="button" onClick={() => setCheckDate(p.iso)} className="font-semibold text-teal-800">{longDate(p.iso).replace(/, \d{4}$/, "")}</button>
                      {p.noGuide.length > 0 && <p className="text-red-800">No guide: {p.noGuide.map((b) => b.guest_names[0] || "-").join(", ")}</p>}
                      {p.clash.length > 0 && <p className="text-red-800">Guide off: {p.clash.map((c) => `${c.g} (${c.code})`).join(", ")}</p>}
                    </li>
                  ))}
                </ul>
              )}
              {bookedBy.unknown.length > 0 && (
                <p className="mt-3 text-xs text-slate-500">Names on bookings that are not in this schedule: {bookedBy.unknown.join(", ")}</p>
              )}
            </section>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
}
