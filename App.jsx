import React, { useEffect, useMemo, useState } from "react";
import { today } from "./lib/dates.js";
import { uid } from "./lib/format.js";
import { loadState, saveState } from "./lib/storage.js";
import { seedAccounts, defaultSettings } from "./lib/seed.js";
import Queue from "./components/Queue.jsx";
import Account from "./components/Account.jsx";
import Money from "./components/Money.jsx";
import Scripts from "./components/Scripts.jsx";
import Setup from "./components/Setup.jsx";
import { Empty } from "./components/ui.jsx";

const TABS = [
  ["queue", "Call board"],
  ["acct", "Account"],
  ["money", "Money"],
  ["scripts", "Scripts"],
  ["setup", "Setup"],
];

export default function App() {
  const [tab, setTab] = useState("queue");
  const [accounts, setAccounts] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [openId, setOpenId] = useState(null);
  const [who, setWho] = useState("all");
  const [asOf, setAsOf] = useState(today());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    loadState().then((s) => {
      if (!alive) return;
      if (s && Array.isArray(s.accounts) && s.accounts.length) {
        setAccounts(s.accounts);
        setSettings({ ...defaultSettings, ...(s.settings || {}) });
      } else {
        setAccounts(seedAccounts());
      }
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!accounts) return;
    setSaving(true);
    const t = setTimeout(() => {
      saveState({ accounts, settings }).finally(() => setSaving(false));
    }, 400);
    return () => clearTimeout(t);
  }, [accounts, settings]);

  const update = (id, patch) =>
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...(typeof patch === "function" ? patch(a) : patch) } : a))
    );

  const logTo = (id, type, text) =>
    update(id, (a) => ({
      log: [{ id: uid(), ts: new Date().toISOString(), by: settings.me, type, text }, ...(a.log || [])],
    }));

  const open = useMemo(() => accounts?.find((a) => a.id === openId) || null, [accounts, openId]);

  if (!accounts) return <div className="loading">Loading the call board…</div>;

  return (
    <>
      <header className="top">
        <div className="brand">
          <div className="brand-name">LET 'EM RIDE AUTOS<span className="inc">INC</span></div>
          <div className="brand-sub">Collections Desk · Dallas, TX · Bi-weekly</div>
        </div>
        <div className="whoami">
          <select value={settings.me} onChange={(e) => setSettings({ ...settings, me: e.target.value })} aria-label="Who is working">
            {settings.collectors.map((c) => <option key={c}>{c}</option>)}
          </select>
          <span className={"dot " + (saving ? "dot-save" : "")} title={saving ? "Saving" : "Saved"} />
        </div>
      </header>

      <main className="body">
        {tab === "queue" && (
          <Queue
            accounts={accounts} settings={settings} asOf={asOf} setAsOf={setAsOf}
            who={who} setWho={setWho}
            onOpen={(id) => { setOpenId(id); setTab("acct"); }}
          />
        )}

        {tab === "acct" &&
          (open ? (
            <Account a={open} settings={settings} asOf={asOf} update={update} logTo={logTo} back={() => setTab("queue")} />
          ) : (
            <div className="pad">
              <Empty title="No account open">
                <p>Pick someone off the call board and their file opens here.</p>
                <button className="btn btn-amber" onClick={() => setTab("queue")}>Go to the call board</button>
              </Empty>
            </div>
          ))}

        {tab === "money" && <Money accounts={accounts} settings={settings} asOf={asOf} />}
        {tab === "scripts" && <Scripts settings={settings} account={open} asOf={asOf} />}
        {tab === "setup" && (
          <Setup settings={settings} setSettings={setSettings} accounts={accounts} setAccounts={setAccounts} asOf={asOf} />
        )}
      </main>

      <nav className="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={"tab " + (tab === k ? "tab-on" : "")} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>
    </>
  );
}
