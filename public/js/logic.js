/* Состояние, скоринг из ответов и фолбэк-результат */
let S = null;
function freshState(){
  return {
    phase:"intro", qIndex:0, answeredCount:0,
    stats:{academic:8,english:5,leadership:10,portfolio:0},
    tags:{}, meta:{}, answers:[],
    reaction:null, achievements:[], previewShown:false,
    result:null, aiLive:false, loadTimer:null, loadStep:0,
    done:{}, openSpec:-1, selected:null, lock:false,
    multiSel:new Set(),
    lead:{name:"",phone:"",sent:false,error:""},
  };
}

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=(s)=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const svgCheck=(color)=>'<svg class="status" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="'+color+'" stroke-opacity=".4"/><path d="M5.5 9.5l2.2 2.2L12.5 7" stroke="'+color+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const svgCross=(color)=>'<svg class="status" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="'+color+'" stroke-opacity=".4"/><path d="M6.3 6.3l5.4 5.4M11.7 6.3l-5.4 5.4" stroke="'+color+'" stroke-width="1.8" stroke-linecap="round"/></svg>';
const svgTick='<svg viewBox="0 0 14 14" fill="none"><path d="M3 7.5l2.6 2.6L11 4.5" stroke="#0B2417" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function isActive(q){ return !q.cond || q.cond(); }
function activeIdx(from){ for(let i=from;i<QUESTIONS.length;i++){ if(isActive(QUESTIONS[i])) return i; } return -1; }
function totalQ(){ return QUESTIONS.filter(isActive).length; }

function topSpecs(tags,n=3){
  const e=Object.entries(tags).sort((a,b)=>b[1]-a[1]);
  for(const k of Object.keys(SPECS)){ if(e.length>=n)break; if(!e.find(x=>x[0]===k)) e.push([k,0]); }
  return e.slice(0,n);
}
function matchPct(rank,score,top){
  const base=[96,90,83][rank]??78;
  const drift= top>0 ? Math.round((score/top)*6)-6 : -8;
  return clamp(base+drift,55,97);
}
function levelFor(stats){
  const sum=Object.values(stats).reduce((a,b)=>a+b,0);
  let cur=LEVELS[0]; for(const l of LEVELS) if(sum>=l.min) cur=l;
  return {...cur,sum};
}
function readinessOf(stats){ return clamp(Math.round(Object.values(stats).reduce((a,b)=>a+b,0)/4),5,95); }

function examBoost(){
  const i={"7.5+":14,"7.0":11,"6.5":8,"6.0":5,"5.5 или ниже":2}[S.meta.ieltsScore] ?? (S.meta.ielts?6:0);
  const s={"1450+":10,"1350-1440":8,"1200-1340":5,"до 1200":2}[S.meta.satScore] ?? (S.meta.sat?4:0);
  return i+s;
}

/* специальности — ДЕТЕРМИНИРОВАННО из ответов ученика */
function computeSpecialties(){
  const top=topSpecs(S.tags); const topScore=top[0][1]||1;
  return top.map(([key,score],i)=>({
    key, name:SPECS[key].name,
    match:matchPct(i,score,topScore), why:SPECS[key].why, desc:SPECS[key].desc,
  }));
}

function buildFallbackResult(){
  const specialties=computeSpecialties();
  const readiness=readinessOf(S.stats);
  const geo=S.meta.geo||"любая страна с грантом";
  const boost=examBoost();
  const universities=(FALLBACK_UNIS[geo]||FALLBACK_UNIS["любая страна с грантом"]).map(u=>({
    ...u, program:specialties[0].name,
    prob:clamp(30+readiness+boost-(u.name.includes("NYU")||u.name.includes("NUS")?25:8),10,92),
  }));
  const gaps=[
    {label:"IELTS", ok:!!S.meta.ielts, note:S.meta.ielts?("сдан"+(S.meta.ieltsScore?" · "+S.meta.ieltsScore:"")):"не сдан"},
    {label:"SAT / вступительные", ok:!!S.meta.sat, note:S.meta.sat?("сдан"+(S.meta.satScore?" · "+S.meta.satScore:"")):"не начинал"},
    {label:"Волонтёрство", ok:!!S.meta.vol, note:S.meta.vol?"есть":"нет"},
    {label:"Проекты / портфолио", ok:S.stats.portfolio>=40, note:S.stats.portfolio>=40?"есть база":"почти пусто"},
  ];
  const from=clamp(Math.round(readiness/6)+boost,4,40), to=clamp(from+55,45,88);
  return {
    specialties, universities, gaps,
    dna:clamp(Math.round(42+(topSpecs(S.tags)[0][1]||1)*5+readiness/4),35,98),
    readiness,
    forecast:`Если начать готовиться сейчас, через 12 месяцев вероятность полного гранта вырастет с ${from}% до ${to}%.`,
    plan:[
      {month:"Июль",task:S.meta.ielts?"Shortlist вузов: требования, дедлайны, документы":"Старт IELTS: диагностика + 4 занятия в неделю"},
      {month:"Август",task:S.meta.sat?"Усиление портфолио: проект, стажировка или конкурс":"SAT / академическая база: math + reading"},
      {month:"Сентябрь",task:"Волонтёрство: 1 проект с измеримым результатом"},
      {month:"Октябрь",task:"Research: финальный список вузов и дедлайны"},
      {month:"Ноябрь",task:"Essays: личная история + 2 черновика мотивационного"},
    ],
    note:"План примерный — его можно пересобрать под твой темп.",
  };
}

