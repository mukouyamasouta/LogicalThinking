import { useCallback, useEffect, useState } from "react";
import type { AnalysisRecord } from "../types";
import { loadAll, save, remove, exportJson, downloadJson } from "../lib/storage";

export function useHistory() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    setRecords(loadAll());
  }, []);

  const refresh = useCallback(() => setRecords(loadAll()), []);

  const upsert = useCallback((r: AnalysisRecord) => {
    save(r);
    refresh();
  }, [refresh]);

  const del = useCallback((id: string) => {
    remove(id);
    refresh();
  }, [refresh]);

  const exportAll = useCallback(() => {
    const data = exportJson(loadAll());
    downloadJson(`logical-thinking-${new Date().toISOString().slice(0, 10)}.json`, data);
  }, []);

  return { records, upsert, del, exportAll, refresh };
}
