/* Vercel serverless: прокси к Anthropic API (ключ — в переменных окружения Vercel) */
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) {
    console.warn("[WARN] ANTHROPIC_API_KEY не задан в Environment Variables");
    return res.status(502).json({ error: "ANTHROPIC_API_KEY не задан в Vercel → Settings → Environment Variables" });
  }
  const t0 = Date.now();
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(req.body || {}),
    });
    const text = await r.text();
    console.log(`[INFO] ИИ-запрос завершён status=${r.status} ms=${Date.now() - t0}`);
    res.status(r.status).setHeader("Content-Type", "application/json");
    return res.send(text);
  } catch (e) {
    console.error("[ERROR] /api/claude: " + e.message);
    return res.status(502).json({ error: e.message });
  }
};
