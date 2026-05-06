import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const MAX_RETRIES = 3;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY が未設定です" });

  const body = req.body as { prompt?: string };
  const prompt = body?.prompt?.trim();
  if (!prompt) return res.status(400).json({ error: "prompt が空です" });

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let groqRes: Response;
    try {
      groqRes = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });
    } catch (e) {
      console.error("[groq] fetch failed:", e);
      if (attempt === MAX_RETRIES - 1) {
        return res.status(502).json({ error: "ネットワークエラー。しばらく待ってから再試行してください。" });
      }
      await sleep(1000 * (attempt + 1));
      continue;
    }

    // レート制限 → バックオフして再試行
    if (groqRes.status === 429) {
      const retryAfter = parseInt(groqRes.headers.get("retry-after") ?? "2", 10);
      const wait = Math.min(retryAfter * 1000, 5000) * (attempt + 1);
      console.warn(`[groq] 429 rate limit, retry ${attempt + 1}/${MAX_RETRIES} after ${wait}ms`);
      if (attempt === MAX_RETRIES - 1) {
        return res.status(429).json({
          error: "APIのレート制限に達しました。1〜2分ほど待ってから再度お試しください。",
          retryAfter: retryAfter * (MAX_RETRIES + 1),
        });
      }
      await sleep(wait);
      continue;
    }

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error("[groq] error:", err);
      return res.status(502).json({ error: "Groq API エラー", detail: err.slice(0, 200) });
    }

    const data = (await groqRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    return res.json({ text });
  }

  return res.status(500).json({ error: "予期しないエラーが発生しました" });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
