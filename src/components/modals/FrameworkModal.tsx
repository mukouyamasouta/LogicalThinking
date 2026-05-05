import { Modal } from "./Modal";
import { FRAMEWORKS } from "../../lib/frameworks";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LEVEL_LABEL = { beginner: "初級", intermediate: "中級", advanced: "上級" };

export function FrameworkModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="フレームワーク解説">
      <div style={{ display: "grid", gap: 18 }}>
        {FRAMEWORKS.map(f => (
          <section key={f.key} style={{ paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <strong style={{ fontSize: 16 }}>{f.name}</strong>
              <span className="subtle">{f.fullName}</span>
              <span style={{
                fontSize: 11, padding: "2px 8px", borderRadius: 999,
                background: "var(--bg-subtle)", color: "var(--text-muted)",
              }}>
                {LEVEL_LABEL[f.level]}
              </span>
            </div>
            <p style={{ margin: "6px 0 8px", color: "var(--text-muted)", fontSize: 14 }}>{f.summary}</p>
            <ul style={{ margin: "0 0 8px", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7 }}>
              {f.points.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
            <div className="subtle" style={{ paddingLeft: 4, fontStyle: "italic" }}>例: {f.example}</div>
          </section>
        ))}
      </div>
    </Modal>
  );
}
