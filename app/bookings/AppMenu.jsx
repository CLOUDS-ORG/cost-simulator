"use client";
import React, { useEffect, useState } from "react";
import { Menu, X, LogOut, LayoutGrid } from "lucide-react";
import { supabase } from "../lib/supabase";
import { sectionsFor } from "./sections";

// Side menu that opens from the right. It lists only what this person's role may open.
export default function AppMenu({ profile }) {
  const [open, setOpen] = useState(false);
  const [here, setHere] = useState("");

  useEffect(() => {
    if (open) setHere(window.location.pathname + window.location.search);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items = sectionsFor(profile);
  const isActive = (href) => {
    if (here === href) return true;
    // "/bookings" is the Bookings tab only when no ?tab= is given
    return false;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
        aria-label="Open menu"
      >
        <Menu size={16} /> Menu
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-l border-slate-200 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alam Bali Santhi</p>
                <p className="font-bold text-slate-900">{profile?.name}</p>
                <p className="text-xs text-slate-500">{profile?.role}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-1 text-slate-700">
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              <a href="/portal" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${here === "/portal" ? "bg-teal-700 text-white" : "text-slate-700"}`}>
                <LayoutGrid size={16} /> Home
              </a>
              {items.map(({ key, href, title, Icon }) => (
                <a
                  key={key}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${isActive(href) ? "bg-teal-700 text-white" : "text-slate-700"}`}
                >
                  <Icon size={16} /> {title}
                </a>
              ))}
            </nav>

            <button
              type="button"
              onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
              className="mt-auto flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              <LogOut size={16} /> Log out
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
