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

  // 優先② Vercel serverless function (/api/complete → Groq)
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

  if (res.status === 429) {
    const data = isJson ? (await res.json().catch(() => ({}))) as { retryAfter?: number } : {};
    const wait = data.retryAfter ?? 60;
    throw new LLMUnavailableError(
      `⏳ APIのレート制限に達しました。約${wait}秒後に再度お試しください。\n` +
      `（Groq free tierは1分あたりのトークン数に上限があります）`
    );
  }

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    const clean = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
    const hints: Record<number, string> = {
      401: "Vercel認証保護が有効かもしれません（Deployment Protection → OFF）",
      500: "サーバー設定を確認してください（GROQ_API_KEY が正しく設定されているか）",
      502: "Groq APIへの接続に失敗しました",
    };
    const hint = hints[res.status] ?? "";
    throw new LLMUnavailableError(
      `エラー (${res.status})${hint ? `\n${hint}` : ""}\n${clean}`
    );
  }

  const data = (await res.json()) as { text?: string; error?: string };
  if (data.error) throw new LLMUnavailableError(data.error);
  return data.text ?? "";
}
