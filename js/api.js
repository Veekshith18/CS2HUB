const BASE = 'https://cs2hub-backend.onrender.com';

// ─── API HELPERS ─────────────────────────────────────────
async function api(path){
  const r = await fetch(BASE + path);

  if(!r.ok){
      throw new Error(`API ${r.status}: ${r.statusText}`);
  }

  return r.json();
}

async function openMatch(id) {

  try {

    const live = await api('/api/live');
    const upcoming = await api('/api/upcoming');
    const results = await api('/api/results');

    const allMatches = [
      ...live,
      ...upcoming,
      ...results
    ];

    const match = allMatches.find(m => m.id === id);

    if (match) {
      openMatchData(match);
    }

  } catch (err) {

    console.error(err);

  }

}