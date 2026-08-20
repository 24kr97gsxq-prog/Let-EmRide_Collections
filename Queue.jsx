import React, { useMemo, useState } from "react";
import { BUCKETS, bucketOf, isOpen, priority, bookTotals } from "../lib/interest.js";
import { money, money0 } from "../lib/format.js";
import { fmtDate } from "../lib/dates.js";
import { Spine, Tag, Empty } from "./ui.jsx";

export default function Queue({ accounts, settings, asOf, setAsOf, who, setWho, onOpen }) {
  const [bucket, setBucket] = useState("all");

  const rows = useMemo(
    () =>
      accounts
        .filter(isOpen)
        .map((a) => ({ a, ...priority(a, asOf) }))
        .filter((r) => who === "all" || r.a.collector === who)
        .filter((r) => bucket === "all" || bucketOf(r.c.dpd).key === bucket)
        .sort((x, y) => y.score - x.score),
    [accounts, asOf, who, bucket]
  );

  const book = useMemo(() => bookTotals(accounts, asOf), [accounts, asOf]);
  const brokenCount = rows.filter((r) => r.broken).length;
  const todayCount = rows.filter((r) => r.dueToday).length;

  return (
    <div className="pad">
      <div className="board-head">
        <div>
          <div className="eyebrow">Working as of</div>
          <input className="date-in" type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </div>
        <div className="board-stats">
          <div><b>{book.past}</b><span>past due</span></div>
          <div><b>{book.delinquencyRate}%</b><span>of book</span></div>
          <div><b>{money0(book.accrued)}</b><span>unearned int.</span></div>
        </div>
      </div>

      {(brokenCount > 0 || todayCount > 0) && (
        <div className="alerts">
          {brokenCount > 0 && (
            <div className="alert alert-red">
              <b>{brokenCount}</b> broken promise{brokenCount > 1 ? "s" : ""} — call these first
            </div>
          )}
          {todayCount > 0 && (
            <div className="alert alert-amber">
              <b>{todayCount}</b> promise{todayCount > 1 ? "s" : ""} landing today — confirm the money came in
            </div>
          )}
        </div>
      )}

      <div className="chips">
        <button className={"chip " + (bucket === "all" ? "chip-on" : "")} onClick={() => setBucket("all")}>All</button>
        {BUCKETS.map((b) => (
          <button key={b.key} className={"chip " + (bucket === b.key ? "chip-on" : "")} onClick={() => setBucket(b.key)}>
            <span className="chip-dot" style={{ background: b.color }} />
            {b.label} <em>{book.byBucket[b.key]}</em>
          </button>
        ))}
      </div>

      <div className="chips">
        <button className={"chip " + (who === "all" ? "chip-on" : "")} onClick={() => setWho("all")}>Everyone</button>
        {settings.collectors.map((c) => (
          <button key={c} className={"chip " + (who === c ? "chip-on" : "")} onClick={() => setWho(c)}>{c}</button>
        ))}
      </div>

      <div className="rows">
        {rows.length === 0 && (
          <Empty title="Board is clear"><p>Nothing in this filter. Change the bucket or the collector.</p></Empty>
        )}
        {rows.map(({ a, c, broken, dueToday }) => {
          const b = bucketOf(c.dpd);
          const p = (a.promises || []).find((x) => x.status === "open");
          return (
            <button key={a.id} className="row" onClick={() => onOpen(a.id)}>
              <Spine color={b.color} />
              <div className="row-dpd" style={{ color: b.color }}>
                <b>{c.dpd}</b><span>dpd</span>
              </div>
              <div className="row-mid">
                <div className="row-name">
                  {a.first} {a.last}
                  {a.lang === "es" && <Tag tone="es">ES</Tag>}
                  {a.gps && <Tag tone="line">GPS</Tag>}
                  {c.dpd >= settings.skipDay && <Tag tone="red">SKIP</Tag>}
                </div>
                <div className="row-sub">#{a.acct} · {a.vehicle} · {a.collector}</div>
                {p && (
                  <div className={"row-promise " + (broken ? "pr-broken" : dueToday ? "pr-today" : "pr-open")}>
                    {broken ? "Broke promise" : dueToday ? "Promise due today" : "Promised"} {money(p.amount)} · {fmtDate(p.date)}
                  </div>
                )}
              </div>
              <div className="row-right">
                <div className="row-amt">{money(c.pastDueAmt)}</div>
                <div className="row-per">+{money(c.perDiem)}/day</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
