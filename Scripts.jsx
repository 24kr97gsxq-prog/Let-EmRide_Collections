import React, { useState } from "react";
import { MESSAGES } from "../content/messages.js";
import { CALL_SCRIPTS, HOUSE_RULES } from "../content/scripts.js";
import { calc } from "../lib/interest.js";
import { money } from "../lib/format.js";
import { addDays, fmtDate } from "../lib/dates.js";
import { Field, Copyable } from "./ui.jsx";

export default function Scripts({ settings, account, asOf }) {
  const [lang, setLang] = useState(account?.lang || "es");
  const [mode, setMode] = useState("text");
  const [sel, setSel] = useState("m1");
  const [pamt, setPamt] = useState(account?.payment || 265);
  const [pdate, setPdate] = useState(addDays(asOf, 3));

  const list = mode === "text" ? MESSAGES : CALL_SCRIPTS;
  const item = list.find((x) => x.id === sel) || list[0];
  const c = account ? calc(account, asOf) : null;

  const fill = (t) =>
    String(t)
      .replace(/\{first\}/g, account?.first || "[name]")
      .replace(/\{collector\}/g, settings.me)
      .replace(/\{amt\}/g, account ? money(account.payment) : "[payment]")
      .replace(/\{due\}/g, account ? fmtDate(account.nextDueDate) : "[due date]")
      .replace(/\{dpd\}/g, c ? c.dpd : "[days]")
      .replace(/\{vehicle\}/g, account?.vehicle || "[vehicle]")
      .replace(/\{payoff\}/g, c ? money(c.payoff) : "[payoff]")
      .replace(/\{lot\}/g, settings.lot)
      .replace(/\{pamt\}/g, money(Number(pamt) || 0))
      .replace(/\{pdate\}/g, fmtDate(pdate))
      .replace(/\{cure\}/g, account?.rtc ? fmtDate(account.rtc.cure) : "[cure date]");

  return (
    <div className="pad">
      <h2 className="h2">Scripts</h2>
      <p className="lede">
        {account
          ? <>Filled in for <b>{account.first} {account.last}</b> · #{account.acct}.</>
          : "Open an account first and every blank fills itself in."}
      </p>

      <div className="chips">
        <button className={"chip " + (mode === "text" ? "chip-on" : "")} onClick={() => { setMode("text"); setSel("m1"); }}>Texts</button>
        <button className={"chip " + (mode === "call" ? "chip-on" : "")} onClick={() => { setMode("call"); setSel("c1"); }}>Call scripts</button>
        <button className={"chip " + (lang === "en" ? "chip-on" : "")} onClick={() => setLang("en")}>English</button>
        <button className={"chip " + (lang === "es" ? "chip-on" : "")} onClick={() => setLang("es")}>Español</button>
      </div>

      <div className="scriptlist">
        {list.map((m) => (
          <button key={m.id} className={"sitem " + (sel === m.id ? "sitem-on" : "")} onClick={() => setSel(m.id)}>
            <b>{m.title}</b>
            {m.stage && <span>{m.stage}</span>}
          </button>
        ))}
      </div>

      {(item.needsPromise || mode === "call") && (
        <div className="grid2">
          <Field label="Promise / payment amount">
            <input type="number" value={pamt} onChange={(e) => setPamt(e.target.value)} />
          </Field>
          <Field label="Promise / sign-by date">
            <input type="date" value={pdate} onChange={(e) => setPdate(e.target.value)} />
          </Field>
        </div>
      )}

      <Copyable text={fill(item[lang])} />

      <section className="card">
        <h3>House rules for both of you</h3>
        <ul className="rules">
          {HOUSE_RULES.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <p className="fine">
          General practice, not legal advice — Texas debt collection rules and your contract control.
          Have counsel review before you put any of it in rotation.
        </p>
      </section>
    </div>
  );
}
