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

// Dropdown choices copied from the Google Form "INPUT BOOKING". Edit the lists here to change the form.
export const FORM_OPTIONS = {
  agents: [
    "LH TRAVEL", "PANORAMA DESTINATION", "JOURNEY JOURNEY INDONESIA", "NEXUS DMC", "SMILING", "KOREAN TRAVEL",
    "FLY BALI", "PACTO", "BALI DORADA", "DISCOVA", "ICS", "Bhara Bali Tour", "PEGASUS", "DIRECT BOKING",
    "EXPEDITION", "Alindo Dewata Tour", "Eagle Voyages", "MUSEMENT", "BALIVE", "KUN TRAVEL", "BALI MULA",
    "LUXURY", "JIVAN TOUR", "U&I", "BALI TRIP", "VALE TOUR", "ALAM BALI SANTHI", "HIS TOUR",
    "BINTANG PARADISE TOUR", "JTB Indonesia", "ASIAN TRAIL", "DWI TOUR", "Bali Hopper Paradise",
  ],
  nationalities: ["ASIAN", "INDIAN", "EUROPEAN", "AMERICAN", "RUSSIAN", "AUSTRALIA", "AFRICAN", "INDONESIAN", "KOREAN"],
  tourPackages: [
    "West Tour", "Exotic 4 Places", "Exotic 3 Places", "Exotic 2 Places", "East Tour", "Combination",
    "Snorkeling Only 4 Places", "Snorkeling Only 3 Places", "Snorkeling Only 2 Places", "Snorkeling Sharing",
    "West Tour + Poonton", "Rafting Short", "POTTERY WHEEL THROWING", "ATV", "LEMBONGAN LAND TOUR 4 PLACE",
    "Car Charter 8 hours",
  ],
  boatVendors: [
    "7.30-16.30 SANJAYA", "8.30-16.30 SANJAYA", "7.30-13.45 RAYFISH", "8.30-16.30 RAYFISH", "7.30-16.30 RAYFISH",
    "9.00-16.30 ARJUNA", "10.30-16.30 EINSTEIN", "10.30 ARJUNA (PENIDA  - BALI)", "8.00-16.30 CASPLA",
    "7.00-16.00 GANGGA EXPRESS (KUSAMBA)", "8.00-16.00 GANGGA EXPRESS (KUSAMBA", "9.00-16.00 GANGGA EXPRESS (KUSAMBA)",
    "8.30-16.00 SETIA FAST FERRY (SANUR-LEMBONGAN)", "12.30 SETIA FAST FERRY (SANUR-LEMBONGAN)",
    "16.00 SETIA FAST FERRY (SANUR-LEMBONGAN)", "09.30-17.00 SETIA FAST FERRY (LEMBONGAN-SANUR)",
    "12.30 SETIA FAST FERRY (LEMBONGAN-SANUR)", "17.00 SETIA FAST FERRY (LEMBONGAN-SANUR)",
    "07.30 - 16.30 Maruti", "08.00 - 16.30 Maruti",
  ],
  transportVendors: ["Pasek", "Kadek", "Wayan Lugage", "ADI LEMBONGAN", "DEDI LEMBONGAN", "Maruti"],
  inclusions: [
    "Wellcome Drink", "Whole Coconut", "Glass Coconut", "Lugage Car", "Driver Bali", "Fast Boat", "Sharing Snorkeling",
    "Private Snorkeling", "Towel", "Retribution Island", "Private Guide", "Lunch", "Cover Insurance",
    "Snack Box + Mineral Water", "English Speaking Driver",
  ],
  snorkelingVendors: ["Elite Snorkeling", "Ocean Rider Snorkeling", "Wahid Snorkeling", "Wonderland Snorkeling", "Maruti"],
  lunchVendors: [
    "Arjuna Beach Club", "TA Restaurant", "Maruti Beach Club", "Sorent", "Angle Resto", "Downtown", "Delhi 6",
    "Pramana", "Khamara", "AMOK SUNSET", "AMERTA", "Funtasea",
  ],
};

// Tour packages that have a ready-made text + inclusion list (see PACKAGE_TEMPLATES).
export const TEMPLATE_FOR_PACKAGE = { "Exotic 4 Places": "Exotic" };

// "7.30-16.30 SANJAYA" -> { sanur: "07.30 hrs Sanjaya Fast Boat", panida: "16.30 hrs Sanjaya Fast Boat" }.
// Returns null when the option is not a "going-return" pair (single trips, odd spellings); fill those by hand.
export function boatTimesFromVendor(option) {
  const m = /^(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})\s+(.+)$/.exec((option || "").trim());
  if (!m) return null;
  const pad = (h, mm) => `${h.padStart(2, "0")}.${mm}`;
  const name = m[5].replace(/\s*\(.*$/, "").trim();
  const title = name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const label = `${title} Fast Boat`;
  return { sanur: `${pad(m[1], m[2])} hrs ${label}`, panida: `${pad(m[3], m[4])} hrs ${label}` };
}

export function emptyBooking(date = baliDate(1)) {
  return {
    quote_id: null,
    activity_date: date,
    guest_names: [""],
    nationality: "",
    pax: 2,
    agent: "",
    pic_agent: "",
    boat_vendor: [],
    car_unit: "",
    snorkeling_vendor: "",
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
