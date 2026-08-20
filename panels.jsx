import React, { useState } from "react";
import { calc, splitPayment } from "../lib/interest.js";
import { money, round2, uid } from "../lib/format.js";
import { addDays, dayDiff, fmtDate, periodDays } from "../lib/dates.js";
import { Field, Stat } from "./ui.jsx";

export function PromisePanel({ a, asOf, settings, update, logTo, done }) {
  const c = calc(a, asOf);
  const [amt, setAmt] = useState(Math.max(a.payment, Math.round(c.pastDueAmt)) || a.payment);
  const [date, setDate] = useState(addDays(asOf, 3));
  const [method, setMethod] = useState("Online");
  const [note, setNote] = useState("");

  const save = () => {
    const p = { id: uid(), amount: Number(amt) || 0, date, method, made: asOf, by: settings.me, status: "open", note };
    update(a.id, (x) => ({ promises: [p, ...(x.promises || [])], nextContact: addDays(date, 1) }));
    logTo(a.id, "promise", `Promise taken: ${money(p.amount)} on ${fmtDate(date)} via ${method}`);
    done();
  };

  const interestUntil = round2(c.perDiem * Math.max(0, dayDiff(asOf, date)));

  return (
    <section className="card card-focus">
      <h3>Take a promise</h3>
      <div className="grid2">
        <Field label="Amount"><input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} /></Field>
        <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="How they'll pay">
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>Online</option><option>Phone</option><option>In person</option>
          </select>
        </Field>
        <Field label="Note">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="paid Friday, wife's check" />
        </Field>
      </div>
      <p className="fine">
        Interest keeps running until the money lands: {money(c.perDiem)} a day, {money(interestUntil)} between now and {fmtDate(date)}.
      </p>
      <button className="btn btn-amber" onClick={save}>Save promise and set next contact</button>
    </section>
  );
}

export function PaymentPanel({ a, asOf, settings, update, logTo, done }) {
  const [amt, setAmt] = useState(a.payment);
  const [date, setDate] = useState(asOf);
  const s = splitPayment(a, Number(amt) || 0, date, settings.waterfall);
  const per = periodDays(a.frequency || settings.frequency);

  const post = () => {
    const covers = (Number(amt) || 0) >= a.payment;
    update(a.id, (x) => ({
      principal: s.newPrincipal,
      accruedUnpaid: s.leftoverInterest,
      feeBalance: s.remainingFees,
      earnedToDate: round2((Number(x.earnedToDate) || 0) + s.toInt),
      paidToDate: date,
      lastPayDate: date,
      nextDueDate: covers ? addDays(x.nextDueDate, per) : x.nextDueDate,
      nextContact: covers ? addDays(x.nextDueDate, per) : addDays(date, 3),
      promises: (x.promises || []).map((p) => (p.status === "open" ? { ...p, status: "kept" } : p)),
    }));
    logTo(a.id, "payment", `Payment ${money(Number(amt) || 0)} — ${money(s.toInt)} interest, ${money(s.toPrin)} principal, ${money(s.toFees)} fees`);
    done();
  };

  const total = Math.max(0.01, s.toFees + s.toInt + s.toPrin);

  return (
    <section className="card card-focus">
      <h3>Post a payment</h3>
      <div className="grid2">
        <Field label="Amount"><input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} /></Field>
        <Field label="Date received"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      </div>

      <div className="tape">
        <div className="tape-bar">
          <span style={{ width: `${(s.toFees / total) * 100}%`, background: "#8496A6" }} />
          <span style={{ width: `${(s.toInt / total) * 100}%`, background: "#F5C242" }} />
          <span style={{ width: `${(s.toPrin / total) * 100}%`, background: "#3FA96B" }} />
        </div>
        <div className="tape-key">
          <span><i style={{ background: "#8496A6" }} />Fees {money(s.toFees)}</span>
          <span><i style={{ background: "#F5C242" }} />Interest {money(s.toInt)}</span>
          <span><i style={{ background: "#3FA96B" }} />Principal {money(s.toPrin)}</span>
        </div>
      </div>

      <div className="grid2">
        <Stat l="Days of interest this buys" v={s.daysOfInterestBought.toFixed(1)} note={`${money(s.perDiem)}/day`} />
        <Stat l="Principal after" v={money(s.newPrincipal)} note={`was ${money(s.principal)}`} />
      </div>

      {s.bleeding && (
        <div className="warnbar">
          This payment does not reach principal. All of it is interest and fees — the balance will not move.
          Ask for {money(round2(s.accruedUnpaid + s.fees + 25))} or more, or write an arrangement.
        </div>
      )}

      <button className="btn btn-green" onClick={post}>Post payment</button>
      <p className="fine">Posting here updates this desk only. Enter it in the DMS too — the DMS stays the book of record.</p>
    </section>
  );
}

export function ContactPanel({ a, asOf, update, logTo, done }) {
  const [type, setType] = useState("call");
  const [result, setResult] = useState("No answer");
  const [note, setNote] = useState("");
  const [next, setNext] = useState(addDays(asOf, 2));

  const save = () => {
    logTo(a.id, type, `${result}${note ? " — " + note : ""}`);
    update(a.id, { nextContact: next });
    done();
  };

  return (
    <section className="card card-focus">
      <h3>Log a contact</h3>
      <div className="grid2">
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="call">Call</option>
            <option value="text">Text</option>
            <option value="note">Note</option>
            <option value="ref">Reference call</option>
          </select>
        </Field>
        <Field label="Result">
          <select value={result} onChange={(e) => setResult(e.target.value)}>
            <option>Right party contact</option>
            <option>No answer</option>
            <option>Left voicemail</option>
            <option>Wrong number</option>
            <option>Number disconnected</option>
            <option>Refused to pay</option>
            <option>Requested no more texts (STOP)</option>
            <option>Third party — no debt disclosed</option>
          </select>
        </Field>
      </div>
      <Field label="What was said">
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Says she gets paid the 15th, hours got cut" />
      </Field>
      <Field label="Next contact date">
        <input type="date" value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      <button className="btn btn-amber" onClick={save}>Save to file</button>
    </section>
  );
}

export function NoticePanel({ a, asOf, settings, update, logTo, done }) {
  const [sent, setSent] = useState(a.rtc?.sent || asOf);
  const [tracking, setTracking] = useState(a.rtc?.tracking || "");
  const [cost, setCost] = useState(a.rtc?.cost ?? settings.certCost);
  const cure = addDays(sent, settings.cureDays);

  const save = () => {
    update(a.id, { rtc: { sent, tracking, cure, cost: Number(cost) || 0 } });
    logTo(a.id, "notice", `Default / right-to-cure notice mailed certified ${fmtDate(sent)} · ${tracking || "no tracking"} · cure ${fmtDate(cure)}`);
    done();
  };

  return (
    <section className="card card-focus">
      <h3>Certified notice</h3>
      <div className="grid2">
        <Field label="Mailed on"><input type="date" value={sent} onChange={(e) => setSent(e.target.value)} /></Field>
        <Field label="Cost"><input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
      </div>
      <Field label="Certified tracking number">
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="9414 8118 …" />
      </Field>
      <div className="noticebox">
        <div className="notice-l">Cure date lands on</div>
        <div className="notice-v">{fmtDate(cure)}</div>
        <div className="fine">{settings.cureDays} days from mailing — set in Setup.</div>
      </div>
      <button className="btn btn-amber" onClick={save}>Save notice to file</button>
      <p className="fine">
        Keep the green card and the tracking number with the file. Notice wording, timing, and cure period come from
        your contract and Texas law — have your attorney set those, then match the day count in Setup.
      </p>
    </section>
  );
}

const RECOVERY_STEPS = [
  "GPS pinged, last location and time written down",
  "Mobile called (3 attempts, different times of day)",
  "Work number called",
  "References called — asked for contact info only",
  "Certified notice mailed, tracking on file",
  "Cure date passed",
  "Voluntary surrender offered",
  "Assigned to recovery agent",
];

export function RecoveryPanel({ a, asOf, update, logTo }) {
  const done = a.recovery || {};
  const toggle = (s) => {
    const next = { ...done, [s]: !done[s] };
    update(a.id, { recovery: next });
    if (!done[s]) logTo(a.id, "repo", s);
  };

  return (
    <section className="card card-focus">
      <h3>30+ skip work</h3>
      <p className="fine">Everything on this list gets checked before a unit is assigned. This is the paper trail.</p>
      {RECOVERY_STEPS.map((s) => (
        <button key={s} className={"check " + (done[s] ? "check-on" : "")} onClick={() => toggle(s)}>
          <span className="box">{done[s] ? "✓" : ""}</span>{s}
        </button>
      ))}
      <div className="grid2 mt">
        <button
          className="btn btn-amber"
          onClick={() => { update(a.id, { status: "surrender", nextContact: asOf }); logTo(a.id, "repo", "Voluntary surrender scheduled"); }}
        >
          Mark voluntary surrender
        </button>
        <button
          className="btn btn-red"
          onClick={() => { update(a.id, { status: "repo" }); logTo(a.id, "repo", "Unit assigned for involuntary recovery"); }}
        >
          Assign for recovery
        </button>
      </div>
      <p className="fine">
        After you take a unit back there are more notices to send — intent to sell, personal property, and the
        deficiency letter. Those deadlines are legal ones; run them by your attorney and calendar them the same day.
      </p>
    </section>
  );
}
