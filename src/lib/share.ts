import LZString from "lz-string";
import type { AnalysisRecord } from "../types";

export function encodeToHash(record: AnalysisRecord): string {
  const slim: AnalysisRecord = {
    ...record,
    context: { ...record.context, imageDataUrl: undefined },
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(slim));
}

export function decodeFromHash(hash: string): AnalysisRecord | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(hash);
    if (!json) return null;
    return JSON.parse(json) as AnalysisRecord;
  } catch {
    return null;
  }
}

export function buildShareUrl(record: AnalysisRecord): string {
  const hash = encodeToHash(record);
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#share=${hash}`;
}

export function readShareFromUrl(): AnalysisRecord | null {
  const m = window.location.hash.match(/share=(.+)$/);
  if (!m) return null;
  return decodeFromHash(m[1]);
}
