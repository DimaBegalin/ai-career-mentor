/* ============================================================
   ЛОГГЕР ПРОЕКТА
   Каждое событие уходит в 3 места:
   1) консоль браузера (DevTools);
   2) сервер → POST /api/log → терминал + файл logs/app.log;
   3) визуальная панель поверх сайта, если открыть с ?debug=1
   ============================================================ */
const Log = (() => {
  const buf = [];
  const queue = [];
  const showPanel = new URLSearchParams(location.search).has("debug");
  let panelEl = null;

  function ensurePanel() {
    if (panelEl) return panelEl;
    panelEl = document.createElement("div");
    panelEl.id = "debug-log";
    panelEl.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;max-height:38vh;overflow:auto;" +
      "background:rgba(10,11,18,.95);border-top:1px solid #3A4060;z-index:9999;" +
      "font:11px/1.5 ui-monospace,Menlo,monospace;color:#8A8FA8;padding:8px 12px;";
    document.body.appendChild(panelEl);
    return panelEl;
  }

  function push(level, msg, data) {
    const e = { ts: new Date().toISOString(), level, msg, data: data ?? null };
    buf.push(e); if (buf.length > 300) buf.shift();
    queue.push(e);
    const line = `[${e.ts}] [${level.toUpperCase()}] ${msg}` + (data ? " " + JSON.stringify(data) : "");
    (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(line);
    if (showPanel && document.body) {
      const p = ensurePanel();
      const row = document.createElement("div");
      row.style.color = level === "error" ? "#FF6B7A" : level === "warn" ? "#FFB020" : "#8A8FA8";
      row.textContent = line;
      p.appendChild(row);
      p.scrollTop = p.scrollHeight;
    }
  }

  /* пачками отправляем на сервер, чтобы не спамить сетью */
  setInterval(() => {
    if (!queue.length) return;
    if (!location.protocol.startsWith("http")) { queue.length = 0; return; }
    const batch = queue.splice(0, queue.length);
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
    }).catch(() => {});
  }, 4000);

  window.addEventListener("error", (ev) =>
    push("error", "JS-ошибка: " + ev.message, { src: ev.filename, line: ev.lineno }));

  return {
    info: (m, d) => push("info", m, d),
    warn: (m, d) => push("warn", m, d),
    error: (m, d) => push("error", m, d),
    dump: () => buf.slice(),
  };
})();
Log.info("Приложение загружено", { url: location.href });
