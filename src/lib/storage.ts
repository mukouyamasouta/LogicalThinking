import type { AnalysisRecord } from "../types";

const KEY = "logical-thinking:history";

export function loadAll(): AnalysisRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function save(record: AnalysisRecord): void {
  const all = loadAll();
  const idx = all.findIndex(r => r.id === record.id);
  const updated = { ...record, updatedAt: Date.now() };
  if (idx >= 0) all[idx] = updated;
  else all.unshift(updated);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function remove(id: string): void {
  const all = loadAll().filter(r => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function exportJson(records: AnalysisRecord[]): string {
  return JSON.stringify(records, null, 2);
}

export function downloadJson(filename: string, data: string): void {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
