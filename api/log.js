/* Vercel serverless: приём логов из браузера → Runtime Logs проекта */
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { events = [] } = req.body || {};
    for (const e of events) {
      const line = `[CLIENT] [${(e.level || "info").toUpperCase()}] ${e.msg}` + (e.data ? " " + JSON.stringify(e.data) : "");
      (e.level === "error" ? console.error : e.level === "warn" ? console.warn : console.log)(line);
    }
    return res.status(204).end();
  } catch { return res.status(400).end(); }
};
