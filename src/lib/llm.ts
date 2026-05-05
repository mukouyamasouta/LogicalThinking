const MODEL = import.meta.env.VITE_MODEL ?? "claude-opus-4-7";

export class LLMUnavailableError extends Error {
  constructor() {
    super(
      "window.claude.complete が見つかりません。このアプリは claude.ai の Artifact 内で動作することを想定しています。"
    );
    this.name = "LLMUnavailableError";
  }
}

export async function complete(prompt: string): Promise<string> {
  if (typeof window === "undefined" || !window.claude?.complete) {
    if (import.meta.env.DEV) {
      console.warn("[llm] window.claude.complete が無いためモック応答を返します");
      return mockResponse(prompt);
    }
    throw new LLMUnavailableError();
  }
  return window.claude.complete(prompt);
}

export function getModelName(): string {
  return MODEL;
}

function mockResponse(prompt: string): string {
  const head = prompt.slice(-200);
  return [
    "（開発モック応答）",
    "良い視点です。もう一段深く掘り下げてみましょう。",
    "",
    `ヒント: ${head.match(/STEP\s*\d/)?.[0] ?? "現在のステップ"}を踏まえ、根拠を1つ追加してみてください。`,
    "",
    "次の問いに進める準備ができたら『次のステップへ』を押してください。",
  ].join("\n");
}
