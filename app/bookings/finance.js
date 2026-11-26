// Sale price of a booking: the amount entered by accounting, otherwise the price of the Cost simulator quote it came from
// (shared equally when one quote has several bookings). null = not known yet.
export function financeMaps(bookings, financeRows, quotes) {
  const financeMap = Object.fromEntries((financeRows || []).map((r) => [r.booking_id, Number(r.sale_price) || 0]));
  const quoteMap = Object.fromEntries((quotes || []).map((q) => [q.id, q]));
  const perQuote = {};
  for (const b of bookings) if (b.quote_id && b.status !== "Cancelled") perQuote[b.quote_id] = (perQuote[b.quote_id] || 0) + 1;
  return { financeMap, quoteMap, perQuote };
}

export function salePriceFor(b, { financeMap, quoteMap, perQuote }) {
  if (financeMap[b.id] !== undefined) return { price: financeMap[b.id], source: "entered" };
  const q = b.quote_id ? quoteMap[b.quote_id] : null;
  if (q && Number(q.calculatedPrice) > 0) return { price: Number(q.calculatedPrice) / (perQuote[b.quote_id] || 1), source: "quote" };
  return { price: null, source: null };
}
