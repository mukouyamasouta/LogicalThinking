import { STEPS } from "../../lib/frameworks";
import type { Score, StepId } from "../../types";

export function ScoreCard({ score }: { score: Score }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, color: "var(--accent)", fontFamily: "var(--font-serif)" }}>
          {score.total}
        </div>
        <div className="muted">/ 100点</div>
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
        {STEPS.map(s => {
          const max = ({ 1: 18, 2: 22, 3: 20, 4: 18, 5: 22 } as Record<StepId, number>)[s.id];
          const v = score.breakdown[s.id] ?? 0;
          const pct = (v / max) * 100;
          return (
            <div key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>STEP {s.id} {s.shortLabel}</span>
                <span className="muted">{v} / {max}</span>
              </div>
              <div style={{ height: 6, background: "var(--bg-subtle)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", transition: "width 0.4s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
