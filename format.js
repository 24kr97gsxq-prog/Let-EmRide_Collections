export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const money = (n) =>
  (n < 0 ? "-$" : "$") +
  Math.abs(Number(n) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const money0 = (n) => "$" + Math.round(Number(n) || 0).toLocaleString("en-US");

export const uid = () => Math.random().toString(36).slice(2, 10);

export const digits = (s) => String(s || "").replace(/\D/g, "");
