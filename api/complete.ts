import type { VercelRequest, VercelResponse } from "@vercel/node";

/* ────────────────────────────────────────────
   マルチプロバイダ対応: Groq → Gemini の順で試行
   どちらも完全無料。両方使えば1日約16,000リクエストまで対応
   ──────────────────────────────────────────── */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash-latest";
const MAX_RETRIES = 2;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!groqKey && !geminiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY または GEMINI_API_KEY のいずれかが必要です" });
  }

  const body = req.body as { prompt?: string };
  const prompt = body?.prompt?.trim();
  if (!prompt) return res.status(400).json({ error: "prompt が空です" });

  const errors: string[] = [];

  // ① Groq（速い・無料）
  if (groqKey) {
    try {
      const text = await callGroq(prompt, groqKey);
      return res.json({ text, provider: "groq" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Groq: ${msg}`);
      console.warn("[groq] failed:", msg);
      // クォータ系エラーなら Gemini にフォールバック
    }
  }

  // ② Gemini フォールバック（無料枠が大きい）
  if (geminiKey) {
    try {
      const text = await callGemini(prompt, geminiKey);
      return res.json({ text, provider: "gemini" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Gemini: ${msg}`);
      console.warn("[gemini] failed:", msg);
    }
  }

  // 全プロバイダ失敗
  const isQuota = errors.some(e => /quota|rate.?limit|429|exceeded/i.test(e));
  return res.status(isQuota ? 429 : 502).json({
    error: isQuota
      ? "すべての無料APIが本日のクォータに達しました。明日以降に再度お試しください。"
      : "AIサービスへの接続に失敗しました。",
    detail: errors.join(" / "),
    quota: isQuota,
    suggestion: !geminiKey
      ? "GEMINI_API_KEY を Vercel 環境変数に追加すると、Groq クォータ超過時の自動フォールバックが有効になります。"
      : undefined,
  });
}

/* ────────────────────────────────────────────
   Groq（OpenAI互換 API）
   ──────────────────────────────────────────── */
async function callGroq(prompt: string, apiKey: string): Promise<string> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (r.status === 429) {
      // 短いリトライ後ダメなら呼び出し元へ
      if (attempt < MAX_RETRIES) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      throw new Error("Rate limit (429)");
    }

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      // 日次クォータの場合は再試行しない
      if (/quota|exceeded/i.test(body)) {
        throw new Error(`Quota exceeded: ${body.slice(0, 120)}`);
      }
      throw new Error(`HTTP ${r.status}: ${body.slice(0, 120)}`);
    }

    const data = (await r.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? "";
  }
  throw new Error("Unreachable");
}

/* ────────────────────────────────────────────
   Gemini（Google AI Studio API）
   ──────────────────────────────────────────── */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const url = `${GEMINI_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    }),
  });

  if (!r.ok) {
    const body = await r.text().catch(() => "");
    if (r.status === 429 || /quota|exceeded/i.test(body)) {
      throw new Error(`Quota exceeded: ${body.slice(0, 120)}`);
    }
    throw new Error(`HTTP ${r.status}: ${body.slice(0, 120)}`);
  }

  const data = (await r.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
