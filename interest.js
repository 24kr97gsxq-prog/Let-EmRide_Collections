// ---------------------------------------------------------------------------
// SIMPLE INTEREST, DAILY ACCRUAL
//
// This is the way a Texas Chapter 348 motor vehicle retail installment
// contract actually works, and it is the whole reason this app exists:
//
//   per diem        = principal x APR / 365
//   accrued         = per diem x days since the account's "paid to" date
//   EARNED          = interest a payment actually paid  -> revenue you booked
//   ACCRUED UNPAID  = interest sitting on the account   -> charged, not collected
//   payoff          = principal + accrued unpaid + fee balance
//
// A payment does NOT reduce principal until it has covered the interest that
// accrued since the last payment. On a bi-weekly book that is the difference
// between an account that amortizes and one that never moves.
// ---------------------------------------------------------------------------

import { dayDiff, periodDays } from "./dates.js";
import { round2 } from "./format.js";

export const DAYS_IN_YEAR = 365;

/**
 * Current state of one account as of a given date.
 * @param {object} a  account record
 * @param {string} asOf  "YYYY-MM-DD"
 */
export function calc(a, asOf) {
  const principal = Math.max(0, Number(a.principal) || 0);
  const apr = Number(a.apr) || 0;
  const perDiem = round2((principal * (apr / 100)) / DAYS_IN_YEAR);

  // Interest runs from the date interest is paid through, not from the due date.
  const paidTo = a.paidToDate || a.lastPayDate || asOf;
  const days = Math.max(0, dayDiff(paidTo, asOf));
  const newAccrual = round2(perDiem * days);
  const accruedUnpaid = round2((Number(a.accruedUnpaid) || 0) + newAccrual);

  const fees = round2(Number(a.feeBalance) || 0);
  const payoff = round2(principal + accruedUnpaid + fees);

  const dpd = Math.max(0, dayDiff(a.nextDueDate, asOf));
  const per = periodDays(a.frequency || "biweekly");
  const periodsBehind = dpd > 0 ? Math.floor(dpd / per) + 1 : 0;
  const pastDueAmt = round2(Math.min(periodsBehind, 12) * (Number(a.payment) || 0) + fees);

  return {
    principal, apr, perDiem, days, newAccrual, accruedUnpaid,
    fees, payoff, dpd, periodsBehind, pastDueAmt, paidTo,
  };
}

/**
 * How a payment splits. Order comes from the contract — set it in Setup.
 * @param {"interest"|"fees"} order
 */
export function splitPayment(a, amount, payDate, order = "interest") {
  const c = calc(a, payDate);
  let left = round2(Math.max(0, Number(amount) || 0));
  let toFees = 0;
  let toInt = 0;

  const takeFees = () => { toFees = Math.min(left, c.fees); left = round2(left - toFees); };
  const takeInt = () => { toInt = Math.min(left, c.accruedUnpaid); left = round2(left - toInt); };

  if (order === "fees") { takeFees(); takeInt(); } else { takeInt(); takeFees(); }

  const toPrin = round2(Math.max(0, left));

  return {
    ...c,
    amount: round2(Number(amount) || 0),
    toFees: round2(toFees),
    toInt: round2(toInt),
    toPrin,
    daysOfInterestBought: c.perDiem > 0 ? toInt / c.perDiem : 0,
    newPrincipal: round2(c.principal - toPrin),
    leftoverInterest: round2(c.accruedUnpaid - toInt),
    remainingFees: round2(c.fees - toFees),
    // The flag that matters: money came in and the balance did not move.
    bleeding: toPrin <= 0 && Number(amount) > 0,
  };
}

/** Smallest payment that puts a dollar against principal today. */
export function payoffInterestOnly(a, asOf) {
  const c = calc(a, asOf);
  return round2(c.accruedUnpaid + c.fees);
}

/** Extra interest a customer pays by being N days late. Say this on the phone. */
export function costOfLateness(a, asOf, daysLate) {
  const c = calc(a, asOf);
  return round2(c.perDiem * daysLate);
}

// ------------------------------- aging -------------------------------------
export const BUCKETS = [
  { key: "current", label: "Current",    min: -9999, max: 0,    color: "#3FA96B" },
  { key: "b1",      label: "1–9 days",   min: 1,     max: 9,    color: "#F5C242" },
  { key: "b10",     label: "10–19 days", min: 10,    max: 19,   color: "#E8883A" },
  { key: "b20",     label: "20–29 days", min: 20,    max: 29,   color: "#D9603C" },
  { key: "skip",    label: "30+ SKIP",   min: 30,    max: 99999, color: "#E1483C" },
];

export const bucketOf = (dpd) => BUCKETS.find((b) => dpd >= b.min && dpd <= b.max) || BUCKETS[0];

export const CLOSED = ["paidoff", "repo"];
export const isOpen = (a) => !CLOSED.includes(a.status);

/**
 * Call board ordering. Broken promises first — a broken promise is a person
 * who talked to you and then didn't pay, which is the most workable account
 * on the board. Accounts resting on a future promise sink to the bottom.
 */
export function priority(a, asOf) {
  const c = calc(a, asOf);
  const open = (a.promises || []).filter((p) => p.status === "open");
  const broken = open.some((p) => dayDiff(p.date, asOf) > 0);
  const dueToday = open.some((p) => p.date === asOf);
  const future = open.some((p) => dayDiff(asOf, p.date) > 0);

  let score;
  if (broken) score = 1000 + c.dpd;
  else if (dueToday) score = 900;
  else if (future) score = 100 - c.dpd;
  else score = 300 + c.dpd * 2;
  if (c.dpd === 0) score = Math.min(score, 50);

  return { score, c, broken, dueToday, future };
}

/** Portfolio totals — the numbers to argue about at month end. */
export function bookTotals(accounts, asOf) {
  let principal = 0, accrued = 0, earned = 0, fees = 0, perDiem = 0, past = 0, live = 0;
  const byBucket = Object.fromEntries(BUCKETS.map((b) => [b.key, 0]));

  accounts.forEach((a) => {
    if (!isOpen(a)) return;
    const c = calc(a, asOf);
    live++;
    principal += c.principal;
    accrued += c.accruedUnpaid;
    fees += c.fees;
    perDiem += c.perDiem;
    earned += Number(a.earnedToDate) || 0;
    byBucket[bucketOf(c.dpd).key]++;
    if (c.dpd > 0) past++;
  });

  return {
    principal: round2(principal), accrued: round2(accrued), earned: round2(earned),
    fees: round2(fees), perDiem: round2(perDiem), past, live, byBucket,
    delinquencyRate: live ? Math.round((past / live) * 100) : 0,
  };
}
