import { Download } from "lucide-react";

export function ExportButton({ onExport }: { onExport: () => void }) {
  return (
    <button className="btn" onClick={onExport}>
      <Download size={14} /> JSONエクスポート
    </button>
  );
}
