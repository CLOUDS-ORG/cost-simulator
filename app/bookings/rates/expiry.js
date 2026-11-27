// Expiry check for contract rates. Pure functions, so they can be tested without a browser.
//
// A rate is only "expiring" when nothing replaces it: rates are grouped by agent + package, and a group
// counts as ending on the LAST valid_to of its rows. A row with no valid_to (open ended) keeps the whole
// group valid, so an old rate that a newer one replaces never raises a warning.

export const WARN_MONTHS = 3;

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

export function todayIso(now = new Date()) {
  return iso(now);
}

// ISO date `months` months after `from` (a day that does not exist, such as 31 Nov, moves to the month end).
export function addMonths(from, months) {
  const d = parse(from);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return iso(d);
}

export function daysBetween(fromIso, toIso) {
  return Math.round((parse(toIso) - parse(fromIso)) / 86400000);
}

// One entry per agent + package whose rates end soon or have ended:
// { agent, package, end, days, state: "expired" | "expiring" }   (days is negative when expired)
export function expiryGroups(rows, today = todayIso(), months = WARN_MONTHS) {
  const limit = addMonths(today, months);
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.agent}\u0000${r.package}`;
    const g = groups.get(key) || { agent: r.agent, package: r.package, end: "", open: false };
    if (!r.valid_to) g.open = true;
    else if (r.valid_to > g.end) g.end = r.valid_to;
    groups.set(key, g);
  }
  const out = [];
  for (const g of groups.values()) {
    if (g.open || !g.end) continue;
    if (g.end < today) out.push({ agent: g.agent, package: g.package, end: g.end, days: daysBetween(today, g.end), state: "expired" });
    else if (g.end <= limit) out.push({ agent: g.agent, package: g.package, end: g.end, days: daysBetween(today, g.end), state: "expiring" });
  }
  return out.sort((a, b) => a.end.localeCompare(b.end) || a.agent.localeCompare(b.agent));
}

// Summary per agent: { [agent]: { expired: n, expiring: n, firstEnd, days, state } } for agents with a problem.
export function expiryByAgent(rows, today = todayIso(), months = WARN_MONTHS) {
  const out = {};
  for (const g of expiryGroups(rows, today, months)) {
    const a = out[g.agent] || (out[g.agent] = { expired: 0, expiring: 0, firstEnd: g.end, days: g.days, state: "expiring" });
    if (g.state === "expired") a.expired++; else a.expiring++;
    if (g.end < a.firstEnd) { a.firstEnd = g.end; a.days = g.days; }
    a.state = a.expired ? "expired" : "expiring";
  }
  return out;
}

// Whether one row sits in a group that is ending or ended (to mark its Valid-to cell).
export function rowExpiry(row, groups) {
  if (!row.valid_to) return null;
  const g = groups.find((x) => x.agent === row.agent && x.package === row.package && x.end === row.valid_to);
  return g ? g.state : null;
}

export function describeDays(days) {
  if (days < 0) return `ended ${-days} day${days === -1 ? "" : "s"} ago`;
  if (days === 0) return "ends today";
  return `ends in ${days} day${days === 1 ? "" : "s"}`;
}
