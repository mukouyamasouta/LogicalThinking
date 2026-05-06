export class LLMUnavailableError extends Error {
  constructor(detail = "") {
    super(`LLM が利用できません。${detail}`);
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
    throw new LLMUnavailableError(`ネットワークエラー: ${String(e)}`);
  }

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    // HTMLページなどが返ってきた場合はタグを除去して200字に切る
    const clean = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
    const hint = res.status === 401
      ? "（Vercel認証保護が有効かもしれません。ダッシュボードでDeployment Protectionをオフにしてください）"
      : "";
    throw new LLMUnavailableError(`サーバーエラー (${res.status})${hint}: ${clean}`);
  }

  const data = (await res.json()) as { text?: string; error?: string };
  if (data.error) throw new LLMUnavailableError(data.error);
  return data.text ?? "";
}
