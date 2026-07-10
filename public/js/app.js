/* Действия пользователя, навигация и рендер всех экранов */
/* ---------------- действия ---------------- */

function start(){ Log.info("Квест начат"); S.qIndex=activeIdx(0); S.phase="quiz"; render(); }

function mergeMeta(meta){
  for(const [k,v] of Object.entries(meta)){
    if(k==="extra" && S.meta.extra && S.meta.extra!=="нет" && v!=="нет") S.meta.extra=S.meta.extra+", "+v;
    else if(k==="vol") S.meta.vol=S.meta.vol||v;
    else S.meta[k]=v;
  }
}

function applyOption(opt,deltas){
  if(opt.stats) for(const[k,v]of Object.entries(opt.stats)){ S.stats[k]=clamp(S.stats[k]+v,0,100); if(deltas) deltas[k]=(deltas[k]||0)+v; }
  if(opt.tags)  for(const[k,v]of Object.entries(opt.tags))  S.tags[k]=(S.tags[k]||0)+v;
  if(opt.meta)  mergeMeta(opt.meta);
}

function choose(oi){
  if(S.lock) return;
  S.lock=true; S.selected=oi; render();
  setTimeout(()=>{
    const q=QUESTIONS[S.qIndex], opt=q.options[oi];
    const deltas={};
    applyOption(opt,deltas);
    S.answers.push(`${q.title} → ${opt.t}`);
    const newAch=[];
    if(opt.a && !S.achievements.includes(opt.a)){ S.achievements.push(opt.a); newAch.push(opt.a); }
    S.answeredCount++;
    Log.info("Ответ", {вопрос:q.id, выбор:opt.t});
    S.reaction={...opt.r, deltas, ach:newAch};
    S.selected=null; S.lock=false;
    S.phase="reaction"; render();
  },380);
}

function toggleOpt(i){
  const q=QUESTIONS[S.qIndex];
  const isNone=q.options[i].none===true;
  if(S.multiSel.has(i)) S.multiSel.delete(i);
  else{
    if(isNone) S.multiSel.clear();
    else for(const j of [...S.multiSel]) if(q.options[j].none) S.multiSel.delete(j);
    S.multiSel.add(i);
  }
  q.options.forEach((_,j)=>{
    const el=document.getElementById("opt"+j);
    if(el) el.classList.toggle("sel", S.multiSel.has(j));
  });
  const btn=document.getElementById("multiNext");
  if(btn) btn.disabled=S.multiSel.size===0;
}

function confirmMulti(){
  if(S.lock||S.multiSel.size===0) return;
  S.lock=true;
  const q=QUESTIONS[S.qIndex];
  const sel=[...S.multiSel].sort((a,b)=>a-b).map(i=>q.options[i]);
  const deltas={};
  for(const opt of sel) applyOption(opt,deltas);
  S.answers.push(`${q.title} → ${sel.map(o=>o.t).join(", ")}`);
  const newAch=[];
  for(const opt of sel) if(opt.a && !S.achievements.includes(opt.a)){ S.achievements.push(opt.a); newAch.push(opt.a); }
  const r = sel.length===1
    ? sel[0].r
    : {e:sel[0].r.e, t:"Мощная комбинация.", n:`Ты отметил направлений: ${sel.length}. Профиль становится объёмнее и точнее.`};
  S.answeredCount++;
  Log.info("Ответ (мультивыбор)", {вопрос:q.id, выбор:sel.map(o=>o.t).join(", ")});
  S.reaction={...r, deltas, ach:newAch};
  S.multiSel=new Set(); S.lock=false;
  S.phase="reaction"; render();
}

function next(){
  S.reaction=null;
  if(S.answeredCount===5 && !S.previewShown){ S.previewShown=true; S.phase="preview"; render(); return; }
  advance();
}
function advance(){
  const ni=activeIdx(S.qIndex+1);
  if(ni===-1){ finish(); return; }
  S.qIndex=ni; S.phase="quiz"; render();
}
function continueQuiz(){ advance(); }

function finish(){
  Log.info("Квест пройден, запускаю ИИ-анализ", {ответов:S.answeredCount, уровень:levelFor(S.stats).name});
  S.phase="analyzing"; S.loadStep=0; render();
  S.loadTimer=setInterval(()=>{ S.loadStep=(S.loadStep+1)%4;
    const el=document.getElementById("loadmsg"); if(el) el.textContent=LOAD_STEPS[S.loadStep];
  },1800);
  runAnalysis();
}

function stashLead(){
  const n=document.getElementById("leadName"), p=document.getElementById("leadPhone");
  if(n) S.lead.name=n.value;
  if(p) S.lead.phone=p.value;
}
function toggleDone(i){ stashLead(); S.done[i]=!S.done[i]; render(); }
function openSpec(i){ stashLead(); S.openSpec=i; render(); }
function restart(){ Log.info("Перезапуск квеста"); clearInterval(S?.loadTimer); S=freshState(); render(); }

function topUnisByProb(n=3){
  return [...S.result.universities].sort((a,b)=>b.prob-a.prob).slice(0,n);
}

/* нормализация в формат wa_id (цифры без «+»): 8 7XX… → 7 7XX…, локальный 10-значный → +7 */
function normalizePhone(raw){
  let d=(raw||"").replace(/\D/g,"");
  if(d.length===11 && d.startsWith("8")) d="7"+d.slice(1);
  if(d.length===10) d="7"+d;
  return d;
}

/* готовый текст чек-листа — бот отправит его в WhatsApp как есть */
function buildChecklist(){
  const top=topUnisByProb(3);
  const L=[];
  L.push(`🎓 Персональный чек-лист поступления${S.lead.name?" — "+S.lead.name:""}`);
  L.push("");
  L.push(`Специальность №1: ${S.result.specialties[0].name} (${S.result.specialties[0].match}%)`);
  L.push(examLine());
  L.push("");
  L.push("ТВОИ ТОП-ВУЗЫ:");
  top.forEach((u,i)=>{
    L.push(`${i+1}) ${u.name} (${u.country}) — шанс ${u.prob}%`);
    L.push(`   Грант: ${u.grant}`);
    if(u.req) L.push(`   Требования: ${u.req}`);
  });
  L.push("");
  L.push("ЧТО ЗАКРЫТЬ В ПЕРВУЮ ОЧЕРЕДЬ:");
  const missing=S.result.gaps.filter(g=>!g.ok);
  (missing.length?missing:[{label:"Всё базовое закрыто — усиливай портфолио"}]).forEach(g=>L.push(`✗ ${g.label}`));
  L.push("");
  L.push("ПЛАН НА 5 МЕСЯЦЕВ:");
  S.result.plan.forEach(p=>L.push(`• ${p.month}: ${p.task}`));
  L.push("");
  L.push("Хочешь детальную профориентацию с ментором? Ответь на это сообщение — подберём время.");
  return L.join("\n");
}

async function sendLead(){
  stashLead();
  const wa=normalizePhone(S.lead.phone);
  if(wa.length<11){ S.lead.error="Проверь WhatsApp-номер — формат +7 7XX XXX XX XX."; render(); return; }
  S.lead.error="";
  const top=topUnisByProb(3);
  const payload={
    name:S.lead.name||"друг",
    phone:S.lead.phone,
    waPhone:wa,
    uniShort:top.map(u=>u.name).join(", "),
    checklist:buildChecklist(),
    specialties:S.result.specialties.map(s=>`${s.name} — ${s.match}%`),
    topUniversities:top.map(u=>`${u.name} (${u.country}) — ${u.prob}% · ${u.req}`),
    exams:examLine(),
    profile:S.meta, stats:S.stats,
    achievements:S.achievements,
    ts:new Date().toISOString(),
  };
  let delivered=false;
  try{
    const r=await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    delivered=r.ok;
  }catch(e){ Log.warn("Прокси /api/lead недоступен: "+e.message); }
  if(!delivered && LEAD_ENDPOINT){
    try{
      await fetch(LEAD_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      delivered=true;
    }catch(e){ Log.error("Не удалось отправить лид напрямую: "+e.message); }
  }
  Log.info("Лид отправлен", {whatsapp:wa.slice(0,4)+"*****", доставлен:delivered});
  S.lead.sent=true; render();
}

const LOAD_STEPS=["Анализирую твои ответы…","Определяю специальности…","Ищу университеты под твои баллы…","Считаю вероятность поступления…"];

/* ---------------- рендер ---------------- */

const app=document.getElementById("app");

function stepsHTML(){
  const total=totalQ(), done=S.answeredCount;
  const cur = S.phase==="quiz" ? done : -1;
  let segs="";
  for(let i=0;i<total;i++){
    const cls = i<done ? "done" : (i===cur ? "cur" : "");
    segs+=`<div class="seg ${cls}"></div>`;
  }
  return `<div class="steps">${segs}</div>`;
}

function hudHTML(){
  const level=levelFor(S.stats);
  return `
  <div class="mb6">
    <div class="row mb3">
      <span class="eyebrow">AI Career Mentor</span>
      <span class="chip"><span class="dot"></span>${level.name}</span>
    </div>
    ${stepsHTML()}
    <div class="hud-grid mt4">
      ${Object.keys(STAT_LABELS).map(k=>`
        <div>
          <div class="stat-label">${STAT_LABELS[k]}</div>
          <div class="track"><div class="fill f-${k}" style="width:${clamp(S.stats[k],2,100)}%"></div></div>
        </div>`).join("")}
    </div>
  </div>`;
}

function ringHTML(value,label){
  const r=30,c=2*Math.PI*r,off=c*(1-clamp(value,0,100)/100);
  return `
  <div class="col" style="align-items:center;gap:5px">
    <svg width="76" height="76" viewBox="0 0 76 76">
      <circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="6"/>
      <circle class="arc" cx="38" cy="38" r="${r}" fill="none" stroke="var(--accent)" stroke-width="6"
        stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 38 38)"/>
      <text x="38" y="43" text-anchor="middle" class="ring-num">${clamp(value,0,100)}</text>
    </svg>
    <div class="ring-label">${label}</div>
  </div>`;
}

function routeHTML(activeCount){
  const xs=[10,90,170,250,330];
  return `
  <svg class="route" viewBox="0 0 340 36" fill="none" aria-hidden="true">
    <path d="M10 18 H330" stroke="var(--line)" stroke-width="2"/>
    <path d="M10 18 H${xs[clamp(activeCount-1,0,4)]}" stroke="var(--accent)" stroke-width="2"/>
    ${xs.map((x,i)=>`<circle class="node ${i<activeCount?"on":""} ${i===activeCount-1?"pulse":""}" cx="${x}" cy="18" r="6"/>`).join("")}
  </svg>`;
}

function render(){
  window.scrollTo({top:0});
  const P=S.phase;

  if(P==="intro"){
    app.innerHTML=`
    <div class="col" style="justify-content:center;min-height:90vh">
      <div class="eyebrow mb4 rise d1">AI Career Mentor</div>
      <h1 class="mb4 rise d2">Давай посмотрим, кем ты можешь стать через 10 лет.</h1>
      <p class="sub mb5 rise d3">За 8 минут ИИ построит твой персональный маршрут поступления:
        специальности, реальные вузы под твои баллы, шанс на грант и план на год.</p>
      <div class="mb6 rise d4">${routeHTML(2)}</div>
      <div class="rise d5"><button class="btn" onclick="start()">Поехали</button></div>
      <div class="row wrap gap2 mt4 rise d6" style="justify-content:flex-start">
        <span class="chip">8–12 минут</span>
        <span class="chip">Живой поиск вузов</span>
        <span class="chip">Шанс на грант</span>
      </div>
    </div>`;
    return;
  }

  if(P==="quiz"){
    const q=QUESTIONS[S.qIndex];
    const multi=q.multi===true;
    app.innerHTML=hudHTML()+`
    <div class="row mb3 rise d1">
      <span class="eyebrow">Вопрос ${S.answeredCount+1} / ${totalQ()}</span>
      <span class="icon-tile" style="width:36px;height:36px;font-size:17px">${q.emoji}</span>
    </div>
    <h2 class="mb2 rise d2">${esc(q.title)}</h2>
    <p class="sub mb2 rise d3">${esc(q.sub)}</p>
    ${multi?'<p class="xs mb4 rise d3" style="color:var(--accent);font-weight:600">Можно выбрать несколько вариантов</p>':'<div class="mb4"></div>'}
    <div class="col gap3 mb4">
      ${q.options.map((o,i)=>`
        <button id="opt${i}" class="opt rise d${Math.min(i+3,8)} ${(!multi&&S.selected===i)||(multi&&S.multiSel.has(i))?"sel":""}"
          onclick="${multi?`toggleOpt(${i})`:`choose(${i})`}">
          <span class="key">${String.fromCharCode(65+i)}</span><span>${esc(o.t)}</span>
        </button>`).join("")}
    </div>
    ${multi?`<button id="multiNext" class="btn rise d8" onclick="confirmMulti()" ${S.multiSel.size===0?"disabled":""}>Дальше</button>`:""}`;
    return;
  }

  if(P==="reaction"){
    const r=S.reaction;
    app.innerHTML=hudHTML()+`
    <div class="col" style="justify-content:center;min-height:56vh">
      <div class="mb5 rise d1"><span class="icon-tile" style="width:56px;height:56px;font-size:26px">${r.e}</span></div>
      <h2 class="mb2 rise d2">${esc(r.t)}</h2>
      <p class="sub mb4 rise d3">${esc(r.n)}</p>
      <div class="row wrap gap2 mb3 rise d4" style="justify-content:flex-start">
        ${Object.entries(r.deltas).map(([k,v])=>`<span class="chip chip-mint">+${v} ${STAT_LABELS[k]}</span>`).join("")}
      </div>
      ${r.ach&&r.ach.length?`<div class="row wrap gap2 mb4 rise d5" style="justify-content:flex-start">
        ${r.ach.map(a=>`<span class="chip chip-accent">Достижение · ${esc(a)}</span>`).join("")}</div>`:""}
      <button class="btn rise d6" onclick="next()">Дальше</button>
    </div>`;
    return;
  }

  if(P==="preview"){
    const top=topSpecs(S.tags), topScore=top[0][1]||1;
    app.innerHTML=hudHTML()+`
    <div class="eyebrow mb3 rise d1">Промежуточный прогноз</div>
    <h2 class="mb2 rise d2">Уже можем предположить…</h2>
    <p class="sub mb5 rise d3">По первым 5 ответам твой профиль выглядит так:</p>
    <div class="col gap3 mb5">
      ${top.map(([key,score],i)=>{
        const pct=clamp(matchPct(i,score,topScore)-10,40,90);
        return `
        <div class="card rise d${i+3}">
          <div class="row mb3">
            <span class="row gap3" style="justify-content:flex-start">
              <span class="rank ${i===0?"rank-1":""}">0${i+1}</span>
              <span style="font-weight:600">${SPECS[key].name}</span>
            </span>
            <span class="h-num" style="color:var(--accent);font-size:17px">${pct}%</span>
          </div>
          <div class="track"><div class="fill f-match" style="width:${pct}%"></div></div>
        </div>`;
      }).join("")}
    </div>
    <div class="card card-accent mb5 rise d6">
      <p class="small">Но… для точности нужно ещё ${totalQ()-5} вопросов.
      Дальше — про экзамены, грант и твои козыри.</p>
    </div>
    <button class="btn rise d7" onclick="continueQuiz()">Продолжить</button>`;
    return;
  }

  if(P==="analyzing"){
    app.innerHTML=`
    <div class="col center" style="justify-content:center;align-items:center;min-height:88vh">
      <div class="loader mb6"></div>
      <h2 class="mb3">ИИ собирает твой маршрут</h2>
      <p class="sub mb2" id="loadmsg">${LOAD_STEPS[0]}</p>
      <p class="xs sub">Идёт живой поиск по интернету — обычно 20–40 секунд</p>
    </div>`;
    return;
  }

  if(P==="results" && S.result){
    const R=S.result, level=levelFor(S.stats);
    const byCountry={};
    for(const u of R.universities){ (byCountry[u.country] ||= []).push(u); }
    const top3=topUnisByProb(3);

    app.innerHTML=`
    <div class="col gap4" style="padding-bottom:24px">
      <div class="center rise d1" style="padding-top:20px">
        <div class="eyebrow mb3">Результат готов</div>
        <h1 class="mb4">Твой маршрут поступления</h1>
        <div class="row wrap gap2 mb5" style="justify-content:center">
          <span class="chip"><span class="dot"></span>Уровень · ${level.name}</span>
          ${S.aiLive
            ?'<span class="chip chip-mint"><span class="dot dot-mint"></span>Вузы подобраны под твои баллы</span>'
            :'<span class="chip">Базовая подборка вузов</span>'}
        </div>
        <div class="row gap4" style="justify-content:center">
          ${ringHTML(R.dna,"Career DNA")}${ringHTML(R.readiness,"Admission readiness")}
        </div>
      </div>

      ${S.achievements.length?`<div class="row wrap gap2 rise d2" style="justify-content:center">
        ${S.achievements.map(a=>`<span class="chip chip-accent">${esc(a)}</span>`).join("")}</div>`:""}

      ${R.note?`<div class="card rise d2"><div class="eyebrow mb2">Наставник</div>
        <p class="small">${esc(R.note)}</p></div>`:""}

      <div class="eyebrow mt2 rise d2">Специальности — по твоим ответам</div>
      ${R.specialties.map((s,i)=>`
        <div class="card rise d${i+3}">
          <div class="row mb3" style="align-items:flex-start;gap:12px">
            <div class="col gap2" style="align-items:flex-start">
              <span class="rank ${i===0?"rank-1":""}">0${i+1}</span>
              <div style="font-family:Manrope;font-weight:800;font-size:17px;line-height:1.3">${esc(s.name)}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div class="h-num" style="font-size:24px;color:var(--accent)">${s.match}%</div>
              <div class="stat-label" style="margin:0">совпадение</div>
            </div>
          </div>
          <div class="track mb4"><div class="fill f-match" style="width:${s.match}%"></div></div>
          <div class="stat-label">Почему</div>
          <div class="col gap2 mb2">
            ${s.why.map(w=>`<div class="row gap2 small" style="justify-content:flex-start">${svgCheck("#4ADE9E")}<span>${esc(w)}</span></div>`).join("")}
          </div>
          ${(SPECS[s.key]&&SPECS[s.key].aiTracks)?`
          <div class="stat-label mt2">AI-направления</div>
          <div class="row wrap gap2 mb2" style="justify-content:flex-start">
            ${SPECS[s.key].aiTracks.map(t=>`<span class="chip">${esc(t)}</span>`).join("")}
          </div>`:""}
          ${S.openSpec===i
            ?`<p class="small sub mt2">${esc(s.desc)}</p>`
            :`<button class="btn-ghost mt2" onclick="openSpec(${i})">Подробнее</button>`}
        </div>`).join("")}

      <div class="eyebrow mt2 rise d4">Университеты под твой профиль и баллы</div>
      ${Object.entries(byCountry).map(([country,list],ci)=>`
        <div class="rise d${Math.min(ci+4,8)}">
          <div class="row gap2 mb3" style="justify-content:flex-start">
            <span class="dot"></span>
            <span style="font-family:Manrope;font-weight:800;font-size:15px">${esc(country)}</span>
          </div>
          <div class="col gap3">
            ${list.map(u=>`
              <div class="card">
                <div style="font-weight:700;font-size:15px" class="mb1">${esc(u.name)}</div>
                <div class="xs sub mb3">${esc(u.program)}</div>
                <div class="row wrap gap2 mb4">
                  <span class="chip chip-accent">${esc(u.grant)}</span>
                  ${u.req?`<span class="chip">${esc(u.req)}</span>`:""}
                </div>
                <div class="row mb2">
                  <span class="stat-label" style="margin:0">Вероятность поступления</span>
                  <span class="small" style="font-weight:700;color:var(--mint)">${u.prob}%</span>
                </div>
                <div class="track"><div class="fill f-prob" style="width:${u.prob}%"></div></div>
              </div>`).join("")}
          </div>
        </div>`).join("")}

      <div class="eyebrow mt2 rise d5">Что сейчас мешает поступлению</div>
      <div class="card rise d5">
        ${R.gaps.map((g,i)=>`
          <div class="row" style="padding:10px 0;${i<R.gaps.length-1?"border-bottom:1px solid var(--line)":""}">
            <span class="row gap2 small" style="justify-content:flex-start;font-weight:600">
              ${g.ok?svgCheck("#4ADE9E"):svgCross("#FF6B7A")}<span>${esc(g.label)}</span>
            </span>
            <span class="small" style="color:${g.ok?"var(--mint)":"var(--danger)"}">${esc(g.note)}</span>
          </div>`).join("")}
      </div>

      <div class="card card-accent rise d6">
        <div class="eyebrow mb2">Прогноз</div>
        <p class="small" style="font-weight:600;line-height:1.55">${esc(R.forecast)}</p>
      </div>

      <div class="eyebrow mt2 rise d6">Твой план на 5 месяцев</div>
      <div class="card rise d7">
        ${R.plan.map((p,i)=>`
          <div style="display:flex;align-items:flex-start;gap:14px;padding:10px 0;${i<R.plan.length-1?"border-bottom:1px solid var(--line)":""}">
            <button class="check ${S.done[i]?"on":""}" onclick="toggleDone(${i})" aria-label="Отметить выполненным">${S.done[i]?svgTick:""}</button>
            <div>
              <div class="stat-label" style="margin-bottom:3px">${esc(p.month)}</div>
              <div class="small" style="font-weight:600;${S.done[i]?"text-decoration:line-through;opacity:.55":""}">${esc(p.task)}</div>
            </div>
          </div>`).join("")}
      </div>

      ${S.lead.sent?`
      <div class="card card-mint rise d8">
        <div class="eyebrow mb2" style="color:var(--mint)">Заявка принята</div>
        <h2 class="mb3" style="font-size:18px">Чек-лист летит в WhatsApp</h2>
        <p class="small sub mb3">Открой WhatsApp — наш бот уже отправил тебе сообщение. Нажми в нём кнопку «Получить чек-лист», и он придёт прямо в чат. Внутри — требования и дедлайны по твоим топ-вузам:</p>
        <div class="col gap2 mb3">
          ${top3.map(u=>`<div class="row gap2 small" style="justify-content:flex-start">${svgCheck("#4ADE9E")}<span style="font-weight:600">${esc(u.name)}</span><span class="sub">· ${u.prob}%</span></div>`).join("")}
        </div>
        <p class="xs sub">Там же можно ответить боту — и мы подберём время детальной профориентации с ментором.</p>
      </div>`
      :`
      <div class="card card-accent rise d8">
        <div class="eyebrow mb2">Следующий шаг</div>
        <h2 class="mb3" style="font-size:18px">Чек-лист по твоим топ-вузам — в WhatsApp</h2>
        <p class="small sub mb3">Оставь WhatsApp-номер — наш бот пришлёт прямо в чат детальный чек-лист требований и дедлайнов по вузам, где у тебя выше всего шанс, и запишет на детальную профориентацию с ментором:</p>
        <div class="col gap2 mb4">
          ${top3.map(u=>`<div class="row gap2 small" style="justify-content:flex-start"><span class="dot"></span><span style="font-weight:600">${esc(u.name)}</span><span class="sub">· вероятность ${u.prob}%</span></div>`).join("")}
        </div>
        <div class="col gap3">
          <input id="leadName" class="input" type="text" placeholder="Имя" value="${esc(S.lead.name)}" autocomplete="name">
          <input id="leadPhone" class="input" type="tel" inputmode="tel" placeholder="WhatsApp: +7 7__ ___ __ __" value="${esc(S.lead.phone)}" autocomplete="tel">
          ${S.lead.error?`<p class="xs" style="color:var(--danger)">${esc(S.lead.error)}</p>`:""}
          <button class="btn" onclick="sendLead()">Получить чек-лист в WhatsApp</button>
          <p class="xs sub center">Бесплатно. Без спама — только чек-лист и запись на консультацию.</p>
        </div>
      </div>`}

      <button class="btn-ghost rise d8 mt2" onclick="restart()" style="width:100%;padding:14px">Пройти ещё раз</button>
      <p class="center xs sub">Проценты вероятности — оценочные. Требования вузов проверяй на официальных сайтах перед подачей.</p>
    </div>`;
    return;
  }
}

S=freshState();
render();
