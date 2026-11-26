"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { baliDate, longDate } from "../bookings/lib";
import { costBooking, idr } from "../bookings/costing";
import { canOpen } from "../bookings/sections";
import { financeMaps, salePriceFor } from "../bookings/finance";
import { watchPresence } from "../bookings/presence";
import ThemeToggle from "../bookings/ThemeToggle";
import AppMenu from "../bookings/AppMenu";

// Booking dashboard: this month's bookings, profit and cost, who is online, quotations.

function monthRange(month) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [`${month}-01`, `${month}-${String(last).padStart(2, "0")}`];
}

export default function DashboardPage() {
  const [auth, setAuth] = useState({ state: "loading", profile: null });
  const [bookings, setBookings] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [areaRows, setAreaRows] = useState([]);
  const [financeRows, setFinanceRows] = useState([]);
  const [rates, setRates] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [online, setOnline] = useState([]);
  const [error, setError] = useState("");

  const today = baliDate(0);
  const month = today.slice(0, 7);
  const [start, end] = monthRange(month);
  const monthName = new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  useEffect(() => {
    if (!supabaseConfigured) return setAuth({ state: "noconfig", profile: null });
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return setAuth({ state: "loggedout", profile: null });
      const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (!p || p.status !== "Approved") return setAuth({ state: "loggedout", profile: null });
      if (!canOpen(p, "dashboard")) return setAuth({ state: "denied", profile: p });
      setAuth({ state: "ok", profile: p });

      const b = await supabase.from("bookings").select("*").gte("activity_date", start).lte("activity_date", end).order("activity_date");
      if (b.error) setError(`Could not load bookings: ${b.error.message}`);
      else setBookings(b.data || []);
      const cat = await supabase.from("app_state").select("value").eq("key", "catalog").maybeSingle();
      if (cat.data?.value) setCatalog(cat.data.value);
      else setError((e) => e || "The cost catalog is not available, so cost and profit cannot be worked out.");
      const areas = await supabase.from("booking_hotel_areas").select("*");
      if (!areas.error) setAreaRows(areas.data || []);
      const fin = await supabase.from("booking_finance").select("*");
      if (fin.error) setError((e) => e || `Could not load sale prices: ${fin.error.message}. Has supabase/booking-dashboard.sql been run?`);
      else setFinanceRows(fin.data || []);
      const qs = await supabase.from("quotes").select("data").order("updated_at", { ascending: false }).limit(1000);
      if (!qs.error) setQuotes((qs.data || []).map((r) => r.data));
      const cr = await supabase.from("contract_rates").select("*");
      if (!cr.error) setRates(cr.data || []); // no table yet (booking-rates.sql not run): prices just stay without CR
    })();
  }, [start, end]);

  useEffect(() => watchPresence(setOnline), []);

  const money = useMemo(() => {
    if (!catalog) return null;
    const areaMap = Object.fromEntries(areaRows.map((r) => [r.hotel_key, r.area]));
    const maps = financeMaps(bookings, financeRows, quotes, rates);
    const rows = bookings
      .filter((b) => b.status !== "Cancelled")
      .map((b) => {
        const cost = costBooking(b, catalog, areaMap);
        const sale = salePriceFor(b, maps);
        return { b, cost, sale, profit: sale.price === null ? null : sale.price - cost.total };
      });
    const priced = rows.filter((r) => r.sale.price !== null);
    const sales = priced.reduce((s, r) => s + r.sale.price, 0);
    const pricedCost = priced.reduce((s, r) => s + r.cost.total, 0);
    return {
      cost: rows.reduce((s, r) => s + r.cost.total, 0),
      sales,
      profit: sales - pricedCost,
      unpriced: rows.filter((r) => r.sale.price === null),
      losses: priced.filter((r) => r.profit < 0).sort((a, z) => a.profit - z.profit),
      checking: rows.filter((r) => r.cost.issues > 0).length,
    };
  }, [bookings, catalog, areaRows, financeRows, quotes, rates]);

  const upcoming = useMemo(
    () => bookings.filter((b) => b.status !== "Cancelled" && b.status !== "Done" && b.activity_date >= today),
    [bookings, today]
  );
  const stats = useMemo(() => {
    const live = bookings.filter((b) => b.status !== "Cancelled");
    return {
      all: live.length,
      done: live.filter((b) => b.status === "Done" || b.activity_date < today).length,
      paxLeft: upcoming.reduce((s, b) => s + (Number(b.pax) || 0), 0),
      cancelled: bookings.length - live.length,
    };
  }, [bookings, upcoming, today]);

  const q = useMemo(() => {
    const waiting = quotes.filter((x) => x.status !== "Confirmed");
    return {
      waiting: waiting.length,
      draft: waiting.filter((x) => x.status === "Draft").length,
      sent: waiting.filter((x) => x.status === "Sent").length,
      created: quotes.filter((x) => (x.savedAt || "").startsWith(month)).length,
      confirmed: quotes.filter((x) => (x.confirmedAt || "").startsWith(month)).length,
      total: quotes.length,
    };
  }, [quotes, month]);

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
          <p className="mb-3 text-slate-700">You do not have access to the dashboard. Ask the master admin to switch it on for your account.</p>
          <Link href="/portal" className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white">Back to home</Link>
        </div>
      </Shell>
    );

  const profitIsLoss = money && money.profit < 0;

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Dashboard · {monthName}</h1>
          <p className="text-xs text-slate-500">Alam Bali Santhi · {auth.profile.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ThemeToggle />
          <AppMenu profile={auth.profile} />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-4 p-4 lg:grid-cols-2">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 lg:col-span-2">{error}</div>}

        <Card title="Upcoming bookings this month" className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-end gap-x-8 gap-y-2">
            <Big value={upcoming.length} label={`still to run (${stats.paxLeft} pax)`} />
            <Small value={stats.done} label="already done" />
            <Small value={stats.all} label="bookings this month" />
            {stats.cancelled > 0 && <Small value={stats.cancelled} label="cancelled" />}
          </div>
          <ul className="divide-y divide-slate-100 text-sm">
            {upcoming.slice(0, 10).map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
                <span className="w-28 shrink-0 font-semibold">{b.activity_date === today ? "Today" : longDate(b.activity_date).replace(/^\w+, /, "")}</span>
                <span className="min-w-0 flex-1">
                  {b.guest_names[0] || "-"}{b.guest_names.length > 1 ? ` +${b.guest_names.length - 1}` : ""}
                  <span className="text-slate-500"> · {b.pax} pax · {b.agent || "no agent"}</span>
                </span>
                <span className="text-xs text-slate-500">{b.package.length > 40 ? `${b.package.slice(0, 40)}…` : b.package}</span>
              </li>
            ))}
            {upcoming.length === 0 && <li className="py-2 text-slate-500">No more bookings this month.</li>}
          </ul>
          {upcoming.length > 10 && <p className="mt-2 text-xs text-slate-500">Showing the first 10 of {upcoming.length}. </p>}
          <Link href="/bookings" className="mt-2 inline-block text-sm font-semibold text-teal-800">Open all bookings →</Link>
        </Card>

        <Card title="Profit and cost this month">
          {!money ? (
            <p className="text-sm text-slate-500">Working it out…</p>
          ) : (
            <>
              <div className="mb-3 grid grid-cols-3 gap-3">
                <Small value={idr(money.sales)} label="sales (priced bookings)" />
                <Small value={idr(money.cost)} label="total cost (all bookings)" />
                <Small value={idr(money.profit)} label={profitIsLoss ? "LOSS (priced bookings)" : "profit (priced bookings)"} tone={profitIsLoss ? "bad" : "good"} />
              </div>
              {money.unpriced.length > 0 && (
                <p className="mb-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">
                  {money.unpriced.length} booking(s) have no sale price yet, so they are not in the profit figure.{" "}
                  <Link href="/bookings/accounting" className="font-semibold underline">Enter prices in Accounting</Link>
                </p>
              )}
              {money.checking > 0 && <p className="mb-2 text-xs text-slate-500">{money.checking} booking(s) have cost lines that are guessed or have no rate in the catalog.</p>}
              {money.losses.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-700">Booking(s) making a loss</p>
                  <ul className="text-sm">
                    {money.losses.slice(0, 5).map(({ b, profit }) => (
                      <li key={b.id} className="flex justify-between gap-2 border-b border-slate-100 py-1">
                        <span>{longDate(b.activity_date).replace(/^\w+, /, "")} · {b.guest_names[0] || "-"}</span>
                        <span className="font-semibold text-red-700">{idr(profit)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {money.losses.length === 0 && money.unpriced.length === 0 && <p className="text-sm text-slate-500">No booking is making a loss.</p>}
            </>
          )}
        </Card>

        <Card title="Quotations">
          <div className="mb-3 flex flex-wrap items-end gap-x-8 gap-y-2">
            <Big value={q.waiting} label={`waiting (${q.draft} draft, ${q.sent} sent)`} />
            <Small value={q.created} label="created this month" />
            <Small value={q.confirmed} label="confirmed this month" />
          </div>
          <p className="text-xs text-slate-500">Waiting = not confirmed yet. {q.total} quotations in total{auth.profile.role === "GOD" || auth.profile.can_see_all_dashboard_quotes ? "" : " (only the ones you may see)"}.</p>
          <Link href="/bookings?tab=quotes" className="mt-2 inline-block text-sm font-semibold text-teal-800">Open quotes →</Link>
        </Card>

        <Card title="Team online now" className="lg:col-span-2">
          <div className="mb-2 flex items-end gap-6">
            <Big value={online.length} label={online.length === 1 ? "person online" : "people online"} />
          </div>
          <ul className="flex flex-wrap gap-2 text-sm">
            {online.map((u) => (
              <li key={u.id} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-semibold">{u.name}</span>
                <span className="text-xs text-slate-500">{u.role}</span>
              </li>
            ))}
            {online.length === 0 && <li className="text-slate-500">Connecting…</li>}
          </ul>
          <p className="mt-2 text-xs text-slate-500">Counts people who have a page of this app open (portal, bookings, accounting, dashboard). Someone working only in the Cost simulator is not shown.</p>
        </Card>
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
}

function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

function Big({ value, label }) {
  return (
    <div>
      <p className="text-4xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

function Small({ value, label, tone }) {
  const color = tone === "bad" ? "text-red-700" : tone === "good" ? "text-emerald-700" : "text-slate-900";
  return (
    <div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-600">{label}</p>
    </div>
  );
}
