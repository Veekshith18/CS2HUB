# 🎮 CS2Hub – Full Stack Counter-Strike 2 Esports Analytics Platform

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge)

---

# 🌐 Live Demo

### 🔗 Frontend
https://cs-2-hub-five.vercel.app

### 🔗 Backend API
https://cs2hub-backend.onrender.com

### 📂 GitHub Repository
https://github.com/Veekshith18/CS2HUB

---

# 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Request Flow](#-request-flow)
- [API Endpoints](#-api-endpoints)
- [Engineering Highlights](#-engineering-highlights)
- [Challenges](#-challenges)
- [Running Locally](#-running-locally)
- [Future Improvements](#-future-improvements)
- [Developer](#-developer)

---

# 📌 Overview

CS2Hub is a **full-stack Counter-Strike 2 esports analytics platform** inspired by professional esports websites like **HLTV** and **VLR.gg**.

It provides users with:

- Upcoming match schedules
- Match results
- Team rankings
- Team profiles
- Player profiles
- Tournament information
- Global search
- Responsive UI

The project uses an **Express.js backend** to securely communicate with the PandaScore API while keeping API keys hidden from the client.

To improve backend efficiency, **server-side caching using node-cache** has been implemented, reducing redundant API requests and improving response time.

---

# ✨ Features

| Feature | Status |
|----------|--------|
| Upcoming Matches | ✅ |
| Match Results | ✅ |
| Team Rankings | ✅ |
| Team Profiles | ✅ |
| Player Profiles | ✅ |
| Tournament Pages | ✅ |
| Match Details | ✅ |
| Global Search | ✅ |
| Responsive Design | ✅ |
| Express.js Backend Proxy | ✅ |
| Secure Environment Variables | ✅ |
| Server-side Response Caching | ✅ |

---

# 🖼️ Screenshots

## 🏠 Home – Live Matches

![Home](screenshots/home-live-matches.png)

---

## 🎮 Match Details

![Match Details](screenshots/match-details-modal.png)

---

## 🌍 Team Rankings

![Rankings](screenshots/rankings-page.png)

---

## 👥 Team Profile

![Team Profile](screenshots/team-profile-modal.png)

---

## 👤 Player Profile

![Player Profile](screenshots/player-profile-modal.png)

---

## 🎯 Players Page

![Players](screenshots/players-page.png)

---

## 🏆 Tournament Page

![Tournament](screenshots/tournaments-page.png)

---

## 🔍 Global Search

![Global Search](screenshots/global-search.png)

---

## 📱 Mobile Responsive Design

![Mobile](screenshots/mobile-view.png)

---

# 🛠️ Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES6)
- Fetch API

## Backend

- Node.js
- Express.js
- node-cache

## API

- PandaScore API

## Deployment

- Vercel
- Render

## Version Control

- Git
- GitHub

---

# 🏗️ Project Architecture

```
CS2Hub
│
├── backend
│   ├── server.js
│   ├── package.json
│   ├── prisma/
│   ├── .env
│   └── .gitignore
│
├── css
│   └── style.css
│
├── js
│   └── script.js
│
├── screenshots
│
├── index.html
│
└── README.md
```

---

# 🔄 Request Flow

```
Browser
    │
    ▼
Frontend (HTML/CSS/JavaScript)
    │
Fetch API
    ▼
Express.js Backend
    │
Check Cache
    │
├── Cache Hit
│      │
│      ▼
│ Return Cached JSON
│
└── Cache Miss
       │
       ▼
 PandaScore API
       │
       ▼
Store Response in Cache
       │
       ▼
Return JSON to Frontend
       │
       ▼
Update UI
```

---

# 📡 API Endpoints

| Endpoint | Description |
|-----------|-------------|
| GET /api/upcoming | Upcoming matches |
| GET /api/results | Match results |
| GET /api/teams | Teams list |
| GET /api/players | Players list |
| GET /api/team/:id | Team details |
| GET /api/match/:id | Match details |

---

# 💡 Engineering Highlights

- Built a secure Express.js backend proxy to protect PandaScore API credentials.
- Implemented **server-side response caching** using **node-cache** to reduce redundant API requests and improve backend performance.
- Developed reusable UI components for matches, players, teams, and tournaments.
- Implemented asynchronous API communication using Fetch API.
- Designed a fully responsive user interface for desktop and mobile devices.
- Organized frontend and backend into modular components for maintainability.
- Deployed the frontend on **Vercel** and backend on **Render**.

---

# 🚧 Challenges

- Protecting API keys from exposure in the frontend.
- Handling PandaScore API rate limits.
- Implementing server-side caching for improved performance.
- Managing asynchronous API requests and error handling.
- Building reusable UI components across multiple pages.
- Ensuring responsive layouts across different screen sizes.

---

# 🚀 Running Locally

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Veekshith18/CS2HUB.git
```

## 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

## 3️⃣ Create `.env`

```env
PANDASCORE_TOKEN=YOUR_PANDASCORE_API_KEY
```

## 4️⃣ Start Backend

```bash
npm start
```

## 5️⃣ Start Frontend

Open `index.html` using Live Server or any browser.

---

# 🔮 Future Improvements

- User authentication
- Favorite teams and players
- Match notifications
- Historical player analytics
- Redis-based distributed caching
- Dark/Light mode
- Advanced tournament analytics
- Additional esports titles

---

# 👨‍💻 Developer

**Swarnapudi Veekshith**

- GitHub: https://github.com/Veekshith18
- LinkedIn: *(Add your LinkedIn URL here)*

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!