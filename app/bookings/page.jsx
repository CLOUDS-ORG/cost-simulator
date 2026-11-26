"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "../lib/supabase";
import {
  PACKAGE_TEMPLATES,
  baliDate,
  bookingFromQuote,
  emptyBooking,
  fillInclusions,
  longDate,
  missingFields,
} from "./lib";

const idr = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");

const QUOTE_BADGE = {
  Draft: "bg-slate-100 text-slate-700",
  Sent: "bg-amber-100 text-amber-800",
  Confirmed: "bg-emerald-100 text-emerald-800",
};

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

export default function BookingsPage() {
  const [auth, setAuth] = useState({ state: "loading", profile: null });
  const [bookings, setBookings] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [tab, setTab] = useState("bookings");
  const [range, setRange] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [quoteFilter, setQuoteFilter] = useState("open");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const today = baliDate(0);
  const tomorrow = baliDate(1);

  const load = useCallback(async () => {
    const [b, q] = await Promise.all([
      supabase.from("bookings").select("*").order("activity_date", { ascending: true }).limit(1000),
      supabase.from("quotes").select("data").order("updated_at", { ascending: false }).limit(500),
    ]);
    if (b.error) setError(`Could not load bookings: ${b.error.message}. Has supabase/bookings.sql been run?`);
    else setError("");
    setBookings(b.data || []);
    setQuotes((q.data || []).map((r) => r.data));
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) {
      setAuth({ state: "noconfig", profile: null });
      return;
    }
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return setAuth({ state: "loggedout", profile: null });
      const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (!p || p.status !== "Approved") return setAuth({ state: "loggedout", profile: null });
      setAuth({ state: "ok", profile: p });
      load();
    })();
  }, [load]);

  const bookedQuoteIds = useMemo(() => new Set(bookings.filter((b) => b.quote_id).map((b) => b.quote_id)), [bookings]);

  const visibleBookings = useMemo(() => {
    const s = search.trim().toLowerCase();
    return bookings
      .filter((b) => {
        if (range === "today") return b.activity_date === today;
        if (range === "tomorrow") return b.activity_date === tomorrow;
        if (range === "upcoming") return b.activity_date >= today;
        if (range === "past") return b.activity_date < today;
        return true;
      })
      .filter((b) => {
        if (!s) return true;
        return [b.guest_names.join(" "), b.agent, b.package, b.hotel, b.guide, b.driver].join(" ").toLowerCase().includes(s);
      })
      .sort((a, z) => (range === "past" ? z.activity_date.localeCompare(a.activity_date) : a.activity_date.localeCompare(z.activity_date)));
  }, [bookings, range, search, today, tomorrow]);

  // Problems worth fixing before the day: gaps tomorrow, and a guide on two bookings the same day.
  const alerts = useMemo(() => {
    const out = [];
    const live = bookings.filter((b) => b.status !== "Cancelled");
    for (const b of live.filter((x) => x.activity_date === tomorrow)) {
      const miss = missingFields(b);
      if (miss.length) out.push(`Tomorrow, ${b.guest_names[0] || "no name"} (${b.agent || "no agent"}): missing ${miss.join(", ")}`);
    }
    const seen = {};
    for (const b of live.filter((x) => x.activity_date >= today && x.guide)) {
      const k = `${b.activity_date}|${b.guide.toLowerCase()}`;
      (seen[k] = seen[k] || []).push(b);
    }
    for (const [k, list] of Object.entries(seen)) {
      if (list.length > 1) {
        const [d] = k.split("|");
        out.push(`${list[0].guide} is on ${list.length} bookings on ${longDate(d)}`);
      }
    }
    return out;
  }, [bookings, today, tomorrow]);

  const quotesShown = useMemo(() => {
    return quotes
      .filter((q) => {
        if (quoteFilter === "open") return q.status !== "Confirmed" || !bookedQuoteIds.has(q.id);
        if (quoteFilter === "all") return true;
        return q.status === quoteFilter;
      })
      .sort((a, z) => (z.savedAt || "").localeCompare(a.savedAt || ""));
  }, [quotes, quoteFilter, bookedQuoteIds]);

  const suggestions = useMemo(() => {
    const uniq = (key) => [...new Set(bookings.map((b) => b[key]).filter(Boolean))].sort();
    return { guide: uniq("guide"), driver: uniq("driver"), agent: uniq("agent"), restaurant: uniq("restaurant") };
  }, [bookings]);

  const save = async (b) => {
    const row = {
      ...b,
      guest_names: b.guest_names.map((n) => n.trim()).filter(Boolean),
      inclusions: b.inclusions.map((n) => n.trim()).filter(Boolean),
      pax: Number(b.pax) || 1,
      updated_at: new Date().toISOString(),
    };
    const { error: err } = row.id
      ? await supabase.from("bookings").update(row).eq("id", row.id)
      : await supabase.from("bookings").insert(row);
    if (err) {
      setError(`Could not save: ${err.message}`);
      return false;
    }
    setEditing(null);
    load();
    return true;
  };

  if (auth.state === "loading") return <Shell><p className="p-6 text-slate-500">Loading…</p></Shell>;
  if (auth.state === "noconfig")
    return <Shell><p className="p-6 text-red-700">Supabase is not configured. Add the .env values from .env.example.</p></Shell>;
  if (auth.state === "loggedout")
    return (
      <Shell>
        <div className="p-6">
          <p className="mb-3 text-slate-700">Please log in first.</p>
          <Link href="/" className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white">Go to login</Link>
        </div>
      </Shell>
    );

  const tomorrowIds = bookings.filter((b) => b.activity_date === tomorrow && b.status !== "Cancelled").map((b) => b.id);

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Bookings</h1>
          <p className="text-xs text-slate-500">Alam Bali Santhi · {auth.profile.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Cost simulator</Link>
          <button
            onClick={() => setEditing(emptyBooking())}
            className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white"
          >
            + New booking
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl p-4">
        {error && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        {alerts.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="mb-1 font-semibold">Needs attention</p>
            <ul className="list-disc pl-5">{alerts.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </div>
        )}

        <div className="mb-4 flex gap-2">
          {[["bookings", "Bookings"], ["quotes", "Quotes"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === k ? "bg-teal-700 text-white" : "bg-white text-slate-700 border border-slate-300"}`}
            >
              {label}
              {k === "quotes" && ` (${quotes.filter((q) => q.status !== "Confirmed" || !bookedQuoteIds.has(q.id)).length})`}
            </button>
          ))}
        </div>

        {tab === "bookings" && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {[["today", "Today"], ["tomorrow", "Tomorrow"], ["upcoming", "Upcoming"], ["past", "Past"], ["all", "All"]].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${range === k ? "bg-slate-900 text-white" : "bg-white border border-slate-300 text-slate-700"}`}
                >
                  {label}
                </button>
              ))}
              <input
                className={`${inputCls} max-w-xs`}
                placeholder="Search guest, agent, hotel, guide…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {tomorrowIds.length > 0 && (
                <a
                  href={`/bookings/passenger-list?${tomorrowIds.map((id) => `id=${id}`).join("&")}`}
                  target="_blank"
                  className="ml-auto rounded-lg border border-teal-700 px-3 py-2 text-sm font-semibold text-teal-800"
                >
                  Passenger lists for tomorrow ({tomorrowIds.length})
                </a>
              )}
            </div>

            {visibleBookings.length === 0 && <p className="py-10 text-center text-slate-500">No bookings here.</p>}
            <div className="grid gap-3">
              {visibleBookings.map((b) => (
                <BookingCard key={b.id} b={b} today={today} tomorrow={tomorrow} onEdit={() => setEditing(b)} />
              ))}
            </div>
          </>
        )}

        {tab === "quotes" && (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {[["open", "To follow up / book"], ["Draft", "Draft"], ["Sent", "Sent"], ["Confirmed", "Confirmed"], ["all", "All"]].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setQuoteFilter(k)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${quoteFilter === k ? "bg-slate-900 text-white" : "bg-white border border-slate-300 text-slate-700"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {quotesShown.length === 0 && <p className="py-10 text-center text-slate-500">No quotes here.</p>}
            <div className="grid gap-3">
              {quotesShown.map((q) => {
                const booked = bookedQuoteIds.has(q.id);
                return (
                  <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{q.title || q.id}</p>
                        <p className="text-sm text-slate-500">
                          {q.id} · PIC {q.pic || "-"} · {q.activityDate ? longDate(q.activityDate) : "date TBA"} · {(q.adults || 0) + (q.kids || 0)} pax
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${QUOTE_BADGE[q.status] || QUOTE_BADGE.Draft}`}>{q.status || "Draft"}</span>
                        {booked && <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">Booked</span>}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-slate-700">Price {idr(q.calculatedPrice)}</p>
                      {q.status === "Confirmed" && !booked && (
                        <button onClick={() => setEditing(bookingFromQuote(q))} className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white">
                          Create booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Quote status is changed in the cost simulator. Confirmed quotes show up here ready to turn into a booking.
            </p>
          </>
        )}
      </div>

      {editing && <BookingForm initial={editing} suggestions={suggestions} onSave={save} onClose={() => setEditing(null)} />}
    </Shell>
  );
}

function Shell({ children }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}

function BookingCard({ b, today, tomorrow, onEdit }) {
  const miss = b.status === "Cancelled" ? [] : missingFields(b);
  const edge =
    b.status === "Cancelled" ? "border-l-slate-300 opacity-60" : b.activity_date === today ? "border-l-red-500" : b.activity_date === tomorrow ? "border-l-emerald-500" : "border-l-slate-200";
  return (
    <div className={`rounded-xl border border-slate-200 border-l-8 bg-white p-4 ${edge}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {longDate(b.activity_date)}
            {b.activity_date === today && <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">Today</span>}
            {b.activity_date === tomorrow && <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Tomorrow</span>}
            {b.status !== "Confirmed" && <span className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700">{b.status}</span>}
          </p>
          <p className="text-base font-semibold text-slate-900">{b.guest_names.join(", ") || "No guest name yet"}</p>
          <p className="text-sm text-slate-600">{b.agent || "No agent"} · {b.pax} pax · {b.nationality || "nationality ?"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Edit</button>
          <a href={`/bookings/passenger-list?id=${b.id}`} target="_blank" className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white">
            Passenger list
          </a>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-700">{b.package || "No package"}</p>
      <p className="mt-1 text-sm text-slate-600">
        Hotel: {b.hotel || "-"} · Pick-up: {b.pickup_time || "-"} · Guide: {b.guide || "-"} · Driver: {b.driver || "-"}
      </p>
      {miss.length > 0 && <p className="mt-2 text-xs font-semibold text-amber-700">Missing: {miss.join(", ")}</p>}
    </div>
  );
}

function BookingForm({ initial, suggestions, onSave, onClose }) {
  const [b, setB] = useState({ ...initial, guest_names: initial.guest_names?.length ? initial.guest_names : [""] });
  const [saving, setSaving] = useState(false);
  const set = (patch) => setB((prev) => ({ ...prev, ...patch }));

  const applyTemplate = (name) => {
    const t = PACKAGE_TEMPLATES[name];
    if (!t) return;
    set({ package: t.package, inclusions: fillInclusions(t.inclusions, b.restaurant) });
  };

  const setGuest = (i, v) => set({ guest_names: b.guest_names.map((n, idx) => (idx === i ? v : n)) });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(b);
    setSaving(false);
  };

  const dl = (id, list) => (
    <datalist id={id}>{list.map((v) => <option key={v} value={v} />)}</datalist>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 p-0 sm:p-6">
      <form onSubmit={submit} className="mx-auto w-full max-w-2xl rounded-none bg-white p-4 sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{b.id ? "Edit booking" : "New booking"}{b.quote_id ? ` · from ${b.quote_id}` : ""}</h2>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1 text-slate-500">Close</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Date of activity</label>
            <input type="date" required className={inputCls} value={b.activity_date} onChange={(e) => set({ activity_date: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={b.status} onChange={(e) => set({ status: e.target.value })}>
              <option>Confirmed</option>
              <option>Done</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Name of guest (include Mr./Ms.)</label>
            {b.guest_names.map((n, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input className={inputCls} placeholder="Mr. Noskov Aleksei" value={n} onChange={(e) => setGuest(i, e.target.value)} />
                {b.guest_names.length > 1 && (
                  <button type="button" className="rounded-lg border border-slate-300 px-3 text-slate-600" onClick={() => set({ guest_names: b.guest_names.filter((_, idx) => idx !== i) })}>
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="text-sm font-semibold text-teal-700" onClick={() => set({ guest_names: [...b.guest_names, ""] })}>
              + Add guest
            </button>
          </div>

          <div>
            <label className={labelCls}>Nationality</label>
            <input className={inputCls} value={b.nationality} onChange={(e) => set({ nationality: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Total pax</label>
            <input type="number" min="1" className={inputCls} value={b.pax} onChange={(e) => set({ pax: e.target.value })} />
          </div>

          <div>
            <label className={labelCls}>Name of agent</label>
            <input list="dl-agent" className={inputCls} value={b.agent} onChange={(e) => set({ agent: e.target.value })} />
            {dl("dl-agent", suggestions.agent)}
          </div>
          <div>
            <label className={labelCls}>Hotel</label>
            <input className={inputCls} value={b.hotel} onChange={(e) => set({ hotel: e.target.value })} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Tour package</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {Object.keys(PACKAGE_TEMPLATES).map((name) => (
                <button key={name} type="button" onClick={() => applyTemplate(name)} className="rounded-full border border-teal-700 px-3 py-1 text-sm font-semibold text-teal-800">
                  Use “{name}” template
                </button>
              ))}
            </div>
            <textarea rows={3} className={inputCls} value={b.package} onChange={(e) => set({ package: e.target.value })} />
          </div>

          <div>
            <label className={labelCls}>Pick-up time</label>
            <input className={inputCls} placeholder="06.00" value={b.pickup_time} onChange={(e) => set({ pickup_time: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Restaurant</label>
            <input list="dl-rest" className={inputCls} placeholder="TA Restaurant (Booked by ABS)" value={b.restaurant} onChange={(e) => set({ restaurant: e.target.value })} />
            {dl("dl-rest", suggestions.restaurant)}
          </div>

          <div>
            <label className={labelCls}>Boat departure Sanur</label>
            <input className={inputCls} placeholder="07.30 hrs Sanjaya Fast Boat" value={b.boat_sanur} onChange={(e) => set({ boat_sanur: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Boat departure Panida</label>
            <input className={inputCls} placeholder="16.30 hrs Sanjaya Fast Boat" value={b.boat_panida} onChange={(e) => set({ boat_panida: e.target.value })} />
          </div>

          <div>
            <label className={labelCls}>Guide</label>
            <input list="dl-guide" className={inputCls} value={b.guide} onChange={(e) => set({ guide: e.target.value })} />
            {dl("dl-guide", suggestions.guide)}
          </div>
          <div>
            <label className={labelCls}>Driver Bali</label>
            <input list="dl-driver" className={inputCls} value={b.driver} onChange={(e) => set({ driver: e.target.value })} />
            {dl("dl-driver", suggestions.driver)}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Special request</label>
            <input className={inputCls} placeholder="Pick up at 06.00AM from Grand Hyatt Hotel" value={b.special_request} onChange={(e) => set({ special_request: e.target.value })} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Inclusion (one per line; lines with “ABS” print in red)</label>
            <textarea rows={7} className={inputCls} value={b.inclusions.join("\n")} onChange={(e) => set({ inclusions: e.target.value.split("\n") })} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700">Cancel</button>
          <button disabled={saving} className="rounded-lg bg-teal-700 px-5 py-2 font-semibold text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
