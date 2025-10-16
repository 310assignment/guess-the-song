# Guess The Song!

_A real-time multiplayer music guessing game built with Deezer_

[GitHub Repository](https://github.com/310assignment/guess-the-song)

> Developed as part of the University of Auckland SOFTENG 310 Assignment 1 (Semester 2, 2025)
> **Team: Butter** | Members: Eddie Kim, Lucas Jung, Caleb Jung, Jaeha Chang, Kevin Kim, Andrew Jeon

## What does this project do?

**Guess The Song!** is a web-based, real-time multiplayer game where players listen to short song previews and try to guess either the song title or artist as quickly as possible. It's built to make music discovery fun, social, and competitive.

### Features included in part 1

- Audio preview guessing
- Song caching and preview fetching from Deezer
- Timed guessing and scoring
- Selecting game mode and difficulty

---

## Why is this project useful?

- Promotes interactive music discovery in a playful environment
- Demonstrates how to build a full-stack real-time web application
- Provides a fun way to discover new music with friends
- Showcases modern web development technologies

---

## How do I get started?

### Prerequisites

- Node.js (v20 or higher) & npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/310assignment/guess-the-song
   cd guess-the-song
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   npm install react-use
   npm install react-confetti
   ```

3. **Set up environment variables**

   Create `.env` files in both `backend` directory and root directory of the project

   **server/.env:**

   ```env
   PORT=8080
   CACHE_TTL_MINUTES=30
   ```

   **root/.env:**

   ```env
   VITE_API_BASE_URL = "http://localhost:8080/"
   ```

### Running Locally

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend (in another terminal)**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   
   Navigate to `http://localhost:8080`

### Running Multiplayer Mode

**⚠️ Important Note:** This multiplayer mode utilizes your IP address and only works if all users are connected to the same WiFi network. This is not a secure connection and should only be used in trusted environments.

1. **As Host, Identify your IP Address**
   
    On MacOs, run: `ifconfig` in terminal. <br>
    On Windows, run: `ipconfig` in terminal. <br>
    Obtain your IP address, it should resemble: `inet 172.23.26.228`<br>
    In the following steps your IP address will be reffered to as "YOUR_IP_ADDRESS"

3. **Configure your URL**
   
   Your URL will be: `http://YOUR_IP_ADDRESS:8080`

5. **Start the Backend server**

   ```bash
   cd backend
   npm run dev
   ```

6. **Start the Frontend (in another terminal)**

     For MacOs users:
      ```bash
      cd frontend
      export VITE_API_BASE_URL=http://YOUR_IP_ADDRESS:8080
      export VITE_SOCKET_URL=http://YOUR_IP_ADDRESS:8080
      npm run dev
      ```
     For Windows users:
      ```bash
      cd frontend
      set VITE_API_BASE_URL=http://YOUR_IP_ADDRESS:8080
      set VITE_SOCKET_URL=http://YOUR_IP_ADDRESS:8080
      npm run dev
      ```
     *Note: You can check to see whether these have been set using these commands:
     ```bash
     echo $VITE_API_BASE_URL
     echo $VITE_SOCKET_URL
     ```
   
     In your Frontend terminal you should see the appropriate links eg.
     ```bash
     ➜  Local:   http://localhost:5173/
     ➜  Network: http://172.23.38.47:5173/
     ```

5. **Playing the Game**
   
     You can play on either the local URL or the Network URL. <br>
     When asking other players to join, refer them to the Network Link.

### Testing & Deployment

**Testing:**

```bash
# Run tests (when implemented)
npm run test
```

**Deployment:**

- Application is in development - Has not been deployed yet

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

### v0.1.0 – A1 Release

**Current Features:**

- Single-player mode
- Guess from single audio or mixed previews
- Timed guessing and scoring
- Song caching and preview fetching from Deezer (Genre set to K-pop)
- Game settings and customisation
- Final results and winner display

### v0.2.0 – A2 Releases

**New Features:**

- Live multiplayer support using Socket.io
- Game rooms and lobbies
- Waiting room page for multiplayer sessions
- Host permissions (e.g., host can manage rounds and skip songs)
- Avatar customisation so players can represent themselves as a chosen character
- New music genres: K-pop, Pop, Hip-Hop, Karaoke Hits, R&B, Top Hits
- New game modes: Single Song, Mixed Songs, Guess the Artist, Reverse Song, Quick Guess)
- Leaderboard podium animation at the end of games
- Enhanced UI/UX improvements

**Changes:**
- Removed the plans for user authentication/login system
  - We decided to remove login/user accounts to preserve the casual, drop-in nature of the game. Keeping the experience quick and accessible better fits the intended gameplay flow.
 
**Fixes & Improvements:**
- General bug fixes and performance optimizations

---

## Where can I get more help?

- **GitHub Wiki** - Meeting minutes, contributor list, additional usage guides
- **Issues** - Submit bugs and feature requests
- **Team Contact** - For technical help, contact the team via GitHub
- **Email** - Reach out to team members directly

---

## Tech Stack

**Frontend:**

- React.js
- HTML/CSS/TypeScript
- Socket.IO Client (not yet implemented)

**Backend:**

- Node.js
- Express.js
- Socket.IO Server (not yet implemented)
- PostgreSQL (not yet implemented)

**APIs & Services:**

- Deezer API
- Real-time communication via WebSockets (not yet implemented)

---

## Contributing

We welcome contributions! Please see our Contributing Guidelines for details on how to submit pull requests, report bugs, and suggest new features.

---

_Made by Team Butter_
