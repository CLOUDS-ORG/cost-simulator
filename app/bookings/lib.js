// Shared helpers for the Bookings pages (list, form, passenger list).

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "2026-11-27" -> "Friday, 27 November 2026" (same wording as the printed passenger list).
export function longDate(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[dow]}, ${d} ${MONTHS[m - 1]} ${y}`;
}

// Today / tomorrow as YYYY-MM-DD in Bali time (WITA, UTC+8), whatever the device timezone is.
export function baliDate(offsetDays = 0) {
  const now = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar" }).format(now);
}

// Package templates. Choosing one fills the package text and the standard inclusions.
// Lines containing "ABS" are printed in red on the passenger list, like the current format.
export const PACKAGE_TEMPLATES = {
  Exotic: {
    package:
      "West Tour Package + Snorkeling 4 Places (Angel Billabong, Broken Beach, Kelingking Cliff) + (Manta Bay, Crystal Bay, Gamat Bay, Wall/Jetty)",
    inclusions: [
      "Boat transfer Sanur- Nusa Penida (Return)",
      "Hotel return transfer in Bali",
      "Private Snorkeling Boat by Ocean Rider (Snorkeling Siang) booked by ABS",
      "Snorkeling Gear (Mask, Snorkel, Fin)",
      "1 x Lunch at {restaurant}",
      "Private guide from ABS",
      "Cover Insurance",
    ],
  },
};

export function emptyBooking(date = baliDate(1)) {
  return {
    quote_id: null,
    activity_date: date,
    guest_names: [""],
    nationality: "",
    pax: 2,
    agent: "",
    package: "",
    hotel: "",
    pickup_time: "",
    boat_sanur: "",
    boat_panida: "",
    guide: "",
    driver: "",
    restaurant: "",
    special_request: "",
    inclusions: [],
    status: "Confirmed",
  };
}

// Inclusion lines may contain {restaurant}; fill it with the booking's restaurant name.
export function fillInclusions(lines, restaurant) {
  // "TA Restaurant (Booked by ABS)" -> "TA Restaurant" inside the lunch line.
  const name = (restaurant || "").replace(/\s*\(.*\)\s*$/, "").trim() || "restaurant";
  return (lines || []).map((l) => l.replaceAll("{restaurant}", name));
}

// What the team still has to fill in before the day. Used for the checks panel.
export function missingFields(b) {
  const out = [];
  if (!b.guide) out.push("guide");
  if (!b.driver) out.push("driver");
  if (!b.pickup_time) out.push("pick-up time");
  if (!b.hotel) out.push("hotel");
  if (!b.guest_names?.some((n) => n.trim())) out.push("guest names");
  return out;
}

// Quote totals to prefill a booking from a confirmed quote in the cost simulator.
export function bookingFromQuote(q) {
  const adults = Number(q.adults) || 0;
  const kids = Number(q.kids) || 0;
  const firstDay = q.days?.[0]?.title || "";
  return {
    ...emptyBooking(q.activityDate || baliDate(1)),
    quote_id: q.id,
    pax: Math.max(1, adults + kids),
    package: firstDay,
    agent: q.agentName || "",
  };
}
