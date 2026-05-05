import { Trash2, ExternalLink } from "lucide-react";
import type { AnalysisRecord } from "../../types";

interface Props {
  records: AnalysisRecord[];
  onOpen: (r: AnalysisRecord) => void;
  onDelete: (id: string) => void;
}

export function HistoryList({ records, onOpen, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <div className="card">
        <div className="subtle">まだ履歴がありません。広告を1件分析してみましょう。</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {records.map(r => (
        <div key={r.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <strong style={{ fontSize: 14 }}>
                {r.context.place || r.context.medium || "（情報なし）"}
              </strong>
              <span className="subtle">·</span>
              <span className="subtle">{labelDifficulty(r.difficulty)}</span>
              {r.finished && r.score && (
                <span style={{
                  fontSize: 12, padding: "2px 8px", borderRadius: 999,
                  background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 600,
                }}>
                  {r.score.total}点
                </span>
              )}
              {!r.finished && (
                <span className="subtle">（未完了 STEP {r.currentStep ?? "-"}）</span>
              )}
            </div>
            <div className="subtle">
              {new Date(r.createdAt).toLocaleString("ja-JP")} · {r.messages.length} メッセージ
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => onOpen(r)} title="開く">
            <ExternalLink size={14} />
          </button>
          <button className="btn btn-ghost" onClick={() => onDelete(r.id)} title="削除" style={{ color: "var(--danger)" }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function labelDifficulty(d: AnalysisRecord["difficulty"]): string {
  return d === "beginner" ? "初級" : d === "intermediate" ? "中級" : "上級";
}
