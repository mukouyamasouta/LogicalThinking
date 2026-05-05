import type { Difficulty } from "../../types";

interface Props {
  value: Difficulty;
  onChange: (v: Difficulty) => void;
}

const ITEMS: { key: Difficulty; label: string }[] = [
  { key: "beginner", label: "初級" },
  { key: "intermediate", label: "中級" },
  { key: "advanced", label: "上級" },
];

export function DifficultyToggle({ value, onChange }: Props) {
  return (
    <div style={{
      display: "inline-flex", padding: 3, gap: 2,
      background: "var(--bg-subtle)", borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
    }}>
      {ITEMS.map(it => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          style={{
            padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 500,
            background: value === it.key ? "var(--bg-elevated)" : "transparent",
            color: value === it.key ? "var(--text)" : "var(--text-muted)",
            boxShadow: value === it.key ? "var(--shadow-sm)" : "none",
            transition: "all 0.15s",
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
