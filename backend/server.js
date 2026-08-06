require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const NodeCache = require("node-cache");

const app = express();

app.use(cors());

const TOKEN = process.env.PANDASCORE_TOKEN;

// Cache responses for 60 seconds
const cache = new NodeCache({
    stdTTL: 60,
    checkperiod: 120
});

async function fetchWithCache(key, url) {

    const cached = cache.get(key);

    if (cached) {
        console.log("✅ Cache Hit:", key);
        return cached;
    }

    console.log("🌐 Fetching from PandaScore:", key);

    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    });

    cache.set(key, response.data);

    return response.data;
}

// =========================
// Upcoming Matches
// =========================
app.get("/api/upcoming", async (req, res) => {
    try {

        const data = await fetchWithCache(
            "upcoming",
            "https://api.pandascore.co/csgo/matches/upcoming?per_page=8&sort=scheduled_at"
        );

        res.json(data);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// Results
// =========================
app.get("/api/results", async (req, res) => {
    try {

        const data = await fetchWithCache(
            "results",
            "https://api.pandascore.co/csgo/matches/past?per_page=20&sort=-scheduled_at"
        );

        res.json(data);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// Teams
// =========================
app.get("/api/teams", async (req, res) => {
    try {

        const data = await fetchWithCache(
            "teams",
            "https://api.pandascore.co/csgo/teams?per_page=20"
        );

        res.json(data);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// Players
// =========================
app.get("/api/players", async (req, res) => {
    try {

        const data = await fetchWithCache(
            "players",
            "https://api.pandascore.co/csgo/players?per_page=12"
        );

        res.json(data);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// Match Details
// =========================
app.get("/api/match/:id", async (req, res) => {
    try {

        const data = await fetchWithCache(
            `match-${req.params.id}`,
            `https://api.pandascore.co/csgo/matches/${req.params.id}`
        );

        res.json(data);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// =========================
// Team Details
// =========================
app.get("/api/team/:id", async (req, res) => {
    try {

        const data = await fetchWithCache(
            `team-${req.params.id}`,
            `https://api.pandascore.co/csgo/teams/${req.params.id}`
        );

        res.json(data);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});