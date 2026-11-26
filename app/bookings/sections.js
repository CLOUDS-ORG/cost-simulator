import { CalendarDays, FileText, ListChecks, Calculator, Compass, LayoutDashboard, ShieldCheck } from "lucide-react";

// Roles that may open Accounting and the Dashboard unless the account has its own list (profiles.section_access).
const DEFAULT_ROLES = ["GOD", "Operations & Finance", "Admin Manager"];
export const ACCESS_KEYS = [
  { key: "accounting", label: "Accounting (booking costs, sale prices)" },
  { key: "dashboard", label: "Booking dashboard (profit, quotes, who is online)" },
];

// Can this account open that page? Mirrors has_section() in supabase/booking-dashboard.sql.
export function canOpen(profile, key) {
  if (!profile) return false;
  if (profile.role === "GOD") return true;
  if (key === "accounts") return false;
  if (key === "accounting" || key === "dashboard") {
    if (Array.isArray(profile.section_access)) return profile.section_access.includes(key);
    return DEFAULT_ROLES.includes(profile.role);
  }
  return true;
}

// Everything a person can open from the portal and from the side menu.
export function sectionsFor(profile) {
  if (!profile) return [];
  const staff = profile.role === "Booking Staff"; // bookings only
  const out = [];
  if (canOpen(profile, "dashboard")) out.push({ key: "dashboard", href: "/dashboard", title: "Dashboard", desc: "This month at a glance: upcoming bookings, profit and cost, who is online, quotations.", Icon: LayoutDashboard });
  out.push({ key: "bookings", href: "/bookings", title: "Bookings", desc: "Today, tomorrow and upcoming tours. Add or edit a booking, print passenger lists.", Icon: CalendarDays });
  if (!staff) out.push({ key: "quotes", href: "/bookings?tab=quotes", title: "Quotes", desc: "Quotes from the Cost simulator and whether they are confirmed. Turn a quote into a booking.", Icon: FileText });
  if (profile.role === "GOD" || profile.can_edit_catalog === true)
    out.push({ key: "lists", href: "/bookings?tab=lists", title: "Vendor lists", desc: "Dropdown lists used in the booking form: agents, boats, drivers, lunch and more.", Icon: ListChecks });
  if (canOpen(profile, "accounting"))
    out.push({ key: "accounting", href: "/bookings/accounting", title: "Accounting", desc: "Cost and sale price of every booking, hotel areas, CSV for Google Sheets.", Icon: Calculator });
  if (canOpen(profile, "accounts"))
    out.push({ key: "accounts", href: "/accounts", title: "Accounts & permissions", desc: "See every account, change roles and decide who can open what.", Icon: ShieldCheck });
  if (!staff) out.push({ key: "simulator", href: "/", title: "Cost simulator", desc: "Build and price a tour quote.", Icon: Compass });
  return out;
}
