// Cost of a booking, worked out from the cost simulator's vendor catalog (app_state key "catalog").
// Pure functions: no database access. The pricing rules (per pax / per unit / tier / flat) are the same as in
// the cost simulator, so a booking costs what the same trip costs there.
//
// Each cost line says what it matched in the catalog. A line marked "guess" used a default because the booking
// did not say enough (e.g. no menu price for the lunch); a line marked "missing" has no matching catalog item,
// so its cost is not included in the total until the catalog has a rate for it.

// Roles allowed to open the accounting page (keep in sync with is_accounting() in supabase/booking-accounting.sql).
export const ACCOUNTING_ROLES = ["GOD", "Operations & Finance", "Admin Manager"];

export const idr = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");

// ---- pricing rules copied from the cost simulator (app/page.jsx: getAutoRuleForItem / computeItemCost) ----
function autoRule(catId, itemName = "", item = null) {
  if (item && item.mode) {
    return { mode: item.mode, capacity: item.capacity ?? 4, threshold: item.threshold ?? 2, surcharge: item.surcharge ?? 50000 };
  }
  const lower = itemName.toLowerCase();
  if (lower.includes("guide")) return { mode: "flat", capacity: 1, threshold: 0, surcharge: 0 };
  if (catId === "boat" || catId === "resto" || catId === "inclusion") return { mode: "pax", capacity: 1, threshold: 0, surcharge: 0 };
  if (catId === "hotel") return { mode: "unit", capacity: 2, threshold: 0, surcharge: 0 };
  if (catId === "car") return { mode: "unit", capacity: 4, threshold: 0, surcharge: 0 };
  if (catId === "dive") {
    if (lower.includes("sharing") || lower.includes("certified") || lower.includes("dive")) return { mode: "pax", capacity: 1, threshold: 0, surcharge: 0 };
    if (/\d\s*place/.test(lower)) return { mode: "tier", capacity: 4, threshold: 4, surcharge: 50000 };
    return { mode: "unit", capacity: 4, threshold: 0, surcharge: 0 };
  }
  return { mode: "flat", capacity: 4, threshold: 2, surcharge: 50000 };
}

// qty is only used by "flat" items. Returns { cost, caption }.
function priceItem(catId, item, pax, qty = 1) {
  const auto = autoRule(catId, item.name, item);
  const mode = item.mode || auto.mode;
  const capacity = item.capacity ?? auto.capacity;
  const threshold = item.threshold ?? auto.threshold;
  const surcharge = item.surcharge ?? auto.surcharge;
  const price = Number(item.price) || 0;
  if (mode === "flat") return { cost: qty * price, caption: `${qty} × ${idr(price)}` };
  if (mode === "pax") return { cost: pax * price, caption: `${pax} pax × ${idr(price)}` };
  if (mode === "unit") {
    const units = Math.ceil(pax / Math.max(1, capacity));
    return { cost: units * price, caption: `${units} unit${units > 1 ? "s" : ""} × ${idr(price)} (${capacity} pax per unit)` };
  }
  if (mode === "tier") {
    const extra = Math.max(0, pax - threshold);
    return { cost: price + extra * surcharge, caption: `${idr(price)} base (${threshold} pax) + ${extra} × ${idr(surcharge)}` };
  }
  return { cost: 0, caption: "" };
}

// ---- hotel areas ----
const TRANSFER_SUFFIX = / transfer$/i;
export const NO_TRANSFER = "No transfer cost";

// Areas that have a "<Area> Transfer" item in the catalog, plus Sanur (next to the harbour) and a "none" choice.
export function transferAreas(catalog) {
  const cat = (catalog || []).find((c) => c.id === "transport");
  const names = (cat?.items || []).map((i) => i.name).filter((n) => TRANSFER_SUFFIX.test(n)).map((n) => n.replace(TRANSFER_SUFFIX, ""));
  return [...names, "Sanur", NO_TRANSFER];
}

// Area guessed from the hotel name when nobody has set it yet. The accounting page lets the team confirm or change it.
const AREA_KEYWORDS = [
  ["nusa dua", "Nusa Dua"], ["tanjung benoa", "Nusa Dua"], ["benoa", "Nusa Dua"], ["merusaka", "Nusa Dua"], ["grand hyatt", "Nusa Dua"],
  ["ayodya", "Nusa Dua"], ["st regis", "Nusa Dua"], ["mulia", "Nusa Dua"], ["paradisus", "Nusa Dua"], ["kayumanis", "Nusa Dua"],
  ["laguna", "Nusa Dua"], ["grand mirage", "Nusa Dua"], ["bali tropic", "Nusa Dua"], ["tijili", "Nusa Dua"],
  ["jimbaran", "Jimbaran"], ["seminyak", "Seminyak"], ["ize ", "Seminyak"], ["viva dash", "Seminyak"], ["fourteen roses", "Seminyak"],
  ["kuta", "Kuta"], ["legian", "Kuta"], ["risata", "Kuta"], ["adi dharma", "Kuta"], ["baruna", "Kuta"], ["hilton garden", "Kuta"],
  ["mamaka", "Kuta"], ["champlung", "Kuta"], ["canggu", "Canggu"], ["ubud", "Ubud"], ["uluwatu", "Uluwatu"], ["denpasar", "Denpasar"],
  ["sanur", "Sanur"], ["pavilion", "Sanur"], ["santrian", "Sanur"],
];

export function guessArea(hotelName) {
  const h = ` ${(hotelName || "").toLowerCase()} `;
  for (const [k, area] of AREA_KEYWORDS) if (h.includes(k)) return area;
  return null;
}

export const hotelKey = (name) => (name || "").toLowerCase().replace(/\s+/g, " ").trim();

// "Risata (1 pax); Adi Dharma Kuta (2 pax)" -> [{ name, key, pax }]. A single hotel without a count takes all pax.
export function hotelSegments(hotel, pax) {
  const parts = (hotel || "").split(";").map((p) => p.trim()).filter(Boolean);
  return parts.map((p) => {
    const m = /^(.*?)\s*\((\d+)\s*pax\)\s*$/i.exec(p);
    const name = (m ? m[1] : p).trim();
    return { name, key: hotelKey(name), pax: m ? Number(m[2]) : pax };
  });
}

// ---- matching booking text to catalog items ----
const findItem = (catalog, catId, test) => {
  const cat = (catalog || []).find((c) => c.id === catId);
  return (cat?.items || []).find((i) => test(i.name.toLowerCase(), i)) || null;
};
const itemsOf = (catalog, catId, test) => {
  const cat = (catalog || []).find((c) => c.id === catId);
  return (cat?.items || []).filter((i) => test(i.name.toLowerCase(), i));
};

const BOAT_VENDORS = [
  ["sanjaya", "Sanjaya"], ["rayfish", "Rayfish"], ["einstein", "Einstein"], ["axestone", "Axestone"], ["arjuna", "Arjuna"],
  ["gangga", "Gangga"], ["glory", "Glory"], ["maruti", "Maruti"], ["eka jaya", "Eka Jaya"], ["golden queen", "Golden Queen"],
];
// Lunch vendor text -> words that appear in the catalog's meal item names.
const LUNCH_KEYS = [
  ["ta restaurant", "ta resto"], ["arjuna", "arjuna lunch"], ["maruti", "maruti lunch"], ["sorent", "sorent"], ["khamara", "khamara"],
  ["funtasea", "funtasea"], ["angle", "angel bilabong"], ["angel", "angel bilabong"], ["amok", "amok"], ["amerta", "amerta"],
  ["aura", "the aura"], ["d'mm", "d'mm"],
];

const cleanVendor = (s) => (s || "").replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();

/**
 * Cost of one booking.
 * @param b       booking row from the database
 * @param catalog the cost simulator catalog (array of { id, title, items: [{ name, price, ... }] })
 * @param areaMap { [hotelKey]: area } confirmed hotel areas
 * @returns { lines, total, perPax, issues }  issues = number of lines marked missing or guess
 */
export function costBooking(b, catalog, areaMap = {}) {
  const pax = Math.max(0, Number(b.pax) || 0);
  const lines = [];
  const add = (category, label, found, opts = {}) => {
    if (!found) {
      lines.push({ category, label, item: null, cost: 0, caption: opts.note || "No matching item in the catalog", status: "missing" });
      return;
    }
    const { cost, caption } = priceItem(found.catId, found.item, opts.pax ?? pax, opts.qty ?? 1);
    lines.push({ category, label, item: found.item.name, cost, caption, status: opts.guess ? "guess" : "ok", note: opts.note });
  };
  const hit = (catId, item) => (item ? { catId, item } : null);

  const pkg = (b.package || "").toLowerCase();
  const incl = (b.inclusions || []).join(" | ").toLowerCase();
  const special = b.special_request || "";

  // 1. Car on Nusa Penida (by tour package)
  let carName = null;
  if (/combination/.test(pkg)) carName = "combination west-east car";
  else if (/west tour|exotic/.test(pkg)) carName = "west car transport";
  else if (/east tour/.test(pkg)) carName = "east car transport";
  if (carName) add("Car Nusa Penida", b.package.length > 40 ? "Island car (from package)" : `Island car (${b.package})`, hit("car", findItem(catalog, "car", (n) => n === carName)));

  // 2. Fast boat
  const boatText = [...(b.boat_vendor || []), b.boat_sanur, b.boat_panida].filter(Boolean).join(" ").toLowerCase();
  if (boatText.trim()) {
    const vendor = BOAT_VENDORS.find(([k]) => boatText.includes(k));
    const isReturn = Boolean(b.boat_sanur && b.boat_panida) || /\d[.:]\d{2}\s*-\s*\d{1,2}[.:]\d{2}/.test(boatText);
    if (!vendor) {
      add("Fast boat", "Fast boat (vendor not recognised)", null, { note: "Boat vendor name not recognised" });
    } else if (vendor[1] === "Eka Jaya") {
      add("Fast boat", "Fast boat Eka Jaya (Gili)", hit("boat", findItem(catalog, "boat", (n) => n.includes("eka jaya"))), { pax });
    } else {
      const want = `${vendor[1].toLowerCase()} ${isReturn ? "return" : "one way"} ticket`;
      const alt = `${vendor[1].toLowerCase()} ${isReturn ? "one way" : "return"} ticket`;
      const found = findItem(catalog, "boat", (n) => n === want) || findItem(catalog, "boat", (n) => n === alt);
      add("Fast boat", `Fast boat ${vendor[1]} (${isReturn ? "return" : "one way"})`, hit("boat", found), {
        note: `No ${vendor[1]} ticket in the catalog`,
        guess: found && found.name.toLowerCase() !== want,
      });
    }
  }

  // 3. Snorkeling
  const wantsSnorkel = /snorkel/.test(pkg) || /private snorkeling/.test(incl) || Boolean(b.snorkeling_vendor);
  if (wantsSnorkel) {
    if (/sharing/.test(pkg) || /sharing snorkeling/.test(incl)) {
      add("Snorkeling", "Sharing snorkeling", hit("dive", findItem(catalog, "dive", (n) => n === "sharing snorkeling")));
    } else {
      const vtext = `${b.snorkeling_vendor || ""} ${incl}`.toLowerCase();
      const vendor = /wonderland/.test(vtext) ? "Wonderland" : /elite/.test(vtext) ? "Elite" : /ocean/.test(vtext) ? "Ocean" : null;
      const m = /(\d)\s*places?/i.exec(b.package || "");
      const places = m ? Number(m[1]) : 4;
      const v = vendor || "Ocean";
      add("Snorkeling", `Private snorkeling ${v} ${places} places`, hit("dive", findItem(catalog, "dive", (n) => n === `${v.toLowerCase()} ${places} place`)), {
        note: `No "${v} ${places} Place" in the catalog`,
        guess: !vendor || !m,
      });
    }
  }

  // 4. Lunch
  const rest = cleanVendor(b.restaurant);
  if (rest) {
    const key = LUNCH_KEYS.find(([k]) => rest.toLowerCase().includes(k));
    const candidates = key ? itemsOf(catalog, "resto", (n) => n.includes(key[1])) : [];
    const menu = /menu\s*(\d+)\s*k/i.exec(special);
    const target = menu ? Number(menu[1]) * 1000 : null;
    const byPrice = target ? candidates.find((i) => Number(i.price) === target) : null;
    const chosen = byPrice || candidates[0] || null;
    add("Lunch", `Lunch at ${rest}`, hit("resto", chosen), {
      note: `No lunch rate for ${rest} in the catalog`,
      guess: chosen && !byPrice && candidates.length > 1,
    });
  }

  // 5. Guide (our guide only; "Guide Agent" means the agent brings its own)
  if (/private guide|guide from abs/.test(incl)) {
    const g = (b.guide || "").trim();
    if (!/^guide agent$/i.test(g)) {
      const count = g ? g.split(",").filter((x) => x.trim()).length : 1;
      add("Guide", g ? `Guide ${g}` : "Guide (not assigned yet)", hit("inclusion", findItem(catalog, "inclusion", (n) => n.startsWith("guide fee day"))), {
        qty: count,
        guess: !g,
        note: "No \"Guide Fee Day\" in the catalog",
      });
    }
  }

  // 6. Per-pax extras listed in the inclusions
  const extras = [
    [/retribution/, "Retribution island", (n) => n.startsWith("retribution fee"), false],
    [/snack box/, "Snack box + mineral water", (n) => n.startsWith("snack box"), false],
    [/whole coconut/, "Whole coconut", (n) => n.startsWith("kelapa whole"), false],
    [/glass coconut/, "Glass coconut", (n) => n.startsWith("kelapa glass"), false],
    [/w[e]?llcome drink|welcome drink/, "Welcome drink", (n) => n.startsWith("welcome drink arjuna 5"), true],
  ];
  for (const [re, label, test, guess] of extras) {
    if (re.test(incl)) add("Extras", label, hit("inclusion", findItem(catalog, "inclusion", test)), { guess, note: `No "${label}" in the catalog` });
  }

  // 7. Bali hotel transfer (by hotel area). Skipped when the agent brings its own transport.
  const ownTransport = /own transport/i.test(b.driver || "");
  const transferIncluded = /hotel return transfer|driver bali|english speaking driver/.test(incl) || Boolean(b.hotel && b.pickup_time);
  if (transferIncluded && !ownTransport && !b.hotel) {
    add("Bali transfer", "Hotel transfer (hotel not entered yet)", null, { note: "Hotel not entered yet, so the transfer cannot be priced" });
  } else if (transferIncluded && !ownTransport) {
    for (const seg of hotelSegments(b.hotel, pax)) {
      const saved = areaMap[seg.key];
      const area = saved || guessArea(seg.name);
      const cars = Math.max(1, Math.ceil(seg.pax / 4));
      if (!area) {
        add("Bali transfer", `Transfer ${seg.name}`, null, { note: `Hotel area not set for "${seg.name}"` });
      } else if (area === NO_TRANSFER || area === "Sanur") {
        lines.push({ category: "Bali transfer", label: `Transfer ${seg.name} (${area})`, item: null, cost: 0, caption: "No transfer cost for this area", status: saved ? "ok" : "guess" });
      } else {
        add("Bali transfer", `Transfer ${seg.name} (${area})`, hit("transport", findItem(catalog, "transport", (n) => n === `${area.toLowerCase()} transfer`)), {
          qty: cars,
          guess: !saved,
          note: `No "${area} Transfer" in the catalog`,
        });
      }
    }
  }

  const total = lines.reduce((s, l) => s + l.cost, 0);
  return {
    lines,
    total,
    perPax: pax > 0 ? total / pax : 0,
    issues: lines.filter((l) => l.status !== "ok").length,
    missing: lines.filter((l) => l.status === "missing").length,
  };
}
