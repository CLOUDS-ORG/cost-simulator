"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "../lib/supabase";
import AppMenu from "../bookings/AppMenu";
import ThemeToggle from "../bookings/ThemeToggle";
import { sectionsFor } from "../bookings/sections";

// Landing page: after logging in, each person picks what they came to do.
export default function PortalPage() {
  const [auth, setAuth] = useState({ state: "loading", profile: null });

  useEffect(() => {
    if (!supabaseConfigured) return setAuth({ state: "noconfig", profile: null });
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) return setAuth({ state: "loggedout", profile: null });
      const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (!p || p.status !== "Approved") return setAuth({ state: "loggedout", profile: null });
      setAuth({ state: "ok", profile: p });
    })();
  }, []);


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

  const items = sectionsFor(auth.profile);
  const firstName = (auth.profile.name || "").split(" ")[0];

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Alam Bali Santhi</h1>
          <p className="text-xs text-slate-500">{auth.profile.name} · {auth.profile.role}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ThemeToggle />
          <AppMenu profile={auth.profile} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl p-4 sm:p-8">
        <h2 className="mb-1 text-2xl font-bold text-slate-900">Welcome{firstName ? `, ${firstName}` : ""}</h2>
        <p className="mb-6 text-slate-600">What would you like to open?</p>
        {items.length === 0 && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">No page is open for your account yet. Ask the master admin to set your permissions.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(({ key, href, title, desc, Icon }) => (
            <a key={key} href={href} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-600">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <Icon size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{title}</p>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
}
