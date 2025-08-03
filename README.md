# Guess The Song!
*A real-time multiplayer music guessing game built with Spotify*

[GitHub Repository](https://github.com/310assignment/guess-the-song)
> Developed as part of the University of Auckland SOFTENG 310 Assignment 1 (Semester 2, 2025)
> **Team: Butter** | Members: Eddie Kim, Lucas Jung, Caleb Jung, Jaeha Chang, Kevin Kim, Andrew Jeon

## What does this project do?

**Guess The Song!** is a web-based, real-time multiplayer game where players listen/read short song previews and try to guess either the song title or artist as quickly as possible. It's built to make music discovery fun, social, and competitive.

### Features
- Audio preview guessing
- Lyric-based guessing  
- Real-time multiplayer gameplay
- Live scoreboard via Socket.IO
- Song caching and preview fetching from Spotify
- Timed guessing and scoring

---

## Why is this project useful?

* Promotes interactive music discovery in a playful environment
* Demonstrates how to build a full-stack real-time web application
* Provides a fun way to discover new music with friends
* Showcases modern web development technologies

---

## How do I get started?

### Prerequisites
* Node.js (v18 or higher) & npm
* Spotify Developer Account + API Key
* PostgreSQL database (or Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/310assignment/guess-the-song
   cd guess-the-song
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in both `client` and `server` directories:

   **server/.env:**
   ```env
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   DATABASE_URL=your_postgres_connection_string
   PORT=3001
   ```

   **client/.env:**
   ```env
   REACT_APP_API_URL=http://localhost:3001
   ```

4. **Set up your Spotify API credentials**
   - Go to Spotify Developer Dashboard
   - Create a new application
   - Add `http://localhost:3000/callback` to your redirect URIs
   - Copy your Client ID and Client Secret to your `.env` file

### Running Locally

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend (in another terminal)**
   ```bash
   cd client
   npm start
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

### Testing & Deployment

**Testing:**
```bash
# Run tests (when implemented)
npm test
```

**Deployment:**
- **Frontend**: Vercel
- **Backend**: Railway or Render

---

## How can the software be used?

This project is released under the **MIT License**. You're free to:
- Use, modify, and distribute the software
- Use it for commercial purposes
- Modify and distribute modified versions
- Use it privately

**Requirements:**
- Preserve the original license and copyright notices
- Include a copy of the MIT License in your distribution

---

## What versions are available?

### v0.1.0 – A1 Milestone Release
**Current Features:**
* Guess from audio, lyrics, or mixed previews
* Timed guessing and scoring
* Live scoreboard via Socket.IO
* Song caching and preview fetching from Spotify
* Game settings and customization

### Future A2 Releases
**Planned Features:**
* Game rooms and lobbies
* User authentication
* Final results and winner display
* Leaderboards and statistics
* Enhanced UI/UX improvements

---

## Where can I get more help?

* **GitHub Wiki** - Meeting minutes, contributor list, additional usage guides
* **Issues** - Submit bugs and feature requests
* **Team Contact** - For technical help, contact the team via GitHub
* **Email** - Reach out to team members directly

---

## Tech Stack

**Frontend:**
- React.js
- Socket.IO Client
- HTML/CSS/JavaScript

**Backend:**
- Node.js
- Express.js
- Socket.IO Server
- PostgreSQL

**APIs & Services:**
- Spotify Web API
- Real-time communication via WebSockets

---

## Contributing

We welcome contributions! Please see our Contributing Guidelines for details on how to submit pull requests, report bugs, and suggest new features.

---

*Made with ❤️ by Team Butter*
