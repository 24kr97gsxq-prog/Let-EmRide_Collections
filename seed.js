// Sample book so a new install has something on the board. Fictional people,
// Dallas-area numbers that don't dial anywhere. Replace it with a real DMS
// import from the Setup screen on day one.

import { today, addDays } from "./dates.js";
import { uid } from "./format.js";

export const defaultSettings = {
  lot: "214-555-0100",
  collectors: ["Marcela", "Yvette"],
  me: "Marcela",
  waterfall: "interest", // "interest" | "fees" — match the retail installment contract
  rtcDay: 1,             // notice goes certified on day 1
  cureDays: 20,          // confirm with counsel, then set it here
  lateFee: 25,
  graceDays: 5,
  skipDay: 30,           // 30 days = skip, GPS locate, recovery review
  certCost: 1.0,
  frequency: "biweekly",
};

export function seedAccounts(base = today()) {
  const d = (n) => addDays(base, n);
  const mk = (o) => ({
    frequency: "biweekly", accruedUnpaid: 0, starter: false, status: "active",
    promises: [], log: [], rtc: null, nextContact: base, id: uid(), ...o,
  });

  return [
    mk({ acct: "1042", first: "Jorge", last: "Ramirez", lang: "es", collector: "Marcela",
      phone: "214-555-0142", vehicle: "2015 Chevy Malibu", vin4: "8841",
      apr: 21.9, principal: 7420.55, payment: 265, feeBalance: 25,
      nextDueDate: d(-12), paidToDate: d(-26), lastPayDate: d(-26),
      earnedToDate: 1840.22, gps: true, starter: true }),

    mk({ acct: "1088", first: "Ashley", last: "Turner", lang: "en", collector: "Marcela",
      phone: "469-555-0119", vehicle: "2017 Nissan Altima", vin4: "2210",
      apr: 20.5, principal: 9110.0, payment: 310, feeBalance: 0,
      nextDueDate: d(-3), paidToDate: d(-17), lastPayDate: d(-17),
      earnedToDate: 902.1, gps: true }),

    mk({ acct: "0967", first: "Maria", last: "Delgado", lang: "es", collector: "Yvette",
      phone: "972-555-0188", vehicle: "2014 Ford Escape", vin4: "5573",
      apr: 22.9, principal: 5240.3, payment: 240, feeBalance: 50,
      nextDueDate: d(-34), paidToDate: d(-48), lastPayDate: d(-48),
      earnedToDate: 2610.75, gps: true, starter: true, status: "skip",
      rtc: { sent: d(-33), tracking: "9414 8118 9956 1234 5678 90", cure: d(-13), cost: 1.0 } }),

    mk({ acct: "1120", first: "Devon", last: "Hayes", lang: "en", collector: "Yvette",
      phone: "214-555-0173", vehicle: "2016 Dodge Charger", vin4: "9032",
      apr: 21.9, principal: 11380.9, payment: 340, feeBalance: 25,
      nextDueDate: d(-7), paidToDate: d(-21), lastPayDate: d(-21),
      earnedToDate: 1120.4, gps: true, starter: true }),

    mk({ acct: "1011", first: "Brenda", last: "Nunez", lang: "es", collector: "Marcela",
      phone: "817-555-0155", vehicle: "2013 Toyota Corolla", vin4: "6614",
      apr: 23.9, principal: 3980.15, payment: 210, feeBalance: 0,
      nextDueDate: d(2), paidToDate: d(-12), lastPayDate: d(-12),
      earnedToDate: 3105.6, gps: true, nextContact: d(2) }),

    mk({ acct: "1155", first: "Luis", last: "Ochoa", lang: "es", collector: "Yvette",
      phone: "469-555-0164", vehicle: "2018 Kia Optima", vin4: "4408",
      apr: 20.9, principal: 12640.0, payment: 355, feeBalance: 25,
      nextDueDate: d(-22), paidToDate: d(-36), lastPayDate: d(-36),
      earnedToDate: 640.15, gps: true, starter: true,
      rtc: { sent: d(-21), tracking: "9414 8118 9956 4321 0987 65", cure: d(-1), cost: 1.0 } }),
  ];
}
