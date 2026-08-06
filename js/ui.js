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


