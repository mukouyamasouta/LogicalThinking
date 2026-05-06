export class LLMUnavailableError extends Error {
  constructor(detail = "") {
    super(detail || "LLM が利用できません。");
    this.name = "LLMUnavailableError";
  }
}

export async function complete(prompt: string): Promise<string> {
  // 優先① claude.ai Artifact ランタイム
  if (typeof window !== "undefined" && window.claude?.complete) {
    return window.claude.complete(prompt);
  }

  // 優先② Vercel serverless function (/api/complete → Groq → Gemini)
  if (typeof window !== "undefined") {
    return callApi(prompt);
  }

  throw new LLMUnavailableError("window がありません。");
}

async function callApi(prompt: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch("/api/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
  } catch (e) {
    throw new LLMUnavailableError(`ネットワーク接続エラーです。インターネット接続を確認してください。（${String(e)}）`);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data: {
    text?: string;
    error?: string;
    quota?: boolean;
    suggestion?: string;
    detail?: string;
  } = isJson ? await res.json().catch(() => ({})) : {};

  if (res.status === 429 || data.quota) {
    const lines = [
      "⏳ AIサービスの本日の無料枠を使い切りました。",
      data.error ?? "",
      data.suggestion ? `\n💡 ${data.suggestion}` : "\n💡 数分待つか、明日もう一度お試しください。",
    ].filter(Boolean);
    throw new LLMUnavailableError(lines.join("\n"));
  }

  if (!res.ok) {
    const hints: Record<number, string> = {
      401: "Vercel認証保護が有効かもしれません（Deployment Protection → OFF）",
      500: "サーバー設定を確認してください（API キーが正しく設定されているか）",
      502: "AIサービスへの接続に失敗しました",
    };
    const hint = hints[res.status] ?? "";
    const detail = data.detail ?? data.error ?? "";
    throw new LLMUnavailableError(
      `エラー (${res.status})${hint ? `\n${hint}` : ""}${detail ? `\n${detail}` : ""}`
    );
  }

  if (data.error) throw new LLMUnavailableError(data.error);
  return data.text ?? "";
}
