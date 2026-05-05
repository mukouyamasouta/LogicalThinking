import { STEPS } from "../../lib/frameworks";
import type { StepId } from "../../types";

interface Props {
  current: StepId | null;
}

export function StepIndicator({ current }: Props) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {STEPS.map(s => {
        const active = current === s.id;
        const done = current !== null && s.id < current;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              title={s.title}
              style={{
                width: 26, height: 26, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600,
                background: active ? "var(--accent)" : done ? "var(--success)" : "var(--bg-subtle)",
                color: active || done ? "#fff" : "var(--text-muted)",
                border: active ? "none" : "1px solid var(--border)",
              }}
            >
              {s.id}
            </div>
            {s.id < 5 && (
              <div style={{
                width: 16, height: 1,
                background: done ? "var(--success)" : "var(--border)",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
