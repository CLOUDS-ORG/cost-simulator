// Reads a contract-rate template (CSV or Excel rows) into rate rows for the contract_rates table.
// Pure functions only, so they can be tested without a browser.

export const TEMPLATE_HEADERS = ["Agent", "Package", "From pax", "To pax", "Rate per pax", "Valid from", "Valid to", "Source", "Note"];

// Header names that mean each field (compared without spaces, dots and capitals).
const HEADER_KEYS = {
  agent: ["agent", "agen", "vendor"],
  package: ["package", "tourpackage", "tour", "paket"],
  pax_min: ["frompax", "paxmin", "minpax", "paxfrom", "dari", "min"],
  pax_max: ["topax", "paxmax", "maxpax", "paxto", "sampai", "max"],
  rate_per_pax: ["rateperpax", "rate", "ratepax", "nett", "nettrate", "price", "harga", "ratepaxrp"],
  valid_from: ["validfrom", "from", "start", "startdate", "berlakudari", "berlaku"],
  valid_to: ["validto", "to", "end", "enddate", "berlakusampai", "until"],
  source: ["source", "sumber", "contract"],
  note: ["note", "notes", "catatan", "keterangan"],
};

const squash = (t) => String(t ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const clean = (t) => String(t ?? "").replace(/\s+/g, " ").trim();

// CSV text -> rows of cells. Handles quotes and picks the delimiter (comma, semicolon or tab) from the first line.
export function parseCsv(text) {
  const src = String(text || "").replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] || "";
  const count = (c) => firstLine.split(c).length - 1;
  const delim = count(";") > count(",") && count(";") >= count("\t") ? ";" : count("\t") > count(",") ? "\t" : ",";
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      rows.push(row); row = [];
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, mei: 5, jun: 6, jul: 7, aug: 8, agu: 8, agt: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12, des: 12 };
const pad = (n) => String(n).padStart(2, "0");
const validDay = (y, m, d) => { const t = new Date(Date.UTC(y, m - 1, d)); return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d; };

// A cell -> "YYYY-MM-DD", "" (empty) or null (not a date). Accepts Date objects (Excel), 2026-07-01, 01/07/2026, 1 Jul 2026.
export function toIsoDate(v) {
  if (v === null || v === undefined || String(v).trim() === "") return "";
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    return `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`;
  }
  if (typeof v === "number") {
    if (v > 20000 && v < 80000) { // Excel serial number
      const d = new Date(Math.round((v - 25569) * 86400000));
      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    }
    return null;
  }
  const s = clean(v);
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return validDay(+m[1], +m[2], +m[3]) ? `${m[1]}-${pad(+m[2])}-${pad(+m[3])}` : null;
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/); // day first, as used in Indonesia
  if (m) return validDay(+m[3], +m[2], +m[1]) ? `${m[3]}-${pad(+m[2])}-${pad(+m[1])}` : null;
  m = s.match(/^(\d{1,2})[ -]([A-Za-z]{3})[a-z]*[ ,-]*(\d{4})$/);
  if (m && MONTHS[m[2].toLowerCase()]) {
    const mo = MONTHS[m[2].toLowerCase()];
    return validDay(+m[3], mo, +m[1]) ? `${m[3]}-${pad(mo)}-${pad(+m[1])}` : null;
  }
  return null;
}

// A cell -> number. Accepts 1082400, "1.082.400", "1,082,400", "Rp 1.082.400". null when it is not a number.
export function toNumber(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = clean(v).replace(/rp\.?/gi, "").replace(/\s/g, "");
  if (!s) return null;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
  else s = s.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

const norm = (t) => clean(t).toLowerCase();
export const rateKey = (r) => [norm(r.agent), norm(r.package), r.pax_min, r.pax_max, r.valid_from].join("|");

// Matrix (first row = headers) -> { rows, fatal }.
// options: agent (the folder's agent; used when the Agent column is empty or missing), packages (known package names),
// existing (rows already in contract_rates).
export function readRateRows(matrix, { agent = "", packages = [], existing = [] } = {}) {
  const lines = (matrix || []).map((r) => (r || []).map((c) => (c instanceof Date ? c : typeof c === "string" ? c : c ?? "")));
  const headerAt = lines.findIndex((r) => r.some((c) => squash(c) === "rateperpax" || squash(c) === "rate" || squash(c) === "ratepax"));
  if (headerAt < 0) return { rows: [], fatal: 'Header row not found. The first row needs the column names, for example "Package", "From pax", "To pax", "Rate per pax", "Valid from". Download the template.' };
  const col = {};
  lines[headerAt].forEach((h, i) => {
    const k = squash(h);
    for (const [field, names] of Object.entries(HEADER_KEYS)) if (!(field in col) && names.includes(k)) col[field] = i;
  });
  const missing = ["package", "pax_min", "rate_per_pax", "valid_from"].filter((f) => !(f in col));
  if (missing.length) {
    const label = { package: "Package", pax_min: "From pax", rate_per_pax: "Rate per pax", valid_from: "Valid from" };
    return { rows: [], fatal: `Column missing: ${missing.map((m) => label[m]).join(", ")}. Download the template.` };
  }
  if (!("agent" in col) && !agent) return { rows: [], fatal: "The file has no Agent column." };

  const known = new Map([...packages, ...existing.map((e) => e.package)].map((p) => [norm(p), clean(p)]));
  const existingByKey = new Map(existing.map((e) => [rateKey(e), e]));
  const rows = [];

  lines.slice(headerAt + 1).forEach((cells, idx) => {
    if (cells.every((c) => String(c ?? "").trim() === "")) return;
    const line = headerAt + idx + 2;
    const get = (f) => (f in col ? cells[col[f]] : "");
    const errors = [], warnings = [];

    let ag = clean(get("agent"));
    if (!ag) ag = agent;
    else if (agent && norm(ag) !== norm(agent)) errors.push(`Agent "${ag}" is not "${agent}" (this folder)`);
    if (agent && norm(ag) === norm(agent)) ag = agent; // keep the folder's spelling

    let pkg = clean(get("package"));
    if (!pkg) errors.push("Package is empty");
    else if (known.has(norm(pkg))) pkg = known.get(norm(pkg));
    else warnings.push(`Package "${pkg}" is not in the package list, so bookings will not match it`);

    const min = toNumber(get("pax_min"));
    const maxRaw = get("pax_max");
    const max = String(maxRaw ?? "").trim() === "" ? 99 : toNumber(maxRaw);
    if (min === null || !Number.isInteger(min) || min < 1) errors.push("From pax must be 1 or more");
    if (max === null || !Number.isInteger(max) || (min !== null && max < min)) errors.push("To pax must be a number not below From pax");

    const rate = toNumber(get("rate_per_pax"));
    if (rate === null || rate <= 0) errors.push("Rate per pax is not a number");

    const vf = toIsoDate(get("valid_from"));
    if (!vf) errors.push(vf === "" ? "Valid from is empty" : "Valid from is not a date");
    const vtRaw = toIsoDate(get("valid_to"));
    if (vtRaw === null) errors.push("Valid to is not a date");
    if (vf && vtRaw && vtRaw < vf) errors.push("Valid to is before Valid from");

    const row = {
      line, agent: ag, package: pkg, pax_min: min, pax_max: max, rate_per_pax: rate,
      valid_from: vf || null, valid_to: vtRaw || null, source: clean(get("source")), note: clean(get("note")),
      errors, warnings, action: "new", existingId: null,
    };
    if (!errors.length) {
      const hit = existingByKey.get(rateKey(row));
      if (hit) {
        row.existingId = hit.id;
        const same = Number(hit.rate_per_pax) === rate && (hit.valid_to || null) === row.valid_to && clean(hit.source) === row.source && clean(hit.note) === row.note;
        row.action = same ? "same" : "update";
      }
    }
    rows.push(row);
  });

  // Rates that would answer the same booking twice: inside the file, or against rates that stay as they are.
  const staying = existing.filter((e) => !rows.some((r) => r.existingId === e.id));
  const all = [...staying.map((e) => ({ ...e, fromFile: false })), ...rows.filter((r) => !r.errors.length).map((r) => ({ ...r, fromFile: true }))];
  const far = "9999-12-31";
  for (const r of rows) {
    if (r.errors.length) continue;
    const clash = all.find((o) => o !== r && !(o.fromFile && o.line === r.line) && norm(o.agent) === norm(r.agent) && norm(o.package) === norm(r.package) &&
      o.valid_from <= (r.valid_to || far) && r.valid_from <= (o.valid_to || far) && o.pax_min <= r.pax_max && r.pax_min <= o.pax_max);
    if (clash) r.warnings.push(clash.fromFile ? `Overlaps line ${clash.line} of this file` : "Overlaps a rate already saved (same dates and pax)");
  }
  return { rows, fatal: "" };
}

const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// CSV text of a template, optionally filled with rate rows of an agent (to edit and upload again).
export function templateCsv(agent, rates) {
  const body = rates && rates.length
    ? rates.map((r) => [r.agent, r.package, r.pax_min, r.pax_max, Math.round(Number(r.rate_per_pax)), r.valid_from, r.valid_to || "", r.source, r.note])
    : [[agent || "PEGASUS", "West Tour", 1, 3, 1082400, "2026-06-15", "", "CR 000 example: delete this row", ""],
       [agent || "PEGASUS", "West Tour", 4, 6, 891300, "2026-06-15", "", "", ""],
       [agent || "PEGASUS", "West Tour", 7, 99, 944760, "2026-06-15", "", "", ""]];
  return "﻿" + [TEMPLATE_HEADERS, ...body].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

// Folder name for an agent in file storage (letters, digits, dash).
export const folderKey = (agent) => clean(agent).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "agent";
