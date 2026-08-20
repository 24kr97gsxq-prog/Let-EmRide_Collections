// The DMS stays the book of record. This desk reads a CSV export of the aging
// report every morning and writes one back at the end of the day.

import { uid } from "./format.js";

/** Handles quoted fields, commas inside quotes, and doubled quotes. */
export function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

export const IMPORT_COLUMNS = [
  "acct", "first", "last", "phone", "lang", "collector", "vehicle", "vin4",
  "apr", "principal", "payment", "fees", "nextdue", "lastpay", "paidto",
  "accrued", "earned", "gps",
];

/**
 * @returns {{accounts: object[], errors: string[]}}
 */
export function parseAging(csv, { fallbackDate, defaultCollector = "Marcela" } = {}) {
  const errors = [];
  const lines = String(csv).trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { accounts: [], errors: ["Paste a header row plus at least one account."] };

  const head = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_]/g, ""));
  const at = (name) => head.indexOf(name);
  if (at("first") < 0 && at("name") < 0) {
    return { accounts: [], errors: ['Header needs a "first" column (or a "name" column).'] };
  }

  const accounts = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const g = (n, d = "") => (at(n) >= 0 && cells[at(n)] !== undefined && cells[at(n)] !== "" ? cells[at(n)] : d);
    const num = (n, d = 0) => {
      const v = Number(String(g(n, d)).replace(/[$,]/g, ""));
      return Number.isFinite(v) ? v : d;
    };

    const whole = g("name");
    const first = g("first") || whole.split(" ")[0];
    if (!first) { errors.push(`Line ${i + 1}: no name, skipped.`); continue; }

    const lastPay = g("lastpay", fallbackDate);
    accounts.push({
      id: uid(),
      acct: g("acct", String(1000 + i)),
      first,
      last: g("last") || whole.split(" ").slice(1).join(" "),
      phone: g("phone"),
      lang: /^s|^e?s/i.test(g("lang", "en")) && !/^en/i.test(g("lang", "en")) ? "es" : "en",
      collector: g("collector", defaultCollector),
      vehicle: g("vehicle"),
      vin4: g("vin4"),
      frequency: "biweekly",
      apr: num("apr", 21.9),
      principal: num("principal", 0),
      payment: num("payment", 0),
      feeBalance: num("fees", 0),
      nextDueDate: g("nextdue", fallbackDate),
      lastPayDate: lastPay,
      paidToDate: g("paidto", lastPay),
      accruedUnpaid: num("accrued", 0),
      earnedToDate: num("earned", 0),
      gps: !/^n/i.test(g("gps", "y")),
      starter: false,
      status: "active",
      nextContact: fallbackDate,
      promises: [],
      log: [],
      rtc: null,
    });
  }

  if (!accounts.length) errors.push("No rows read. Check the header names against the list above.");
  return { accounts, errors };
}

const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** End-of-day export: aging, promises, and the accrued/earned split per account. */
export function buildExport(accounts, asOf, calc) {
  const head = [
    "acct", "first", "last", "collector", "dpd", "principal", "per_diem",
    "accrued_unpaid", "earned_to_date", "fees", "payoff", "next_due",
    "next_contact", "open_promise_amt", "open_promise_date", "notice_mailed",
    "cure_date", "status",
  ];
  const rows = accounts.map((a) => {
    const c = calc(a, asOf);
    const p = (a.promises || []).find((x) => x.status === "open");
    return [
      a.acct, a.first, a.last, a.collector, c.dpd,
      c.principal.toFixed(2), c.perDiem.toFixed(2), c.accruedUnpaid.toFixed(2),
      (Number(a.earnedToDate) || 0).toFixed(2), c.fees.toFixed(2), c.payoff.toFixed(2),
      a.nextDueDate, a.nextContact || "",
      p ? p.amount : "", p ? p.date : "",
      a.rtc?.sent || "", a.rtc?.cure || "", a.status,
    ].map(esc).join(",");
  });
  return [head.join(","), ...rows].join("\n");
}
