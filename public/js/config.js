/* ============================================================
   КОНФИГУРАЦИЯ ФРОНТЕНДА
   Фронт ходит в ИИ через свой сервер (/api/claude — ключ лежит
   на сервере в .env). Если сервер недоступен (например, файл
   открыт в предпросмотре Claude) — пробует напрямую.
   ============================================================ */
const CONFIG = {
  ANTHROPIC_URL: "https://api.anthropic.com/v1/messages",
  MODEL: "claude-sonnet-4-6",
};
/* Вебхук n8n для лидов — используется как запасной путь,
   основной путь: POST /api/lead на своём сервере (он логирует). */
const LEAD_ENDPOINT = "https://bhsedu.app.n8n.cloud/webhook/career-lead";
const API_URL = CONFIG.ANTHROPIC_URL;
const MODEL = CONFIG.MODEL;
