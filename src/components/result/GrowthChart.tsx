import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AnalysisRecord } from "../../types";

interface Props {
  records: AnalysisRecord[];
}

export function GrowthChart({ records }: Props) {
  const data = records
    .filter(r => r.finished && r.score)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((r, i) => ({
      n: i + 1,
      score: r.score!.total,
      label: new Date(r.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
    }));

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="subtle">分析を完了すると、ここにスコアの推移が表示されます。</div>
      </div>
    );
  }

  return (
    <div className="card">
      <strong style={{ display: "block", marginBottom: 12 }}>スコアの推移</strong>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" stroke="var(--text-subtle)" fontSize={12} />
            <YAxis domain={[0, 100]} stroke="var(--text-subtle)" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: 8, fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
