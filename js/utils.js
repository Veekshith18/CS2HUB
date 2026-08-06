// ─── TEAM COLORS (deterministic from name hash) ──────────

const TEAM_DATA = {
  "Natus Vincere": {
    rank: "#1",
    region: "Europe",
    winRate: "74%",
    roster: ["b1t", "jL", "Aleksib", "iM", "w0nderful"]
  },

  "Team Spirit": {
    rank: "#2",
    region: "CIS",
    winRate: "72%",
    roster: ["donk", "sh1ro", "zont1x", "magixx", "chopper"]
  }
};

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


// ─── CLOCK ───────────────────────────────────────────────
function tick(){
  const s=new Date().toLocaleTimeString('en-GB');
  document.getElementById('clockEl').textContent=s;
  document.getElementById('sb-clock').textContent=s;
}
tick();setInterval(tick,1000);

function closeModal(e){if(e.target===document.getElementById('modalBg'))document.getElementById('modalBg').classList.remove('open')}

function closeSearch() {
  document.getElementById("searchResults").style.display = "none";
  document.getElementById("globalSearch").value = "";
}

function setSbMsg(msg){document.getElementById('sb-msg').textContent=msg}