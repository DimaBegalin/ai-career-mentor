/* ============================================================
   AI: индивидуальный веб-поиск вузов под профиль и баллы
   Порядок вызова: свой сервер /api/claude → напрямую → фолбэк.
   ============================================================ */

function examLine(){
  const i = S.meta.ielts===undefined ? "неизвестно" : (S.meta.ielts ? `СДАН, балл ${S.meta.ieltsScore||"не указан"}` : "НЕ сдан");
  const s = S.meta.sat===undefined ? "неизвестно" : (S.meta.sat ? `СДАН, балл ${S.meta.satScore||"не указан"}` : "НЕ сдан");
  return `IELTS: ${i}; SAT: ${s}`;
}

function buildPrompt(specialties){
  const specList=specialties.map(s=>`${s.name} (${s.match}%)`).join(", ");
  return `Ты — AI Career Mentor для школьника из Казахстана. Отвечай по-русски, на «ты».
Специальности УЖЕ определены логикой теста по его ответам — НЕ меняй их и их порядок: ${specList}.

Профиль ученика:
- Ответы: ${S.answers.join("; ")}
- Английский: ${S.meta.eng||"неизвестно"}; GPA: ${S.meta.gpa||"неизвестно"}
- ${examLine()}
- Финансирование: ${S.meta.grant||"не определился"}; желаемая география: ${S.meta.geo||"любая страна с грантом"}
- Внеклассное: ${S.meta.extra||"нет"}; шкалы(0-100): ${JSON.stringify(S.stats)}

ЗАДАЧА: через веб-поиск найди АКТУАЛЬНЫЕ университеты и гранты 2026 под этот профиль:
9 реальных вузов (3 страны × 3 вуза) с программами по специальности №1. Для граждан Казахстана.

ПОДБОР СТРОГО ИНДИВИДУАЛЬНЫЙ ПОД ЕГО БАЛЛЫ:
- Если IELTS/SAT сданы — сверяй его конкретные баллы с минимальными требованиями программ. НЕ предлагай вузы, где минимальный порог выше его балла (кроме максимум 1 «вуза мечты» с пометкой в req, что нужна пересдача).
- prob (вероятность) считай относительно его баллов, GPA и селективности вуза: балл сильно выше порога → 70-90; впритык → 40-60; ниже порога → до 25.
- Если экзамены НЕ сданы — выбирай вузы с поздними дедлайнами или без SAT, где он успеет сдать всё за 12 месяцев.

ПРИОРИТЕТЫ ПОДБОРА:
- Университеты ищи СТРОГО в желаемой географии из профиля — другие регионы не предлагай.
- Поле program — ТОЛЬКО реально существующая программа, подтверждённая веб-поиском, с точным официальным названием (например «BSc Artificial Intelligence», «AI & Business»). Выдумывать названия запрещено.
- Сначала ищи AI-программы по специальности №1 в этой географии; если в конкретном вузе AI-программы нет — бери ближайшую реальную программу без слова AI.
- Приоритет вузам с полными грантами: GKS, MEXT, Stipendium Hungaricum, сингапурские и гонконгские full scholarships. В поле grant — название конкретного гранта и его покрытие.
- Если география «Азия» — рассматривай именно: Южная Корея, Гонконг, Китай, Малайзия, Сингапур, Япония.
- В поле req указывай дедлайн подачи, если известен (например «дедлайн ~1 ноября»).

Верни ТОЛЬКО валидный JSON без markdown, максимально кратко:
{"specialties":[{"name":"как дано","why":["...","...","..."],"desc":"1 фраза"}],
"universities":[{"country":"...","name":"...","program":"...","grant":"название гранта/покрытие","req":"мин. IELTS/SAT кратко","prob":0-100}],
"gaps":[{"label":"IELTS","ok":false,"note":"кратко, с его баллом если есть"},{"label":"SAT / вступительные",...},{"label":"Волонтёрство",...},{"label":"Проекты / портфолио",...}],
"forecast":"1 фраза с цифрами о росте шанса на грант за 12 мес",
"plan":[{"month":"Июль","task":"..."}×5, начиная с июля 2026, конкретно под его пробелы],
"note":"1 личная фраза наставника"}`;
}

function extractJSON(text){
  const a=text.indexOf("{"), b=text.lastIndexOf("}");
  if(a===-1||b===-1||b<=a) throw new Error("в ответе ИИ нет JSON");
  return JSON.parse(text.slice(a,b+1));
}

async function callClaude(body){
  /* 1) свой сервер — ключ хранится там */
  try{
    const t0=performance.now();
    const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(r.ok){
      Log.info("ИИ: ответ получен через прокси /api/claude",{ms:Math.round(performance.now()-t0)});
      return await r.json();
    }
    Log.warn("Прокси /api/claude вернул статус "+r.status);
  }catch(e){ Log.warn("Прокси /api/claude недоступен: "+e.message); }
  /* 2) напрямую (работает в предпросмотре Claude) */
  const t1=performance.now();
  const r2=await fetch(CONFIG.ANTHROPIC_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  Log.info("ИИ: прямой запрос к Anthropic",{ms:Math.round(performance.now()-t1),status:r2.status});
  return await r2.json();
}

async function runAnalysis(){
  const fallback=buildFallbackResult();
  Log.info("Анализ запущен",{специальность:fallback.specialties[0].name, гео:S.meta.geo||"—", экзамены:examLine()});
  try{
    const data=await callClaude({
      model:MODEL,
      max_tokens:1000,
      messages:[{role:"user",content:buildPrompt(fallback.specialties)}],
      tools:[{type:"web_search_20250305",name:"web_search"}],
    });
    const text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
    const parsed=extractJSON(text.replace(/```json|```/g,""));
    const specs=fallback.specialties.map((s,i)=>{
      const ai=(parsed.specialties||[])[i]||{};
      return {...s, why:(ai.why||s.why).slice(0,3), desc:ai.desc||s.desc};
    });
    const unis=(parsed.universities||[]).slice(0,9).map(u=>({
      country:u.country||"", name:u.name||"", program:u.program||specs[0].name,
      grant:u.grant||"уточняется", req:u.req||"", prob:clamp(Math.round(Number(u.prob))||50,5,97),
    })).filter(u=>u.name);
    S.result={
      ...fallback,
      specialties:specs,
      universities: unis.length>=3 ? unis : fallback.universities,
      gaps:(parsed.gaps&&parsed.gaps.length===4)?parsed.gaps:fallback.gaps,
      forecast:parsed.forecast||fallback.forecast,
      plan:(parsed.plan||fallback.plan).slice(0,5),
      note:parsed.note||fallback.note,
    };
    S.aiLive = unis.length>=3;
    Log.info("Анализ готов",{вузов:S.result.universities.length, живойПоиск:S.aiLive});
  }catch(err){
    S.result=fallback; S.aiLive=false;
    Log.error("Анализ не удался, использую фолбэк-подборку: "+(err&&err.message));
  }
  clearInterval(S.loadTimer);
  S.phase="results"; render();
}
