import type { AnalysisRecord, Score, StepId } from "../types";
import { complete } from "./llm";

const WEIGHTS: Record<StepId, number> = { 1: 18, 2: 22, 3: 20, 4: 18, 5: 22 };

export async function computeScore(record: AnalysisRecord): Promise<Score> {
  const breakdown: Record<StepId, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const ans of record.answers) {
    const max = WEIGHTS[ans.step];
    breakdown[ans.step] = await rateOne(ans.userText, ans.step, max);
  }

  const total = (Object.values(breakdown) as number[]).reduce((a, b) => a + b, 0);
  const comment = await summarize(record, breakdown, total);

  return { total, breakdown, comment };
}

async function rateOne(text: string, step: StepId, max: number): Promise<number> {
  const prompt = `あなたは論理思考の採点者です。次の回答を ${max} 点満点で採点し、整数のみを1行で返してください。

評価軸:
- 具体性（抽象論で終わっていないか）
- 根拠の明示（なぜそう言えるか）
- フレームワーク的視点（STEP ${step} の文脈で適切か）
- 独自の洞察

回答:
"""
${text}
"""

返答形式: 数字のみ（例: 14）`;

  const raw = await complete(prompt);
  const num = parseInt(raw.replace(/[^\d]/g, ""), 10);
  if (Number.isNaN(num)) return Math.floor(max * 0.5);
  return Math.max(0, Math.min(max, num));
}

async function summarize(
  record: AnalysisRecord,
  breakdown: Record<StepId, number>,
  total: number
): Promise<string> {
  const summary = record.answers
    .map(a => `STEP${a.step}（${breakdown[a.step]}点）: ${a.userText.slice(0, 200)}`)
    .join("\n\n");

  const prompt = `あなたは論理思考トレーナーです。以下のユーザー分析（5ステップ・合計${total}点）を読み、200字程度で総評してください。
- 良かった点を1〜2個
- 次に伸ばすと飛躍する観点を1個
- 励ましの一言

分析内容:
${summary}

総評（200字程度・日本語）:`;

  return (await complete(prompt)).trim();
}
