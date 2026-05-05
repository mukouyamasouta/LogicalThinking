import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { buildShareUrl } from "../../lib/share";
import type { AnalysisRecord } from "../../types";

export function ShareButton({ record }: { record: AnalysisRecord }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = buildShareUrl(record);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("URLをコピーしてください", url);
    }
  };

  return (
    <button className="btn" onClick={onClick}>
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      {copied ? "コピー済み" : "URLでシェア"}
    </button>
  );
}
