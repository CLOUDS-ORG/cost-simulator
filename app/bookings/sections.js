import { UserCheck, CalendarDays, FileText, ListChecks, Calculator, Compass, LayoutDashboard, ShieldCheck, Tags } from "lucide-react";

// What each account may do in the bookings app. profiles.section_access = null means "the role's defaults";
// a list means exactly those permissions. Mirrors has_section() in supabase/booking-permissions.sql.
export const PERMISSIONS = [
  { key: "bookings", label: "View bookings and passenger lists" },
  { key: "booking_add", label: "Add new bookings" },
  { key: "booking_edit", label: "Edit existing bookings" },
  { key: "quotes", label: "Quotes tab (turn quotes into bookings)" },
  { key: "lists", label: "Edit the vendor lists (dropdowns of the booking form)" },
  { key: "guides", label: "Guide schedule (see who works, who is off)" },
  { key: "guides_edit", label: "Edit the guide schedule (codes, add or remove guides)" },
  { key: "dashboard", label: "Booking dashboard (profit, quotes, who is online)" },
  { key: "accounting", label: "Accounting (booking costs and sale prices)" },
  { key: "simulator", label: "Cost simulator" },
];
const FINANCE_ROLES = ["Operations & Finance", "Admin Manager"];
// Guide accounts only ever open their own bookings and their own guide schedule (the database enforces it too).
export const GUIDE_ROLE = "Tour Guide / Field Lead";
const GUIDE_PERMS = ["bookings", "guides"];

function roleDefault(p, key) {
  if (p.role === GUIDE_ROLE) return GUIDE_PERMS.includes(key);
  const staff = p.role === "Booking Staff";
  switch (key) {
    case "guides_edit":
    case "dashboard":
    case "accounting":
      return FINANCE_ROLES.includes(p.role);
    case "lists":
      return p.can_edit_catalog === true;
    case "guides":
      return !["Freelance Sales", "Partner Agency / B2B Reseller"].includes(p.role);
    case "bookings":
    case "booking_edit":
      return true;
    case "booking_add":
    case "quotes":
    case "simulator":
      return !staff;
    default:
      return false;
  }
}

// What the role gives without a custom list (used to prefill the editor).
export function defaultPermissions(p) {
  return PERMISSIONS.map((x) => x.key).filter((k) => roleDefault(p, k));
}

export function canOpen(profile, key) {
  if (!profile) return false;
  if (profile.role === "GOD") return true;
  if (key === "accounts") return false;
  if (profile.role === GUIDE_ROLE) return GUIDE_PERMS.includes(key);
  if (Array.isArray(profile.section_access)) return profile.section_access.includes(key);
  return roleDefault(profile, key);
}

// Everything a person can open from the portal and from the side menu.
export function sectionsFor(profile) {
  if (!profile) return [];
  const out = [];
  if (canOpen(profile, "dashboard")) out.push({ key: "dashboard", href: "/dashboard", title: "Dashboard", desc: "This month at a glance: upcoming bookings, profit and cost, who is online, quotations.", Icon: LayoutDashboard });
  if (canOpen(profile, "bookings")) out.push({ key: "bookings", href: "/bookings", title: "Bookings", desc: "Today, tomorrow and upcoming tours. Add or edit a booking, print passenger lists.", Icon: CalendarDays });
  if (canOpen(profile, "bookings") && canOpen(profile, "quotes")) out.push({ key: "quotes", href: "/bookings?tab=quotes", title: "Quotes", desc: "Quotes from the Cost simulator and whether they are confirmed. Turn a quote into a booking.", Icon: FileText });
  if (canOpen(profile, "bookings") && canOpen(profile, "lists")) out.push({ key: "lists", href: "/bookings?tab=lists", title: "Vendor lists", desc: "Dropdown lists used in the booking form: agents, boats, drivers, lunch and more.", Icon: ListChecks });
  if (canOpen(profile, "guides")) out.push({ key: "guides", href: "/guides", title: "Guide schedule", desc: "Who works, who is off and which bookings still need a guide, like the Schedule sheet.", Icon: UserCheck });
  if (canOpen(profile, "accounting")) out.push({ key: "accounting", href: "/bookings/accounting", title: "Accounting", desc: "Cost and sale price of every booking, hotel areas, CSV for Google Sheets.", Icon: Calculator });
  if (canOpen(profile, "accounting")) out.push({ key: "rates", href: "/bookings/rates", title: "Contract rates", desc: "Master data of the agent contract rates (CR). Update rates; bookings without a price use them.", Icon: Tags });
  if (canOpen(profile, "accounts")) out.push({ key: "accounts", href: "/accounts", title: "Accounts & permissions", desc: "See every account, add people, change roles and decide who can open what.", Icon: ShieldCheck });
  if (canOpen(profile, "simulator")) out.push({ key: "simulator", href: "/", title: "Cost simulator", desc: "Build and price a tour quote.", Icon: Compass });
  return out;
}
