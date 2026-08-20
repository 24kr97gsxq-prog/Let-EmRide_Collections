import React, { useMemo, useState } from "react";
import { calc, splitPayment, bookTotals, costOfLateness } from "../lib/interest.js";
import { money, money0 } from "../lib/format.js";
import { fmtDate } from "../lib/dates.js";
import { Field, Stat, Line } from "./ui.jsx";

export default function Money({ accounts, settings, asOf }) {
  const [id, setId] = useState(accounts[0]?.id);
  const a = accounts.find((x) => x.id === id) || accounts[0];
  const [amt, setAmt] = useState(a?.payment || 265);
  const [date, setDate] = useState(asOf);

  const book = useMemo(() => bookTotals(accounts, asOf), [accounts, asOf]);
  const s = a ? splitPayment(a, Number(amt) || 0, date, settings.waterfall) : null;

  return (
    <div className="pad">
      <h2 className="h2">Accrued vs. earned</h2>
      <p className="lede">
        On a simple-interest contract the meter runs every day whether anybody pays or not.
        Accrued is what the customer owes. Earned is what you booked. Watch the spread.
      </p>

      <section className="card">
        <h3>The whole book, as of {fmtDate(asOf)}</h3>
        <div className="grid2">
          <Stat l="Principal outstanding" v={money0(book.principal)} />
          <Stat l="Interest accruing daily" v={money(book.perDiem)} note="across active accounts" />
          <Stat l="Accrued, not collected" v={money(book.accrued)} tone="warn" />
          <Stat l="Interest earned to date" v={money0(book.earned)} />
        </div>
        <p className="fine">
          Accrued-not-collected is the number to argue about at the end of the month. It is charged on paper,
          it is not in the drawer, and on a 45% default book a lot of it never will be.
        </p>
      </section>

      <section className="card">
        <h3>What a payment actually does</h3>
        <div className="grid2">
          <Field label="Account">
            <select
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                const n = accounts.find((x) => x.id === e.target.value);
                if (n) setAmt(n.payment);
              }}
            >
              {accounts.map((x) => (
                <option key={x.id} value={x.id}>#{x.acct} {x.first} {x.last}</option>
              ))}
            </select>
          </Field>
          <Field label="Payment date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        </div>
        <Field label="Amount"><input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} /></Field>

        {s && (
          <>
            <div className="ledger">
              <Line l="Principal before" v={money(s.principal)} />
              <Line l={`Interest accrued (${s.days} days @ ${money(s.perDiem)})`} v={money(s.accruedUnpaid)} />
              <Line l="Late fees" v={money(s.fees)} />
              <Line l="Payoff before payment" v={money(s.payoff)} bold />
              <div className="rule" />
              <Line l="Applied to fees" v={money(s.toFees)} />
              <Line l="Applied to interest — this is earned" v={money(s.toInt)} amber />
              <Line l="Applied to principal" v={money(s.toPrin)} green />
              <div className="rule" />
              <Line l="Principal after" v={money(s.newPrincipal)} bold />
              <Line l="Interest still owed" v={money(s.leftoverInterest)} />
            </div>
            <div className="grid2">
              <Stat l="Days of interest bought" v={s.daysOfInterestBought.toFixed(1)} />
              <Stat l="Principal moved" v={money(s.toPrin)} tone={s.toPrin <= 0 ? "warn" : ""} />
            </div>
            {s.bleeding && (
              <div className="warnbar">
                Nothing hit principal. At this pace the balance never comes down and the payoff climbs {money(s.perDiem)} a day.
              </div>
            )}
          </>
        )}
        <p className="fine">
          Waterfall in use: {settings.waterfall === "interest" ? "interest, then fees, then principal" : "fees, then interest, then principal"} —
          change it in Setup to match your contract.
        </p>
      </section>

      {a && (
        <section className="card">
          <h3>Late-payment cost, in plain numbers</h3>
          <p className="fine">
            If {a.first} pays late instead of on the due date, this is the extra interest that comes out of the payment before principal:
          </p>
          <div className="latecost">
            {[0, 7, 14, 30].map((d) => (
              <div key={d}>
                <b>{d}d</b>
                <span>{money(costOfLateness(a, asOf, d))}</span>
              </div>
            ))}
          </div>
          <p className="fine">
            Say it to them exactly like that on the phone. It is the most persuasive thing on this screen and it is just arithmetic.
          </p>
        </section>
      )}
    </div>
  );
}
