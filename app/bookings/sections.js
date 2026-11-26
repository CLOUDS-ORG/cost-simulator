import { CalendarDays, FileText, ListChecks, Calculator, Compass } from "lucide-react";
import { ACCOUNTING_ROLES } from "./costing";

// Everything a person can open from the portal and from the side menu.
// What each person sees depends on their role / flags, so one place decides it.
export function sectionsFor(profile) {
  if (!profile) return [];
  const role = profile.role;
  const staff = role === "Booking Staff"; // bookings only
  const out = [
    { key: "bookings", href: "/bookings", title: "Bookings", desc: "Today, tomorrow and upcoming tours. Add or edit a booking, print passenger lists.", Icon: CalendarDays },
  ];
  if (!staff) out.push({ key: "quotes", href: "/bookings?tab=quotes", title: "Quotes", desc: "Quotes from the Cost simulator and whether they are confirmed. Turn a quote into a booking.", Icon: FileText });
  if (role === "GOD" || profile.can_edit_catalog === true)
    out.push({ key: "lists", href: "/bookings?tab=lists", title: "Vendor lists", desc: "Dropdown lists used in the booking form: agents, boats, drivers, lunch and more.", Icon: ListChecks });
  if (ACCOUNTING_ROLES.includes(role))
    out.push({ key: "accounting", href: "/bookings/accounting", title: "Accounting", desc: "Cost of every booking from the Cost simulator catalog, hotel areas, CSV for Google Sheets.", Icon: Calculator });
  if (!staff) out.push({ key: "simulator", href: "/", title: "Cost simulator", desc: "Build and price a tour quote.", Icon: Compass });
  return out;
}
