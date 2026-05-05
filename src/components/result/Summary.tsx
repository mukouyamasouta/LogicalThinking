import { Sparkles } from "lucide-react";

export function Summary({ comment }: { comment: string }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Sparkles size={16} style={{ color: "var(--accent)" }} />
        <strong>総評</strong>
      </div>
      <p style={{ margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{comment}</p>
    </div>
  );
}
