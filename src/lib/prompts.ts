import type { AdContext, ChatMessage, Difficulty, StepId } from "../types";
import { STEPS, hintsForStep } from "./frameworks";

export function buildContextBlock(ctx: AdContext): string {
  const parts: string[] = [];
  if (ctx.place) parts.push(`掲示場所: ${ctx.place}`);
  if (ctx.medium) parts.push(`媒体: ${ctx.medium}`);
  if (ctx.notes) parts.push(`ユーザーメモ: ${ctx.notes}`);
  if (ctx.copyText) parts.push(`OCR抽出コピー: ${ctx.copyText}`);
  if (ctx.imageFeatures) {
    const f = ctx.imageFeatures;
    parts.push(
      `画像特徴: ${f.width}x${f.height} (${f.aspectRatio}:1) / 主要色 ${f.dominantColors.join(", ")} / 明度 ${f.brightness}`
    );
  }
  if (parts.length === 0) return "（広告情報は未提供。ユーザーが想定する広告について抽象的に対話する）";
  return parts.join("\n");
}

const SYSTEM_BASE = `あなたは「論理思考トレーナー」です。ユーザーが街で見かけた広告を題材に、5つのステップで論理思考を鍛える伴走者として振る舞います。

ルール:
- 答えを先に出さない。ユーザーの思考を引き出すソクラテス的な対話を最優先。
- フィードバックは2〜4文で簡潔に。長文の講義は禁止。
- 必ず「良い点 → 深掘り質問1つ」の構造で返す。
- 不足情報があれば、ユーザーに質問を返して引き出す（場所、媒体、写っているもの等）。
- 専門用語は使ってよいが、初出時は1行で噛み砕く。
- 励ましすぎず、突き放さず、対等な学習パートナーの距離感。`;

export function buildInitialPrompt(ctx: AdContext, difficulty: Difficulty): string {
  return `${SYSTEM_BASE}

難易度: ${difficulty}
広告コンテキスト:
${buildContextBlock(ctx)}

これからユーザーと5ステップ対話を始めます。最初のメッセージで以下を行ってください:
1. 提供された情報を1〜2文で要約（または「情報が少ないので教えてください」と問い返す）
2. 不足を感じる場合は最大3つまで具体的な質問を投げる
3. 最後に「準備できたら『分析開始』と入力してください」と促す

返答（日本語、200字以内）:`;
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
  const transcript = history
    .slice(-12)
    .map(m => `${m.role === "user" ? "ユーザー" : "AI"}: ${m.content}`)
    .join("\n");

  return `${SYSTEM_BASE}

難易度: ${difficulty}
広告コンテキスト:
${buildContextBlock(ctx)}

現在のステップ: STEP ${step} - ${meta.title}
ステップの問い: ${meta.question}
このステップで意識させたい観点: ${hint.framework}

直近の対話:
${transcript || "（なし）"}

ユーザーの今回の入力:
"""
${userInput}
"""

あなたのタスク:
1. ユーザー入力を STEP ${step} の観点で評価し、良かった点を1つ指摘
2. 思考を一段深める質問を1つ投げる（フレームワークの観点を必要なら明示）
3. まだ STEP ${step} を続けるべきか、次へ進める水準かを最後に1行で示唆（例: 「もう一段深掘りすると次に進めそうです」「次のステップへ進む準備ができています」）

返答（日本語、3〜5文、200字以内）:`;
}
