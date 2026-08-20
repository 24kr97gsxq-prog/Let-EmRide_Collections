import React, { useState, useRef } from "react";

export const Spine = ({ color }) => <span className="spine" style={{ background: color }} />;

export function Tag({ children, tone = "line" }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-l">{label}</span>
      {children}
    </label>
  );
}

export function Stat({ l, v, note, tone }) {
  const cls = ["stat", tone === "big" ? "stat-big" : "", tone === "warn" ? "stat-warn" : ""].join(" ").trim();
  return (
    <div className={cls}>
      <div className="stat-l">{l}</div>
      <div className="stat-v">{v}</div>
      {note && <div className="stat-n">{note}</div>}
    </div>
  );
}

export function Line({ l, v, bold, amber, green }) {
  return (
    <div className={"line " + (bold ? "line-b" : "")}>
      <span>{l}</span>
      <b style={{ color: amber ? "#F5C242" : green ? "#3FA96B" : undefined }}>{v}</b>
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <div className="empty-h">{title}</div>
      {children}
    </div>
  );
}

/**
 * The signature element: a generated message prints on a carbon-copy receipt
 * card, because that's the artifact these two handle all day at the window.
 */
export function Copyable({ text }) {
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      if (ref.current) {
        ref.current.select();
        try { document.execCommand("copy"); } catch { /* user can copy by hand */ }
      }
    }
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };

  const rows = Math.min(16, text.split("\n").length + Math.ceil(text.length / 46));

  return (
    <div className="receipt">
      <div className="perf" />
      <textarea ref={ref} className="receipt-body" readOnly value={text} rows={rows} />
      <button className="btn btn-copy" onClick={copy}>{done ? "Copied" : "Copy message"}</button>
    </div>
  );
}
