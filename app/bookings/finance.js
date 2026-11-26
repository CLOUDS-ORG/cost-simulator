// Sale price of a booking: the amount entered by accounting, otherwise the price of the Cost simulator quote it came from
// (shared equally when one quote has several bookings), otherwise the agent's contract rate (CR, master data in the
// contract_rates table) x pax. null = not known yet.
export function financeMaps(bookings, financeRows, quotes, rates) {
  const financeMap = Object.fromEntries((financeRows || []).map((r) => [r.booking_id, Number(r.sale_price) || 0]));
  const quoteMap = Object.fromEntries((quotes || []).map((q) => [q.id, q]));
  const perQuote = {};
  for (const b of bookings) if (b.quote_id && b.status !== "Cancelled") perQuote[b.quote_id] = (perQuote[b.quote_id] || 0) + 1;
  return { financeMap, quoteMap, perQuote, rates: rates || [] };
}

const norm = (t) => String(t || "").trim().toLowerCase().replace(/\s+/g, " ");

// The contract rate row that fits a booking: same agent and package, tour date inside the validity dates, pax inside the range.
// Returns { rate, perPax, total, row } or null when the agent has no CR line for it.
export function contractRateFor(b, rates) {
  if (!rates || !rates.length) return null;
  const agent = norm(b.agent);
  const pkg = norm(b.package);
  const pax = Number(b.pax) || 0;
  const day = b.activity_date;
  if (!agent || !pkg || pax < 1 || !day) return null;
  const row = rates.find(
    (r) =>
      norm(r.agent) === agent &&
      norm(r.package) === pkg &&
      r.valid_from <= day &&
      (!r.valid_to || day <= r.valid_to) &&
      Number(r.pax_min) <= pax &&
      pax <= Number(r.pax_max),
  );
  if (!row) return null;
  const perPax = Number(row.rate_per_pax) || 0;
  return { perPax, total: perPax * pax, row };
}

// Compare an entered price with the CR: "below" / "above" (more than Rp1,000 per pax away) / "ok" / null (no CR line).
export function contractCheck(b, price, rates) {
  const cr = contractRateFor(b, rates);
  if (!cr || price === null || price === undefined) return null;
  const pax = Number(b.pax) || 1;
  const diffPerPax = (price - cr.total) / pax;
  const state = diffPerPax < -1000 ? "below" : diffPerPax > 1000 ? "above" : "ok";
  return { ...cr, diff: price - cr.total, state };
}

export function salePriceFor(b, { financeMap, quoteMap, perQuote, rates }) {
  if (financeMap[b.id] !== undefined) return { price: financeMap[b.id], source: "entered" };
  const q = b.quote_id ? quoteMap[b.quote_id] : null;
  if (q && Number(q.calculatedPrice) > 0) return { price: Number(q.calculatedPrice) / (perQuote[b.quote_id] || 1), source: "quote" };
  const cr = contractRateFor(b, rates);
  if (cr && cr.total > 0) return { price: cr.total, source: "contract" };
  return { price: null, source: null };
}
