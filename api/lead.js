/* Vercel serverless: приём лида — лог + пересылка в n8n-вебхук */
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const lead = req.body || {};
    const masked = String(lead.waPhone || "").replace(/(\d{4})\d+(\d{2})/, "$1*****$2");
    console.log(`[INFO] НОВЫЙ ЛИД имя=${lead.name} whatsapp=${masked} вузы=${lead.uniShort}`);
    const endpoint = process.env.LEAD_ENDPOINT;
    if (endpoint) {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      console.log(`[${r.ok ? "INFO" : "WARN"}] Лид переслан в n8n status=${r.status}`);
    } else {
      console.warn("[WARN] LEAD_ENDPOINT не задан — лид записан только в лог");
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[ERROR] /api/lead: " + e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
