import { Lightbulb } from "lucide-react";
import { hintsForStep } from "../../lib/frameworks";
import type { Difficulty, StepId } from "../../types";

interface Props {
  step: StepId;
  difficulty: Difficulty;
}

export function HintCard({ step, difficulty }: Props) {
  const { framework, tips } = hintsForStep(step, difficulty);
  return (
    <div className="card fade-in" style={{ background: "var(--bg-subtle)", padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Lightbulb size={14} style={{ color: "var(--warning)" }} />
        <strong style={{ fontSize: 13 }}>ヒント</strong>
        <span className="subtle">／ {framework}</span>
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "var(--text-muted)" }}>
        {tips.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}
