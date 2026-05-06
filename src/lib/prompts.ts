import type { AdContext, ChatMessage, Difficulty, StepId } from "../types";
import { STEPS, hintsForStep } from "./frameworks";

export function buildContextBlock(ctx: AdContext): string {
  const parts: string[] = [];
  if (ctx.place) parts.push(`場所:${ctx.place}`);
  if (ctx.medium) parts.push(`媒体:${ctx.medium}`);
  if (ctx.notes) parts.push(`メモ:${ctx.notes.slice(0, 100)}`);
  if (ctx.copyText) parts.push(`コピー文:${ctx.copyText.slice(0, 120)}`);
  if (ctx.imageFeatures) {
    const f = ctx.imageFeatures;
    parts.push(`画像:${f.aspectRatio}:1 主要色${f.dominantColors.slice(0, 2).join("/")} 明度${f.brightness}`);
  }
  if (parts.length === 0) return "（広告情報なし）";
  return parts.join(" / ");
}

// トークン節約のため簡潔に
const SYS = `論理思考トレーナーとして振る舞う。ルール:答えを先に言わない/返答は3文以内/良い点→深掘り質問1つの構造/専門用語は初出のみ1行説明/対等な学習パートナーとして接する。`;

export function buildInitialPrompt(ctx: AdContext, difficulty: Difficulty): string {
  return `${SYS}

[広告情報] ${buildContextBlock(ctx)}
[難易度] ${difficulty}

最初のメッセージで: ①情報を1文で要約（不足なら最大2つ質問）②「準備できたら『分析開始』と入力してください」と促す。150字以内で。`;
}

export function buildStepPrompt(
  step: StepId,
  difficulty: Difficulty,
  ctx: AdContext,
  history: ChatMessage[],
  userInput: string
): string {
  const meta = STEPS[step - 1];
  const hint = hintsForStep(step, difficulty);
  // トークン節約: 直近4メッセージのみ
  const transcript = history
    .filter(m => m.role !== "system")
    .slice(-4)
    .map(m => `${m.role === "user" ? "U" : "A"}: ${m.content.slice(0, 150)}`)
    .join("\n");

  return `${SYS}

[広告] ${buildContextBlock(ctx)} [難易度] ${difficulty}
[STEP${step}] ${meta.title}｜観点:${hint.tips[0]}

[直近対話]
${transcript || "（なし）"}

[ユーザー入力]
${userInput.slice(0, 400)}

①この入力の良い点を1文 ②思考を深める質問を1文 ③次へ進める水準か1文で示唆。合計3文・150字以内。`;
}
