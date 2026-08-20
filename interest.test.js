// The money math is the part that can quietly be wrong for months, so it's
// the part that gets tested. Run: npm test

import { describe, it, expect } from "vitest";
import { calc, splitPayment, bucketOf, payoffInterestOnly, bookTotals } from "./interest.js";
import { addDays } from "./dates.js";

const base = "2026-06-01";

const acct = (o = {}) => ({
  id: "t1", first: "Test", last: "Account", collector: "Marcela", lang: "en",
  frequency: "biweekly", apr: 21.9, principal: 10000, payment: 300, feeBalance: 0,
  nextDueDate: base, paidToDate: base, lastPayDate: base, accruedUnpaid: 0,
  earnedToDate: 0, status: "active", promises: [], log: [], ...o,
});

describe("per diem", () => {
  it("is principal x APR / 365", () => {
    const c = calc(acct(), base);
    expect(c.perDiem).toBeCloseTo(6.0, 2); // 10000 * .219 / 365 = 6.0
  });

  it("falls as principal falls", () => {
    const a = calc(acct({ principal: 5000 }), base).perDiem;
    const b = calc(acct({ principal: 10000 }), base).perDiem;
    expect(a).toBeCloseTo(b / 2, 2);
  });
});

describe("accrual", () => {
  it("runs from the paid-to date, not the due date", () => {
    const c = calc(acct(), addDays(base, 14));
    expect(c.days).toBe(14);
    expect(c.accruedUnpaid).toBeCloseTo(84.0, 2); // 14 x 6.00
  });

  it("adds to interest already carried on the account", () => {
    const c = calc(acct({ accruedUnpaid: 50 }), addDays(base, 10));
    expect(c.accruedUnpaid).toBeCloseTo(110.0, 2);
  });

  it("never runs backwards if the as-of date is before the last payment", () => {
    const c = calc(acct(), addDays(base, -5));
    expect(c.days).toBe(0);
    expect(c.accruedUnpaid).toBe(0);
  });
});

describe("payment waterfall", () => {
  it("pays accrued interest before principal", () => {
    const s = splitPayment(acct(), 300, addDays(base, 14), "interest");
    expect(s.toInt).toBeCloseTo(84.0, 2);
    expect(s.toPrin).toBeCloseTo(216.0, 2);
    expect(s.newPrincipal).toBeCloseTo(9784.0, 2);
  });

  it("honors a fees-first contract", () => {
    const s = splitPayment(acct({ feeBalance: 25 }), 300, addDays(base, 14), "fees");
    expect(s.toFees).toBe(25);
    expect(s.toInt).toBeCloseTo(84.0, 2);
    expect(s.toPrin).toBeCloseTo(191.0, 2);
  });

  it("flags a payment that never reaches principal", () => {
    // 60 days late on a 10k contract: ~$360 of interest against a $300 payment
    const s = splitPayment(acct(), 300, addDays(base, 60), "interest");
    expect(s.toPrin).toBe(0);
    expect(s.bleeding).toBe(true);
    expect(s.leftoverInterest).toBeGreaterThan(0);
  });

  it("reports how many days of interest a payment buys", () => {
    const s = splitPayment(acct(), 300, addDays(base, 14), "interest");
    expect(s.daysOfInterestBought).toBeCloseTo(14, 1);
  });

  it("never gives back more than was paid", () => {
    const s = splitPayment(acct({ feeBalance: 25 }), 100, addDays(base, 14), "interest");
    expect(s.toFees + s.toInt + s.toPrin).toBeCloseTo(100, 2);
  });
});

describe("payoff", () => {
  it("is principal plus accrued unpaid plus fees", () => {
    const c = calc(acct({ feeBalance: 25 }), addDays(base, 14));
    expect(c.payoff).toBeCloseTo(10000 + 84 + 25, 2);
  });

  it("knows the smallest payment that touches principal", () => {
    const a = acct({ feeBalance: 25 });
    const floor = payoffInterestOnly(a, addDays(base, 14));
    expect(floor).toBeCloseTo(109.0, 2);
    expect(splitPayment(a, floor + 1, addDays(base, 14), "interest").toPrin).toBeGreaterThan(0);
  });
});

describe("aging", () => {
  it("puts 30+ days in the skip bucket", () => {
    expect(bucketOf(0).key).toBe("current");
    expect(bucketOf(9).key).toBe("b1");
    expect(bucketOf(19).key).toBe("b10");
    expect(bucketOf(29).key).toBe("b20");
    expect(bucketOf(30).key).toBe("skip");
  });

  it("counts bi-weekly periods behind", () => {
    expect(calc(acct(), addDays(base, 15)).periodsBehind).toBe(2);
  });
});

describe("book totals", () => {
  it("separates accrued from earned", () => {
    const b = bookTotals([acct({ earnedToDate: 500 }), acct({ id: "t2", earnedToDate: 250 })], addDays(base, 10));
    expect(b.earned).toBeCloseTo(750, 2);
    expect(b.accrued).toBeCloseTo(120, 2); // 2 accounts x 10 days x 6.00
    expect(b.live).toBe(2);
  });

  it("leaves repossessed accounts out of the live book", () => {
    const b = bookTotals([acct(), acct({ id: "t2", status: "repo" })], base);
    expect(b.live).toBe(1);
  });
});
