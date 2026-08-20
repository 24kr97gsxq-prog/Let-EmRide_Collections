import React, { useState } from "react";
import { calc, bucketOf } from "../lib/interest.js";
import { money, digits } from "../lib/format.js";
import { fmtDate, dayDiff } from "../lib/dates.js";
import { Tag, Field, Stat } from "./ui.jsx";
import { PromisePanel, PaymentPanel, ContactPanel, NoticePanel, RecoveryPanel } from "./panels.jsx";

export default function Account({ a, settings, asOf, update, logTo, back }) {
  const c = calc(a, asOf);
  const b = bucketOf(c.dpd);
  const [panel, setPanel] = useState(null);
  const openPromise = (a.promises || []).find((p) => p.status === "open");
  const tel = digits(a.phone);

  const actions = ["Take promise", "Post payment", "Log contact", "Notice"];
  if (c.dpd >= settings.skipDay) actions.push("Recovery");

  return (
    <div className="pad">
      <button className="back" onClick={back}>‹ Call board</button>

      <div className="acct-head" style={{ borderLeftColor: b.color }}>
        <div className="acct-name">{a.first} {a.last}</div>
        <div className="acct-meta">#{a.acct} · {a.vehicle} · VIN …{a.vin4} · {a.collector}</div>
        <div className="acct-tags">
          <Tag tone={c.dpd >= settings.skipDay ? "red" : c.dpd > 0 ? "amber" : "green"}>{c.dpd} days past due</Tag>
          <Tag tone="line">{a.lang === "es" ? "Spanish" : "English"}</Tag>
          {a.gps && <Tag tone="line">GPS</Tag>}
          {a.starter && <Tag tone="line">Starter interrupt</Tag>}
          {a.rtc && <Tag tone="amber">Notice mailed {fmtDate(a.rtc.sent)}</Tag>}
        </div>
        <div className="acct-actions">
          <a className="btn btn-amber" href={`tel:${tel}`}>Call {a.phone}</a>
          <a className="btn" href={`sms:${tel}`}>Text</a>
        </div>
      </div>

      <section className="card">
        <h3>Where the money stands</h3>
        <div className="grid2">
          <Stat l="Principal" v={money(c.principal)} />
          <Stat l="Per diem" v={money(c.perDiem)} note={`${a.apr}% APR`} />
          <Stat
            l="Accrued unpaid interest"
            v={money(c.accruedUnpaid)}
            tone={c.accruedUnpaid > a.payment ? "warn" : ""}
            note={`${c.days} days since paid-to ${fmtDate(c.paidTo)}`}
          />
          <Stat l="Interest earned to date" v={money(a.earnedToDate || 0)} note="booked revenue" />
          <Stat l="Late fees" v={money(c.fees)} />
          <Stat l="Payoff today" v={money(c.payoff)} tone="big" />
        </div>
        <p className="fine">
          Accrued is what the contract has charged this customer. Earned is what you actually collected.
          The gap is the number that decides whether this account is really making money.
        </p>
        {c.accruedUnpaid > a.payment && (
          <div className="warnbar">
            Accrued interest ({money(c.accruedUnpaid)}) is larger than one payment ({money(a.payment)}).
            A single payment will not touch principal.
          </div>
        )}
      </section>

      <div className="actionbar">
        {actions.map((x) => (
          <button key={x} className={"btn btn-sm " + (panel === x ? "btn-amber" : "")} onClick={() => setPanel(panel === x ? null : x)}>
            {x}
          </button>
        ))}
      </div>

      {panel === "Take promise" && <PromisePanel a={a} asOf={asOf} settings={settings} update={update} logTo={logTo} done={() => setPanel(null)} />}
      {panel === "Post payment" && <PaymentPanel a={a} asOf={asOf} settings={settings} update={update} logTo={logTo} done={() => setPanel(null)} />}
      {panel === "Log contact" && <ContactPanel a={a} asOf={asOf} update={update} logTo={logTo} done={() => setPanel(null)} />}
      {panel === "Notice" && <NoticePanel a={a} asOf={asOf} settings={settings} update={update} logTo={logTo} done={() => setPanel(null)} />}
      {panel === "Recovery" && <RecoveryPanel a={a} asOf={asOf} update={update} logTo={logTo} />}

      <section className="card">
        <h3>Promises</h3>
        {(a.promises || []).length === 0 && (
          <p className="fine">Nothing promised yet. Every call should end with an amount and a date.</p>
        )}
        {(a.promises || []).map((p) => {
          const late = p.status === "open" && dayDiff(p.date, asOf) > 0;
          return (
            <div key={p.id} className={"promise " + (p.status === "kept" ? "pk" : late ? "pb" : "")}>
              <div>
                <b>{money(p.amount)}</b> on {fmtDate(p.date)} · {p.method}
                <div className="fine">taken {fmtDate(p.made)} by {p.by}{p.note ? ` · ${p.note}` : ""}</div>
              </div>
              <div className="promise-act">
                {p.status === "open" ? (
                  <>
                    <button
                      className="btn btn-xs btn-green"
                      onClick={() => {
                        update(a.id, (x) => ({ promises: x.promises.map((q) => (q.id === p.id ? { ...q, status: "kept" } : q)) }));
                        logTo(a.id, "promise", `Promise kept: ${money(p.amount)}`);
                      }}
                    >
                      Kept
                    </button>
                    <button
                      className="btn btn-xs btn-red"
                      onClick={() => {
                        update(a.id, (x) => ({
                          promises: x.promises.map((q) => (q.id === p.id ? { ...q, status: "broken" } : q)),
                          nextContact: asOf,
                        }));
                        logTo(a.id, "promise", `Promise broken: ${money(p.amount)} due ${fmtDate(p.date)}`);
                      }}
                    >
                      Broke
                    </button>
                  </>
                ) : (
                  <Tag tone={p.status === "kept" ? "green" : "red"}>{p.status}</Tag>
                )}
              </div>
            </div>
          );
        })}
        <div className="nextc">
          <Field label="Next contact date">
            <input type="date" value={a.nextContact || asOf} onChange={(e) => update(a.id, { nextContact: e.target.value })} />
          </Field>
          {openPromise && (
            <div className="fine">Resting on a promise — this file drops down the board until {fmtDate(openPromise.date)}.</div>
          )}
        </div>
      </section>

      <section className="card">
        <h3>File history</h3>
        {(a.log || []).length === 0 && <p className="fine">Nothing logged. If it isn't written down, it didn't happen.</p>}
        <ul className="log">
          {(a.log || []).slice(0, 30).map((l) => (
            <li key={l.id}>
              <span className="log-t">
                {new Date(l.ts).toLocaleString("en-US", { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
              <span className={"log-k log-" + l.type}>{l.type}</span>
              <span className="log-x">{l.text}</span>
              <span className="log-b">{l.by}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
