// One key, one JSON blob. Small enough for a two-collector desk and simple
// enough that a backup is a copy/paste. Uses the Claude artifact storage API
// when it's there, browser localStorage everywhere else.

const KEY = "ler_desk_v1";

const hasArtifactStore = () =>
  typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";

export async function loadState() {
  try {
    if (hasArtifactStore()) {
      const r = await window.storage.get(KEY);
      return r && r.value ? JSON.parse(r.value) : null;
    }
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // first run, private mode, or a bad blob — fall back to seed
  }
}

export async function saveState(state) {
  const json = JSON.stringify(state);
  try {
    if (hasArtifactStore()) {
      await window.storage.set(KEY, json);
      return true;
    }
    localStorage.setItem(KEY, json);
    return true;
  } catch {
    return false;
  }
}

export async function clearState() {
  try {
    if (hasArtifactStore()) await window.storage.delete(KEY);
    else localStorage.removeItem(KEY);
  } catch { /* nothing to clear */ }
}

/** Full JSON backup — hand this to whoever keeps the records. */
export function downloadBackup(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `letemride-desk-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
