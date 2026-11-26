"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "../../lib/supabase";
import { fillInclusions, longDate } from "../lib";
import ThemeToggle from "../ThemeToggle";

// Printable passenger list in the Alam Bali Santhi format.
// Open with /bookings/passenger-list?id=<booking id>[&id=<another>] and use Print > Save as PDF.
// Several ids print one page per booking.

const RED = "#e00000";

function Row({ label, children, grey }) {
  return (
    <tr style={{ background: grey ? "#f2f2f2" : "#fff" }}>
      <td className="pl-label">{label}</td>
      <td className="pl-value">{children}</td>
    </tr>
  );
}

function Red({ children }) {
  return <span style={{ color: RED }}>{children}</span>;
}

// "TA Restaurant (Booked by ABS)": name in black, the bracket note in red.
function RestaurantText({ text }) {
  const i = text.indexOf("(");
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <Red>{text.slice(i)}</Red>
    </>
  );
}

function Sheet({ b }) {
  const inclusions = fillInclusions(b.inclusions, b.restaurant);
  const rows = [
    ["DATE OF ACTIVITY", longDate(b.activity_date)],
    ["NAME OF GUEST", b.guest_names.map((n, i) => <div key={i}>{n}</div>)],
    ["NATIONALITY", b.nationality],
    ["TOTAL PAX", <Red key="p">{b.pax} Pax</Red>],
    ["NAME OF AGENT", b.agent],
    ["TOUR PACKAGE", b.package],
    ["BOAT DEPARTURE SANUR", <Red key="s">{b.boat_sanur}</Red>],
    ["BOAT DEPARTURE PANIDA", <Red key="n">{b.boat_panida}</Red>],
    ["NAME GUIDE", b.guide],
    ["DRIVER BALI", <Red key="d">{b.driver}</Red>],
    b.restaurant ? ["RESTAURANT NAME", <RestaurantText key="r" text={b.restaurant} />] : null,
    b.special_request ? ["SPECIAL REQUEST", <Red key="q">{b.special_request}</Red>] : null,
    [
      "INCLUSION",
      inclusions.map((l, i) => (
        <div key={i}>{/ABS/.test(l) ? <Red>{l}</Red> : l}</div>
      )),
    ],
  ].filter(Boolean);

  return (
    <section className="pl-page">
      <img src="/abs-logo.png" alt="Alam Bali Santhi" className="pl-logo" />
      <h1 className="pl-title">PASSENGER LIST</h1>
      <table className="pl-table">
        <tbody>
          {rows.map(([label, value], i) => (
            <Row key={label} label={label} grey={i % 2 === 1}>
              {value}
            </Row>
          ))}
        </tbody>
      </table>
      <footer className="pl-footer">
        <div style={{ color: "#3b82c4", fontSize: 15 }}>PT. ALAM BALI SANTHI</div>
        <div>Jl. Bypass Ngurah Rai No.21 Sanur,Bali - Indonesia</div>
        <div>Phone : +62 853 3883 3577 Email : info@alambalisanthi.com</div>
        <div>www.alambalisathi.com</div>
      </footer>
    </section>
  );
}

export default function PassengerListPage() {
  const [state, setState] = useState({ status: "loading", rows: [], message: "" });

  useEffect(() => {
    (async () => {
      if (!supabaseConfigured) return setState({ status: "error", rows: [], message: "Supabase is not configured." });
      const ids = new URLSearchParams(window.location.search).getAll("id");
      if (!ids.length) return setState({ status: "error", rows: [], message: "No booking selected." });
      const { data: s } = await supabase.auth.getSession();
      if (!s?.session) return setState({ status: "loggedout", rows: [], message: "" });
      const { data, error } = await supabase.from("bookings").select("*").in("id", ids);
      if (error) return setState({ status: "error", rows: [], message: error.message });
      const order = new Map(ids.map((id, i) => [id, i]));
      data.sort((a, z) => order.get(a.id) - order.get(z.id));
      setState({ status: "ok", rows: data, message: "" });
    })();
  }, []);

  if (state.status === "loading") return <p style={{ padding: 24 }}>Loading…</p>;
  if (state.status === "loggedout")
    return (
      <p style={{ padding: 24 }}>
        Please <Link href="/" style={{ color: "#0f766e", fontWeight: 700 }}>log in</Link> first, then open the passenger list again.
      </p>
    );
  if (state.status === "error") return <p style={{ padding: 24, color: "#b91c1c" }}>{state.message}</p>;

  return (
    <div className="pl-root">
      <style>{css}</style>
      <div className="pl-toolbar">
        <ThemeToggle />
        <Link href="/portal" style={{ color: "#0f766e", fontWeight: 700 }}>← Home</Link>
        <button onClick={() => window.print()}>Print / Save as PDF</button>
        <span>{state.rows.length} passenger list{state.rows.length > 1 ? "s" : ""}. In the print window choose “Save as PDF”.</span>
      </div>
      {state.rows.map((b) => (
        <Sheet key={b.id} b={b} />
      ))}
    </div>
  );
}

const css = `
  .pl-root { background: #e5e7eb; min-height: 100vh; padding: 16px 0; font-family: Calibri, Carlito, Arial, sans-serif; color: #111; }
  .pl-toolbar { max-width: 794px; margin: 0 auto 12px; display: flex; gap: 12px; align-items: center; padding: 0 8px; font-size: 14px; }
  .pl-toolbar button { background: #0f766e; color: #fff; border: 0; border-radius: 8px; padding: 10px 16px; font-weight: 700; font-size: 15px; cursor: pointer; }
  .pl-page { position: relative; width: 794px; min-height: 1123px; margin: 0 auto 16px; background: #fff; padding: 36px 60px 150px; box-sizing: border-box; break-after: page; }
  .pl-page:last-of-type { break-after: auto; }
  .pl-logo { display: block; width: 400px; margin: 0 auto; }
  .pl-title { text-align: center; font-size: 22px; font-weight: 700; margin: 10px 0 22px; letter-spacing: .5px; }
  .pl-table { width: 100%; border-collapse: collapse; border: 1px solid #d0d0d0; font-size: 14px; }
  .pl-table td { border: 1px solid #d9d9d9; padding: 4px 8px; vertical-align: top; }
  .pl-label { width: 36%; }
  .pl-value { font-weight: 700; }
  .pl-footer { position: absolute; left: 0; right: 0; bottom: 36px; text-align: center; font-size: 14px; line-height: 1.5; }
  @page { size: A4; margin: 0; }
  @media print {
    .pl-root { background: #fff; padding: 0; }
    .pl-toolbar { display: none; }
    .pl-page { margin: 0; width: 210mm; height: 296mm; min-height: 0; padding: 12mm 16mm 40mm; overflow: hidden; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;
