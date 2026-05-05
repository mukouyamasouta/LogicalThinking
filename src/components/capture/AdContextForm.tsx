import type { AdContext } from "../../types";

interface Props {
  value: AdContext;
  onChange: (v: AdContext) => void;
}

export function AdContextForm({ value, onChange }: Props) {
  const set = (patch: Partial<AdContext>) => onChange({ ...value, ...patch });
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <label>
          <div className="subtle" style={{ marginBottom: 4 }}>掲示場所</div>
          <input
            className="input"
            placeholder="例: 渋谷駅構内"
            value={value.place ?? ""}
            onChange={e => set({ place: e.target.value })}
          />
        </label>
        <label>
          <div className="subtle" style={{ marginBottom: 4 }}>媒体</div>
          <input
            className="input"
            placeholder="例: 駅貼りB0ポスター"
            value={value.medium ?? ""}
            onChange={e => set({ medium: e.target.value })}
          />
        </label>
      </div>
      <label>
        <div className="subtle" style={{ marginBottom: 4 }}>気づいたこと・コピー文（任意）</div>
        <textarea
          className="textarea"
          placeholder="目立つコピー、ビジュアル、配色、第一印象など"
          value={value.notes ?? ""}
          onChange={e => set({ notes: e.target.value })}
        />
      </label>
    </div>
  );
}
