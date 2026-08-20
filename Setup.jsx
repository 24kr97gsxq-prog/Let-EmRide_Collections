import React, { useState } from "react";
import { parseAging, buildExport, IMPORT_COLUMNS } from "../lib/csv.js";
import { calc } from "../lib/interest.js";
import { seedAccounts } from "../lib/seed.js";
import { downloadBackup } from "../lib/storage.js";
import { Field } from "./ui.jsx";

export default function Setup({ settings, setSettings, accounts, setAccounts, asOf }) {
  const [csv, setCsv] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const set = (k, v) => setSettings({ ...settings, [k]: v });

  const doImport = () => {
    const { accounts: rows, errors } = parseAging(csv, { fallbackDate: asOf, defaultCollector: settings.collectors[0] });
    setErr(errors.join(" "));
    if (!rows.length) { setMsg(""); return; }
    setAccounts(rows);
    setMsg(`Loaded ${rows.length} accounts. The call board is rebuilt.`);
  };

  const doExport = () => {
    setCsv(buildExport(accounts, asOf, calc));
    setErr("");
    setMsg("Export written into the box above. Select it and copy, or save the JSON backup below.");
  };

  return (
    <div className="pad">
      <h2 className="h2">Setup</h2>

      <section className="card">
        <h3>The lot</h3>
        <div className="grid2">
          <Field label="Phone customers call">
            <input value={settings.lot} onChange={(e) => set("lot", e.target.value)} />
          </Field>
          <Field label="Standard late fee">
            <input type="number" value={settings.lateFee} onChange={(e) => set("lateFee", Number(e.target.value))} />
          </Field>
          <Field label="Collectors (comma separated)">
            <input
              value={settings.collectors.join(", ")}
              onChange={(e) => set("collectors", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </Field>
          <Field label="Certified mail cost">
            <input type="number" step="0.01" value={settings.certCost} onChange={(e) => set("certCost", Number(e.target.value))} />
          </Field>
        </div>
      </section>

      <section className="card">
        <h3>How payments apply</h3>
        <Field label="Waterfall">
          <select value={settings.waterfall} onChange={(e) => set("waterfall", e.target.value)}>
            <option value="interest">Interest → fees → principal</option>
            <option value="fees">Fees → interest → principal</option>
          </select>
        </Field>
        <p className="fine">Match this to your retail installment contract. It changes every number on the Money screen.</p>
      </section>

      <section className="card">
        <h3>Timing</h3>
        <div className="grid2">
          <Field label="Notice mailed on day">
            <input type="number" value={settings.rtcDay} onChange={(e) => set("rtcDay", Number(e.target.value))} />
          </Field>
          <Field label="Cure days after mailing">
            <input type="number" value={settings.cureDays} onChange={(e) => set("cureDays", Number(e.target.value))} />
          </Field>
          <Field label="Grace days before late fee">
            <input type="number" value={settings.graceDays} onChange={(e) => set("graceDays", Number(e.target.value))} />
          </Field>
          <Field label="Account becomes a skip at">
            <input type="number" value={settings.skipDay} onChange={(e) => set("skipDay", Number(e.target.value))} />
          </Field>
        </div>
        <p className="fine">
          These are your operating numbers, not legal advice. Have your attorney confirm the notice and cure timing
          for Texas and your contract, then set them here so the dates on the file are right.
        </p>
      </section>

      <section className="card">
        <h3>Load today's aging from the DMS</h3>
        <p className="fine">
          Export the aging report as CSV and paste it here. Header row can include: {IMPORT_COLUMNS.join(", ")}.
          Extra columns are ignored. Only "first" (or "name") is required.
        </p>
        <textarea
          rows={5}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder="acct,first,last,phone,lang,collector,vehicle,apr,principal,payment,nextdue,lastpay"
        />
        <div className="grid2">
          <button className="btn btn-amber" onClick={doImport}>Replace call board with this file</button>
          <button className="btn" onClick={doExport}>Export today's board</button>
        </div>
        {msg && <div className="notice-ok">{msg}</div>}
        {err && <div className="notice-err">{err}</div>}
      </section>

      <section className="card">
        <h3>Backups</h3>
        <p className="fine">
          This desk stores everything in this browser on this device. Download a backup at the end of the week and
          keep it with the office records.
        </p>
        <button className="btn" onClick={() => downloadBackup({ accounts, settings })}>Download JSON backup</button>
      </section>

      <section className="card">
        <h3>Start over</h3>
        <p className="fine">Wipes promises, notes, and payments on this desk. Your DMS is untouched.</p>
        <button
          className="btn btn-red"
          onClick={() => { if (window.confirm("Clear this desk and reload sample accounts?")) setAccounts(seedAccounts(asOf)); }}
        >
          Clear desk and reload samples
        </button>
      </section>

      <p className="fine foot">
        Built for Let 'Em Ride Autos Inc. This desk sits next to the DMS — the DMS stays the book of record for
        balances and postings. Nothing here is legal advice.
      </p>
    </div>
  );
}
