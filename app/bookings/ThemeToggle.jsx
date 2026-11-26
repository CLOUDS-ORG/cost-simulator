"use client";
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// Light / dark switch for the bookings pages. The choice is remembered in this browser; the first time it follows the
// device setting. Dark mode works by adding the "abs-dark" class to <html> (colours are defined in globals.css), and the
// class is removed again when the user leaves the bookings pages so the Cost simulator keeps its own look.
const KEY = "abs-theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    const initial = saved ? saved === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setDark(Boolean(initial));
    return () => document.documentElement.classList.remove("abs-dark", "abs-light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("abs-dark", dark);
    document.documentElement.classList.toggle("abs-light", !dark);
  }, [dark]);

  const flip = () => {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem(KEY, next ? "dark" : "light"); } catch {}
  };

  return (
    <button
      type="button"
      onClick={flip}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {dark ? "Light" : "Dark"}
    </button>
  );
}
