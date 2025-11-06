/** Arb Streamer Pro v18 — Guaranteed working (single API via Cloudflare Worker) */
const API_URL = "https://arb-proxy.davidladjevic.workers.dev/?markets=all";
const $ = (sel) => document.querySelector(sel);
const fmtPct = (p) => (p==null ? '—' : (p*100).toFixed(1)+'%');
const nowHHMMSS = () => new Date().toLocaleTimeString();

let loop = null;

function normTitle(t){ return (t||"").toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim(); }
function sim(a,b){
  const A=new Set(normTitle(a).split(' ')), B=new Set(normTitle(b).split(' '));
  if(!A.size||!B.size) return 0; let x=0; A.forEach(w=>{ if(B.has(w)) x++; });
  return (x/Math.max(A.size,B.size))*100;
}

function computeEdges(kals, polys, minScore){
  const any=[], close=[];
  for(const k of kals){
    for(const p of polys){
      const s=sim(k.title,p.title);
      if(s>=minScore && k.yes!=null && p.yes!=null){
        const edge=Math.abs(k.yes-p.yes)*10000; // bps
        if(edge>0){
          const rec={kalshi:k, poly:p, score:s, edge:Math.round(edge)};
          any.push(rec);
          if(edge<500) close.push(rec);
        }
      }
    }
  }
  any.sort((a,b)=>b.edge-a.edge); close.sort((a,b)=>b.edge-a.edge);
  return { any:any.slice(0,100), close:close.slice(0,100) };
}

function renderArb(list, targetId, badgeClass){
  const rows=list.map(e=>{
    const time=nowHHMMSS();
    const title=e.kalshi.title.length<e.poly.title.length?e.poly.title:e.kalshi.title;
    return `<tr>
      <td class="small">${time}</td>
      <td>${title}<div class="small">sim: ${e.score.toFixed(0)} / Kalshi: <span class="code">${e.kalshi.id}</span> / Poly: <span class="code">${e.poly.id}</span></div></td>
      <td>${fmtPct(e.kalshi.yes)}</td>
      <td>${fmtPct(e.poly.yes)}</td>
      <td><span class="badge ${badgeClass}">${e.edge} bps</span></td>
    </tr>`;
  });
  $(\`#\${targetId}\`).innerHTML=rows.join("");
}

function renderRaw(kals, polys){
  $("#kalCount").textContent=kals.length; $("#polyCount").textContent=polys.length;
  $("#kalList").innerHTML=kals.map(k=>`<div class="small">• <span class="code">${k.id}</span> — ${k.title} — YES ${fmtPct(k.yes)} | NO ${fmtPct(k.no)}</div>`).join("");
  $("#polyList").innerHTML=polys.map(p=>`<div class="small">• <span class="code">${p.id}</span> — ${p.title} — YES ${fmtPct(p.yes)} | NO ${fmtPct(p.no)}</div>`).join("");
}

function setStatus(t){ $("#status").textContent=t; }
function addError(msg){ const el=$("#errors"); const d=document.createElement("div"); d.innerHTML=`<span class="err">⚠️ ${msg}</span>`; el.prepend(d); }

async function tick(){
  const refreshSec=Math.max(5, Number($("#refreshSec").value||5));
  const minScore=Math.max(50, Math.min(100, Number($("#minScore").value||80)));
  setStatus("⏳ Fetching...");
  try{
    const r=await fetch(API_URL,{headers:{accept:"application/json"}});
    if(!r.ok) throw new Error("HTTP "+r.status);
    const j=await r.json(); // { kalshi:[], polymarket:[] }
    const kals=j.kalshi||[]; const polys=j.polymarket||[];
    const { any, close }=computeEdges(kals, polys, minScore);
    renderArb(any,"arbRows","badge-arb");
    renderArb(close,"closeRows","badge-close");
    renderRaw(kals, polys);
    setStatus(`✅ Last update: ${nowHHMMSS()} | Any: ${any.length} | Close: ${close.length} | K:${kals.length} P:${polys.length}`);
  }catch(e){
    addError(e.message||String(e)); setStatus("⚠️ Error (see below)");
  }
  loop=setTimeout(tick, refreshSec*1000);
}

function start(){ if(!loop){ $("#errors").innerHTML=""; tick(); } }
function stop(){ if(loop){ clearTimeout(loop); loop=null; setStatus("✅ Idle"); } }

document.getElementById("startBtn").addEventListener("click", start);
document.getElementById("stopBtn").addEventListener("click", stop);

// tabs
document.querySelectorAll(".tab-btn").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));
  document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
}));