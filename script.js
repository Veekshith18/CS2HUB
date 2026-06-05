// ─── CONFIG ───────────────────────────────────────────────
const API_TOKEN = '8Ixu0UWpHY07fXI7NMmqSyGQ5w60gaICH3dd46Qe0nvBQxdmtJI';
const BASE = 'http://localhost:3000';
const HEADERS = {'Authorization': `Bearer ${API_TOKEN}`};

// ─── TEAM COLORS (deterministic from name hash) ──────────
const COLOR_POOL = [
  ['#1f3a5f','#4a9eff'],['#1a3828','#3ecf8e'],['#3d2b00','#e8a020'],
  ['#2d1f5e','#bc8cff'],['#3d1010','#e8451a'],['#0f2a2a','#2dd4bf'],
  ['#1a1a3d','#818cf8'],['#2a1520','#f472b6'],['#1a2a1a','#86efac'],
  ['#2a1500','#fb923c'],
];
function teamColor(name){
  let h=0;for(const c of (name||''))h=(h*31+c.charCodeAt(0))&0xffffffff;
  return COLOR_POOL[Math.abs(h)%COLOR_POOL.length];
}
function teamInitials(name){
  if(!name)return'??';
  const w=name.trim().split(/\s+/);
  if(w.length>=2)return(w[0][0]+w[1][0]).toUpperCase();
  return name.slice(0,3).toUpperCase();
}
function teamLogoHTML(name,size=36,radius='8px'){
  const [bg,fg]=teamColor(name);
  return `<div class="team-logo" style="width:${size}px;height:${size}px;background:${bg};color:${fg};border-radius:${radius}">${teamInitials(name)}</div>`;
}
function tlogoHTML(name,size=28){
  const [bg,fg]=teamColor(name);
  return `<div class="tlogo" style="width:${size}px;height:${size}px;background:${bg};color:${fg}">${teamInitials(name)}</div>`;
}

// ─── API HELPERS ─────────────────────────────────────────
async function api(path){
  const r = await fetch(BASE + path);

  if(!r.ok){
      throw new Error(`API ${r.status}: ${r.statusText}`);
  }

  return r.json();
}

// ─── CLOCK ───────────────────────────────────────────────
function tick(){
  const s=new Date().toLocaleTimeString('en-GB');
  document.getElementById('clockEl').textContent=s;
  document.getElementById('sb-clock').textContent=s;
}
tick();setInterval(tick,1000);

// ─── NAV ─────────────────────────────────────────────────
function switchPage(id,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(btn)btn.classList.add('active');
  if(id==='rankings'&&!rankingsLoaded)loadRankings();
  if(id==='results'&&!resultsLoaded)loadResults();
  if(id==='players'&&!playersLoaded)loadPlayers();
}
function switchTab(id,btn){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  if(id==='recent')loadResults(false);
  else loadResults(true);
}

// ─── MATCH CARD BUILDER ──────────────────────────────────
function buildMatchCard(m, isLive=false){
  const t1=m.opponents?.[0]?.opponent;
  const t2=m.opponents?.[1]?.opponent;
  const n1=t1?.name||'TBD';
  const n2=t2?.name||'TBD';
  const s1=m.results?.[0]?.score??0;
  const s2=m.results?.[1]?.score??0;
  const s1cls=s1>s2?'win':s1<s2?'loss':'tie';
  const s2cls=s2>s1?'win':s2<s1?'loss':'tie';
  const event=m.league?.name||m.tournament?.name||'Unknown Event';
  const mapName=m.games?.[0]?.map?.name||'TBD';
  const round=(m.games?.[0]?.position||1);
  const totalGames=m.number_of_games||3;
  const pips=[];
  for(let i=0;i<30;i++){
    if(i<s1)pips.push('<div class="rp ct"></div>');
    else if(i<s1+s2)pips.push('<div class="rp t"></div>');
    else if(i===s1+s2&&isLive)pips.push('<div class="rp cur"></div>');
    else pips.push('<div class="rp"></div>');
  }
  const liveTag=isLive?`<div class="mc-live"><div class="live-dot"></div>LIVE</div>`:
    `<div style="font-size:11px;color:var(--muted);font-family:var(--mono)">BO${totalGames}</div>`;
  return `<div class="match-card ${isLive?'featured':''}" onclick="openMatch(${m.id})">
    <div class="mc-top">
      <span class="mc-event">${event.length>22?event.slice(0,22)+'…':event}</span>
      <span class="mc-map">${mapName}</span>
      ${liveTag}
    </div>
    <div class="mc-body">
      <div class="mc-team">
        ${teamLogoHTML(n1)}
        <div class="mc-name">${n1.length>14?n1.slice(0,14)+'…':n1}</div>
        <div class="mc-rank">${t1?.acronym||''}</div>
      </div>
      <div class="mc-score">
        <div class="score-nums">
          <span class="sn ${s1cls}">${s1}</span>
          <span class="s-sep">:</span>
          <span class="sn ${s2cls}">${s2}</span>
        </div>
        <div class="mc-status">${isLive?`MAP ${round}`:'UPCOMING'}</div>
      </div>
      <div class="mc-team right">
        ${teamLogoHTML(n2)}
        <div class="mc-name">${n2.length>14?n2.slice(0,14)+'…':n2}</div>
        <div class="mc-rank">${t2?.acronym||''}</div>
      </div>
    </div>
    ${isLive?`<div class="round-bar">${pips.join('')}</div>`:''}
  </div>`;
}

// ─── LOAD HOME ───────────────────────────────────────────
let homeLoaded=false;
async function loadHome(){
  try{
    const [running,upcoming]=await Promise.all([
      api('/api/live'),
      api('/api/upcoming')
    ]);

    // live
    const liveGrid=document.getElementById('liveGrid');
    document.getElementById('liveCnt').textContent=running.length;
    document.getElementById('liveCount').textContent=running.length+' LIVE';
    if(running.length===0){
      liveGrid.innerHTML=`<div class="empty-state" style="grid-column:span 2"><div class="big">🎮</div>No live matches right now.<br>Check back soon!</div>`;
    }else{
      liveGrid.innerHTML=running.map(m=>buildMatchCard(m,true)).join('');
    }

    // upcoming
    const upList=document.getElementById('upcomingList');
    document.getElementById('upCnt').textContent=upcoming.length;
    if(upcoming.length===0){
      upList.innerHTML=`<div class="empty-state"><div class="big">📅</div>No upcoming matches scheduled.</div>`;
    }else{
      upList.innerHTML=upcoming.map(m=>{
        const t1=m.opponents?.[0]?.opponent?.name||'TBD';
        const t2=m.opponents?.[1]?.opponent?.name||'TBD';
        const event=m.league?.name||'Unknown';
        const fmt=`BO${m.number_of_games||3}`;
        const dt=m.scheduled_at?new Date(m.scheduled_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true}):'TBD';
        return `<div class="up-card" onclick='openMatchData(${JSON.stringify(m)})'>
          <div class="up-time">${dt}</div>
          <div class="up-event">${event.length>16?event.slice(0,16)+'…':event}</div>
          <div class="up-teams">
            ${tlogoHTML(t1,24)}<span>${t1.length>16?t1.slice(0,16)+'…':t1}</span>
            <span class="vs-chip">VS</span>
            <span>${t2.length>16?t2.slice(0,16)+'…':t2}</span>${tlogoHTML(t2,24)}
          </div>
          <div class="up-fmt">${fmt}</div>
        </div>`;
      }).join('');
    }

    // ticker
    const names=running.map(m=>{
      const t1=m.opponents?.[0]?.opponent?.name||'TBD';
      const t2=m.opponents?.[1]?.opponent?.name||'TBD';
      const s1=m.results?.[0]?.score??0;
      const s2=m.results?.[1]?.score??0;
      return `<span>${t1}</span> ${s1}–${s2} <span>${t2}</span>`;
    });
    if(names.length>0)document.getElementById('tickerText').innerHTML='🔴 '+names.join(' &nbsp;·&nbsp; 🔴 ');
    else document.getElementById('tickerText').innerHTML='No live matches right now · Next matches coming up soon';

    setSbMsg(`${running.length} live · ${upcoming.length} upcoming · Updated ${new Date().toLocaleTimeString()}`);
    homeLoaded=true;
  }catch(e){
    console.error(e);
    document.getElementById('liveGrid').innerHTML=`<div class="empty-state" style="grid-column:span 2">⚠️ Failed to load live data.<br><small>${e.message}</small></div>`;
    setSbMsg('API error — check console');
  }
}

// ─── RANKINGS ────────────────────────────────────────────
let rankingsLoaded=false;
async function loadRankings(){
  try{
    const teams=await api('/api/teams');
    const wrap=document.getElementById('rankingsWrap');
    if(!teams.length){wrap.innerHTML='<div class="empty-state">No ranking data available.</div>';return;}
    const posClass=i=>i===0?'gold':i===1?'silver':i===2?'bronze':'';
    const chgVal=[0,1,-1,2,0,-2,1,0,3,-1,0,2,-3,1,0,0,2,-1,0,1];
    wrap.innerHTML=`<div class="rank-table">
      <div class="rt-head">
        <div>#</div><div></div><div>Team</div>
        <div>Points</div><div>W/L</div><div>Trend</div><div>Form</div>
      </div>
      ${teams.map((t,i)=>{
        const [bg,fg]=teamColor(t.name);
        const chg=chgVal[i]??0;
        const chgCls=chg>0?'up':chg<0?'dn':'eq';
        const chgTxt=chg>0?`▲${chg}`:chg<0?`▼${Math.abs(chg)}`:'—';
        const pts=Math.max(100,1000-i*48+Math.floor(Math.random()*20));
        const wins=Math.floor(Math.random()*30+20);
        const losses=Math.floor(Math.random()*15+5);
        const form=['w','w','l','w','w'].sort(()=>Math.random()-.5);
        return `<div class="rt-row" onclick="openTeam(${t.id},'${t.name.replace(/'/g,"\\'")}')">
          <div class="rt-pos ${posClass(i)}">${i+1}</div>
          <div class="rt-logo-cell"><div class="rt-tlogo" style="background:${bg};color:${fg}">${teamInitials(t.name)}</div></div>
          <div class="rt-name-cell"><div class="rt-tname">${t.name}</div><div class="rt-tloc">${t.location||'International'}</div></div>
          <div class="rt-pts">${pts}</div>
          <div class="rt-wr">${wins}/${losses}</div>
          <div class="rt-chg ${chgCls}">${chgTxt}</div>
          <div class="rt-form">${form.map(f=>`<div class="form-dot ${f}"></div>`).join('')}</div>
        </div>`;
      }).join('')}
    </div>`;
    rankingsLoaded=true;
  }catch(e){
    document.getElementById('rankingsWrap').innerHTML=`<div class="empty-state">⚠️ ${e.message}</div>`;
  }
}

// ─── RESULTS ─────────────────────────────────────────────
let resultsLoaded=false;
async function loadResults(week=false){
  document.getElementById('resultsWrap').innerHTML='<div class="loading-state"><div class="spin"></div><div class="loading-txt">Loading results...</div></div>';
  try{
    const matches=await api('/api/results');
    const wrap=document.getElementById('resultsWrap');
    if(!matches.length){wrap.innerHTML='<div class="empty-state">No recent results.</div>';return;}
    wrap.innerHTML=`<div class="res-list">${matches.map(m=>{
      const t1=m.opponents?.[0]?.opponent?.name||'TBD';
      const t2=m.opponents?.[1]?.opponent?.name||'TBD';
      const s1=m.results?.[0]?.score??0;
      const s2=m.results?.[1]?.score??0;
      const event=m.league?.name||'Unknown';
      const dt=m.scheduled_at?new Date(m.scheduled_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'—';
      const maps=(m.games||[]).map(g=>g.map?.name||'?').filter(Boolean).slice(0,3);
      const s1cls=s1>s2?'w':'l';
      const s2cls=s2>s1?'w':'l';
      return `<div class="res-card" onclick="openMatch(${m.id})">
        <div class="res-date">${dt}</div>
        <div class="res-event">${event.length>16?event.slice(0,16)+'…':event}</div>
        <div class="res-teams">
          ${tlogoHTML(t1,22)}
          <span style="color:${s1>s2?'var(--text)':'var(--muted)'}">${t1.length>14?t1.slice(0,14)+'…':t1}</span>
          <span class="res-score ${s1cls}">${s1}</span>
          <span style="color:var(--muted2);font-size:12px">:</span>
          <span class="res-score ${s2cls}">${s2}</span>
          <span style="color:${s2>s1?'var(--text)':'var(--muted)'}">${t2.length>14?t2.slice(0,14)+'…':t2}</span>
          ${tlogoHTML(t2,22)}
        </div>
        <div class="res-maps">${maps.map(mp=>`<span class="res-map">${mp}</span>`).join('')}</div>
      </div>`;
    }).join('')}</div>`;
    resultsLoaded=true;
  }catch(e){
    document.getElementById('resultsWrap').innerHTML=`<div class="empty-state">⚠️ ${e.message}</div>`;
  }
}

// ─── PLAYERS ─────────────────────────────────────────────
let playersLoaded=false;
async function loadPlayers(query=''){
 const endpoint = '/api/players';
  try{
    const players=await api(endpoint);
    const wrap=document.getElementById('playersWrap');
    if(!players.length){wrap.innerHTML='<div class="empty-state">No players found.</div>';return;}
    wrap.innerHTML=`<div class="player-grid">${players.map(p=>{
      const [bg,fg]=teamColor(p.current_team?.name||p.name);
      const rating=(1.0+Math.random()*0.5).toFixed(2);
      const kd=(0.8+Math.random()*0.6).toFixed(2);
      const hs=Math.floor(38+Math.random()*25);
      return `<div class="player-card" onclick="openPlayer('${p.name}','${p.first_name||''} ${p.last_name||''}','${p.current_team?.name||'Free Agent'}','${rating}','${kd}','${hs}')">
        <div class="pc-top">
          <div class="pc-avatar" style="background:${bg};color:${fg}">${teamInitials(p.name)}</div>
          <div>
            <div class="pc-nick">${p.name}</div>
            <div class="pc-name">${p.first_name||''} ${p.last_name||''}</div>
            <div class="pc-team">${p.current_team?.name||'Free Agent'}</div>
          </div>
        </div>
        <div class="pc-stats">
          <div class="pc-stat"><div class="pc-sv" style="color:var(--accent2)">${rating}</div><div class="pc-sl">Rating</div></div>
          <div class="pc-stat"><div class="pc-sv">${kd}</div><div class="pc-sl">K/D</div></div>
          <div class="pc-stat"><div class="pc-sv" style="color:var(--accent)">${hs}%</div><div class="pc-sl">HS%</div></div>
        </div>
      </div>`;
    }).join('')}</div>`;
    playersLoaded=true;
  }catch(e){
    document.getElementById('playersWrap').innerHTML=`<div class="empty-state">⚠️ ${e.message}</div>`;
  }
}

function searchPlayers(){
  const q=document.getElementById('playerSearchInput').value.trim();
  document.getElementById('playersWrap').innerHTML='<div class="loading-state"><div class="spin"></div><div class="loading-txt">Searching...</div></div>';
  loadPlayers(q);
}

// ─── MATCH MODAL ─────────────────────────────────────────
function openMatchData(m){
  document.getElementById('modalTitle').textContent='Match Details';
  document.getElementById('modalBody').innerHTML='<div class="loading-state"><div class="spin"></div><div class="loading-txt">Loading match...</div></div>';
  document.getElementById('modalBg').classList.add('open');
  try{
   
    const t1=m.opponents?.[0]?.opponent?.name||'TBD';
    const t2=m.opponents?.[1]?.opponent?.name||'TBD';
    const s1=m.results?.[0]?.score??0;
    const s2=m.results?.[1]?.score??0;
    const event=m.league?.name||'Unknown';
    const status=m.status||'unknown';
    const dt=m.scheduled_at?new Date(m.scheduled_at).toLocaleString('en-IN'):'TBD';
    const s1cls=s1>s2?'win':s1<s2?'loss':'tie';
    const s2cls=s2>s1?'win':s2<s1?'loss':'tie';
    document.getElementById('modalTitle').textContent=`${t1} vs ${t2}`;
    const validGames = (m.games || []).filter(g => g.map?.name);

const games = validGames.map((g,i)=>{
      const gmap=g.map?.name||'Unknown';
      const gw=g.winner?.name||'—';
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
        <span style="font-family:var(--mono);font-size:12px;color:var(--muted)">Map ${i+1}</span>
        <span style="font-weight:700;font-size:13px">${gmap}</span>
        <span style="font-size:12px;color:var(--accent2)">${gw}</span>
      </div>`;
    }).join('');
    document.getElementById('modalBody').innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          ${teamLogoHTML(t1,52,'10px')}
          <div style="font-size:15px;font-weight:700;cursor:pointer;color:var(--accent)" onclick="openTeam('${t1}','Unknown')">${t1}</div>
        </div>
        <div style="text-align:center">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:40px;font-weight:700;font-family:var(--mono);color:${s1>s2?'var(--accent2)':'var(--accent3)'}">${s1}</span>
            <span style="color:var(--muted2);font-size:24px">:</span>
            <span style="font-size:40px;font-weight:700;font-family:var(--mono);color:${s2>s1?'var(--accent2)':'var(--accent3)'}">${s2}</span>
          </div>
          <div style="font-size:11px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-top:4px">${status}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          ${teamLogoHTML(t2,52,'10px')}
          <div style="font-size:15px;font-weight:700;cursor:pointer;color:var(--accent)" onclick="openTeam('${t2}','Unknown')">${t2}</div>
        </div>
      </div>
      <div style="background:var(--card2);border-radius:6px;padding:12px;margin-bottom:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
        <div>
  <span style="color:var(--muted)">Event: </span>
  <span
    style="font-weight:700;color:var(--accent);cursor:pointer"
    onclick="openTournament('${event}')"
  >
    ${event}
  </span>
</div>
          <div><span style="color:var(--muted)">Status: </span><span style="font-weight:700;text-transform:capitalize">${status}</span></div>
          <div><span style="color:var(--muted)">Scheduled: </span><span style="font-family:var(--mono);font-size:11px">${dt}</span></div>
          <div><span style="color:var(--muted)">Format: </span><span style="font-weight:700">BO${m.number_of_games||3}</span></div>
        </div>
      </div>
     ${validGames.length > 0
  ? `
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:8px">
      Maps Played
    </div>
    ${games}
  `
  : ''
}
    `;
  }catch(e){
    document.getElementById('modalBody').innerHTML=`<div class="empty-state">⚠️ ${e.message}</div>`;
  }
}

// ─── TEAM MODAL ──────────────────────────────────────────
function openTeam(teamName,country){

  document.getElementById('modalTitle').textContent = teamName;

  document.getElementById('modalBody').innerHTML = `
    <div style="padding:10px">

      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">

        ${teamLogoHTML(teamName,60,'12px')}

        <div>
          <div style="font-size:24px;font-weight:700">
            ${teamName}
          </div>

          <div style="color:var(--muted)">
            ${country}
          </div>
        </div>

      </div>

      <div style="
        background:var(--card2);
        padding:16px;
        border-radius:8px;
      ">
        <div><b>Status:</b> Active</div>
        <br>
        <div><b>Game:</b> Counter-Strike 2</div>
        <br>
        <div><b>Region:</b> ${country}</div>
      </div>

    </div>
  `;

  document.getElementById('modalBg').classList.add('open');
}

function closeModal(e){if(e.target===document.getElementById('modalBg'))document.getElementById('modalBg').classList.remove('open')}

function setSbMsg(msg){document.getElementById('sb-msg').textContent=msg}

// ─── INIT ────────────────────────────────────────────────
loadHome();
setInterval(()=>{if(homeLoaded)loadHome()},60000);

function openTeam(teamName){
  document.getElementById('modalTitle').textContent = teamName;

  document.getElementById('modalBody').innerHTML = `
    <div style="padding:20px">

      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">

        <div style="
          width:80px;
          height:80px;
          border-radius:12px;
          background:#123822;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:700;
          font-size:24px;
          color:#7fffb0;
        ">
          ${teamName.substring(0,3).toUpperCase()}
        </div>

        <div>
          <h2 style="margin:0">${teamName}</h2>
          <p style="margin-top:6px;color:var(--muted)">
            CS2 Professional Team
          </p>
        </div>

      </div>

      <div style="
        background:var(--card2);
        padding:12px;
        border-radius:8px;
      ">
        <div><b>Country:</b> Unknown</div>
        <div><b>World Ranking:</b> N/A</div>
        <div><b>Status:</b> Active</div>
      </div>

    </div>
  `;
}

function openPlayer(nick,name,team,rating,kd,hs){

  document.getElementById('modalTitle').textContent = nick;

  document.getElementById('modalBody').innerHTML = `
    <div style="padding:20px">

      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">

        <div style="
          width:80px;
          height:80px;
          border-radius:50%;
          background:#18284a;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:28px;
          font-weight:700;
          color:#7fa7ff;
        ">
          ${nick.substring(0,3).toUpperCase()}
        </div>

        <div>
          <h2 style="margin:0">${nick}</h2>
          <p style="margin-top:6px;color:var(--muted)">
            ${name}
          </p>
        </div>

      </div>

      <div style="background:var(--card2);padding:14px;border-radius:8px">

        <div><b>Team:</b> ${team}</div>
        <div><b>Rating:</b> ${rating}</div>
        <div><b>K/D:</b> ${kd}</div>
        <div><b>HS%:</b> ${hs}%</div>

      </div>

    </div>
  `;

  document.getElementById('modalBg').classList.add('open');
}

function openTournament(eventName){

  document.getElementById('modalTitle').textContent = eventName;

  document.getElementById('modalBody').innerHTML = `
    <div style="padding:10px">

      <div style="
        background:var(--card2);
        padding:16px;
        border-radius:8px;
        margin-bottom:16px;
      ">
        <div style="font-size:18px;font-weight:700;color:var(--accent)">
          ${eventName}
        </div>

        <div style="margin-top:10px;color:var(--muted)">
          Counter-Strike 2 Tournament
        </div>
      </div>

      <div style="
        background:var(--card2);
        padding:16px;
        border-radius:8px;
      ">
        <div style="margin-bottom:10px">
          <b>Status:</b> Active
        </div>

        <div style="margin-bottom:10px">
          <b>Format:</b> BO3 Matches
        </div>

        <div>
          <b>Region:</b> International
        </div>
      </div>

    </div>
  `;

  document.getElementById('modalBg').classList.add('open');
}

document.getElementById("globalSearch").addEventListener("input", function () {

    const value = this.value.toLowerCase();

    document.querySelectorAll(".up-card").forEach(card => {

        if(card.innerText.toLowerCase().includes(value)){
            card.style.display = "flex";
        }else{
            card.style.display = "none";
        }

    });

});