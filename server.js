/* ============================================================
   AI CAREER MENTOR — сервер проекта (без зависимостей, Node 18+)
   - Раздаёт фронтенд из /public
   - POST /api/claude — прокси к Anthropic API (ключ из .env)
   - POST /api/lead   — приём лида: лог + пересылка в n8n-вебхук
   - POST /api/log    — приём логов из браузера
   Все события пишутся в терминал и в logs/app.log
   ============================================================ */
const http = require("http");
const fs = require("fs");
const path = require("path");

/* --- .env без зависимостей --- */
(function loadEnv() {
  const p = path.join(__dirname, ".env");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
})();

const PORT = Number(process.env.PORT || 3000);
const KEY = process.env.ANTHROPIC_API_KEY || "";
const LEAD_ENDPOINT = process.env.LEAD_ENDPOINT || "";
const LOG_FILE = path.join(__dirname, "logs", "app.log");
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

const C = { info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m", reset: "\x1b[0m" };
function log(level, msg, data) {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}` +
    (data ? " " + JSON.stringify(data) : "");
  console.log((C[level] || "") + line + C.reset);
  fs.appendFile(LOG_FILE, line + "\n", () => {});
}

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = "";
    req.on("data", (c) => { b += c; if (b.length > 1e6) req.destroy(); });
    req.on("end", () => resolve(b));
    req.on("error", reject);
  });
}
function send(res, code, obj, type = "application/json") {
  res.writeHead(code, { "Content-Type": type, "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" });
  res.end(typeof obj === "string" ? obj : JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];

  if (req.method === "OPTIONS") return send(res, 204, "");

  /* --- прокси к Anthropic --- */
  if (req.method === "POST" && url === "/api/claude") {
    if (!KEY) {
      log("warn", "Запрос /api/claude, но ANTHROPIC_API_KEY не задан в .env");
      return send(res, 502, { error: "ANTHROPIC_API_KEY не задан в .env" });
    }
    const t0 = Date.now();
    try {
      const body = await readBody(req);
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
        body,
      });
      const text = await r.text();
      log(r.ok ? "info" : "warn", `ИИ-запрос завершён`, { status: r.status, ms: Date.now() - t0 });
      return send(res, r.status, text);
    } catch (e) {
      log("error", "Ошибка прокси /api/claude: " + e.message);
      return send(res, 502, { error: e.message });
    }
  }

  /* --- приём лида --- */
  if (req.method === "POST" && url === "/api/lead") {
    try {
      const raw = await readBody(req);
      const lead = JSON.parse(raw || "{}");
      const masked = String(lead.waPhone || "").replace(/(\d{4})\d+(\d{2})/, "$1*****$2");
      log("info", "НОВЫЙ ЛИД", { имя: lead.name, whatsapp: masked, вузы: lead.uniShort });
      if (LEAD_ENDPOINT) {
        const r = await fetch(LEAD_ENDPOINT, { method: "POST",
          headers: { "Content-Type": "application/json" }, body: raw });
        log(r.ok ? "info" : "warn", "Лид переслан в n8n", { status: r.status });
      } else {
        log("warn", "LEAD_ENDPOINT не задан — лид записан только в лог");
      }
      return send(res, 200, { ok: true });
    } catch (e) {
      log("error", "Ошибка /api/lead: " + e.message);
      return send(res, 500, { ok: false, error: e.message });
    }
  }

  /* --- логи из браузера --- */
  if (req.method === "POST" && url === "/api/log") {
    try {
      const { events = [] } = JSON.parse(await readBody(req) || "{}");
      for (const e of events)
        log(e.level === "error" ? "error" : e.level === "warn" ? "warn" : "info",
            "[CLIENT] " + e.msg, e.data || undefined);
      return send(res, 204, "");
    } catch { return send(res, 400, { ok: false }); }
  }

  /* --- статика --- */
  if (req.method === "GET") {
    let file = path.join(__dirname, "public", url === "/" ? "index.html" : url);
    if (!file.startsWith(path.join(__dirname, "public"))) return send(res, 403, "forbidden", "text/plain");
    fs.readFile(file, (err, data) => {
      if (err) { log("warn", "404 " + url); return send(res, 404, "not found", "text/plain"); }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
    return;
  }

  send(res, 404, "not found", "text/plain");
});

server.listen(PORT, () => {
  log("info", "──────────────────────────────────────────────");
  log("info", `Сервер запущен: http://localhost:${PORT}`);
  log("info", `Debug-панель:   http://localhost:${PORT}/?debug=1`);
  log("info", `Ключ Anthropic: ${KEY ? "задан ✓" : "НЕ задан — ИИ-поиск пойдёт по запасному пути"}`);
  log("info", `Лид-вебхук:     ${LEAD_ENDPOINT || "не задан"}`);
  log("info", `Файл логов:     ${LOG_FILE}`);
  log("info", "──────────────────────────────────────────────");
});
