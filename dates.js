// Everything in this app stores dates as plain "YYYY-MM-DD" strings in the
// dealership's local time. No time zones, no Date objects in storage — a
// payment posted on the 3rd is the 3rd no matter what device it's read on.

export const pad = (n) => String(n).padStart(2, "0");

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = () => toISO(new Date());

export function parseISO(s) {
  if (!s) return null;
  const [y, m, d] = String(s).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function addDays(iso, n) {
  const d = parseISO(iso);
  if (!d) return iso;
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Whole days from a to b. Negative if b is before a. */
export function dayDiff(a, b) {
  const A = parseISO(a);
  const B = parseISO(b);
  if (!A || !B) return 0;
  return Math.round((B - A) / 86400000);
}

export function fmtDate(iso) {
  const d = parseISO(iso);
  if (!d) return "—";
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${String(d.getFullYear()).slice(2)}`;
}

/** Bi-weekly is the house schedule. Everything else is here if a contract needs it. */
export const PERIOD_DAYS = { weekly: 7, biweekly: 14, semimonthly: 15, monthly: 30 };
export const periodDays = (freq) => PERIOD_DAYS[freq] || PERIOD_DAYS.biweekly;
