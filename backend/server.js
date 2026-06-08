require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());

const TOKEN = process.env.PANDASCORE_TOKEN;

// Live matches
app.get("/api/live", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.pandascore.co/csgo/matches/running",
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: err.message
        });
    }
});

// Upcoming matches
app.get("/api/upcoming", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.pandascore.co/csgo/matches/upcoming?per_page=8&sort=scheduled_at",
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: err.message
        });
    }
});

// Past matches
app.get("/api/results", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.pandascore.co/csgo/matches/past?per_page=20&sort=-scheduled_at",
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: err.message
        });
    }
});

// Teams
app.get("/api/teams", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.pandascore.co/csgo/teams?per_page=20",
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: err.message
        });
    }
});

// Players
app.get("/api/players", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.pandascore.co/csgo/players?per_page=12",
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: err.message
        });
    }
});

// Match Details
app.get("/api/match/:id", async (req, res) => {
    try {
        const matchId = req.params.id;

        const response = await axios.get(
            `https://api.pandascore.co/csgo/matches/${matchId}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: err.message
        });
    }
});

app.get("/api/team/:id", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.pandascore.co/csgo/teams/${req.params.id}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: err.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});