import type { AnalysisRecord, Score, StepId } from "../types";
import { complete } from "./llm";

const WEIGHTS: Record<StepId, number> = { 1: 18, 2: 22, 3: 20, 4: 18, 5: 22 };

// 5回→2回のAPI呼び出しに削減（トークン節約）
export async function computeScore(record: AnalysisRecord): Promise<Score> {
  const breakdown = await rateAllSteps(record);
  const total = ([1, 2, 3, 4, 5] as StepId[]).reduce((s, id) => s + (breakdown[id] ?? 0), 0);
  const comment = await summarize(record, breakdown, total);
  return { total, breakdown, comment };
}

async function rateAllSteps(record: AnalysisRecord): Promise<Record<StepId, number>> {
  const stepLines = ([1, 2, 3, 4, 5] as StepId[])
    .map(id => {
      const ans = record.answers.find(a => a.step === id);
      const max = WEIGHTS[id];
      const text = ans ? ans.userText.slice(0, 200) : "（未回答）";
      return `S${id}(${max}点満点): ${text}`;
    })
    .join("\n");

  const prompt = `論理思考採点者として、以下の5つの回答を採点してください。
評価軸: 具体性・根拠の明示・フレームワーク的視点・独自洞察
JSONのみ返してください（他のテキスト不要）。

${stepLines}

形式: {"s1":数字,"s2":数字,"s3":数字,"s4":数字,"s5":数字}`;

  const raw = await complete(prompt);
  const match = raw.match(/\{[^}]+\}/);
  if (!match) return defaultBreakdown();

  try {
    const parsed = JSON.parse(match[0]) as Record<string, number>;
    return {
      1: clamp(Math.round(parsed.s1 ?? 0), WEIGHTS[1]),
      2: clamp(Math.round(parsed.s2 ?? 0), WEIGHTS[2]),
      3: clamp(Math.round(parsed.s3 ?? 0), WEIGHTS[3]),
      4: clamp(Math.round(parsed.s4 ?? 0), WEIGHTS[4]),
      5: clamp(Math.round(parsed.s5 ?? 0), WEIGHTS[5]),
    };
  } catch {
    return defaultBreakdown();
  }
}

async function summarize(
  record: AnalysisRecord,
  breakdown: Record<StepId, number>,
  total: number
): Promise<string> {
  const lines = record.answers
    .map(a => `S${a.step}(${breakdown[a.step]}点): ${a.userText.slice(0, 120)}`)
    .join("\n");

  const prompt = `論理思考トレーナーとして、以下の分析（合計${total}/100点）を150字程度で総評してください。
良かった点1〜2個・伸びしろ1個・励まし1文の構成で。

${lines}`;

  return (await complete(prompt)).trim();
}

function clamp(v: number, max: number): number {
  return Math.max(0, Math.min(max, v));
}

function defaultBreakdown(): Record<StepId, number> {
  return {
    1: Math.floor(WEIGHTS[1] * 0.5),
    2: Math.floor(WEIGHTS[2] * 0.5),
    3: Math.floor(WEIGHTS[3] * 0.5),
    4: Math.floor(WEIGHTS[4] * 0.5),
    5: Math.floor(WEIGHTS[5] * 0.5),
  };
}
