//entry point for the Express server
// This file sets up the server, handles routes, and integrates with the Deezer API client

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import trackRoutes from "./routes/trackRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { console } from "inspector";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.disable("x-powered-by");

// K-Pop endpoints
app.use("/api/tracks", trackRoutes);

// tiny error handler
app.use((err, _req, res, _next) => {
  const status = err?.response?.status || 502;
  const msg =
    err?.response?.data?.error?.message || err?.message || "Upstream error";
  res.status(status).json({ error: msg });
});

const port = process.env.PORT || 8080;

// create HTTP server
const httpServer = createServer(app);

// attach Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow React frontend
    methods: ["GET", "POST"],
  },
});

// Store room data
const rooms = new Map();
const playerRooms = new Map();

// Helper function to initialize player score data
const initializePlayerScore = (playerName, avatar = null) => ({
  name: playerName,
  avatar: avatar || null, // { id, color } or simple string id
  points: 0,
  previousPoints: 0,
  correctAnswers: 0,
});

function handlePlayerLeaving(socket) {
  const roomCode = socket.roomCode || playerRooms.get(socket.id);
  if (!roomCode) return;

  const room = rooms.get(roomCode);
  if (!room) return;

  const playerName = socket.playerName;
  const playerIndex = room.players.indexOf(playerName);

  if (playerIndex === -1) return; // Player not in room

  console.log(`${playerName} leaving room ${roomCode}`);

  // Store if this player was the host
  const wasHost = room.host === playerName;

  // Remove player from room
  room.players.splice(playerIndex, 1);

  // Remove from player scores
  if (room.playerScores && room.playerScores.has(playerName)) {
    room.playerScores.delete(playerName);
  }

  // Remove from finished players if present
  if (room.finishedPlayers && room.finishedPlayers.has(playerName)) {
    room.finishedPlayers.delete(playerName);
  }

  // Clean up tracking
  playerRooms.delete(socket.id);
  delete socket.playerName;
  delete socket.roomCode;

  // If no players left, delete the room
  if (room.players.length === 0) {
    rooms.delete(roomCode);
    console.log(`Room ${roomCode} deleted - no players remaining`);
    return;
  }

  // Handle host transfer if the leaving player was the host
  if (wasHost && room.players.length > 0) {
    const newHostName = room.players[0]; // Make first remaining player the host
    room.host = newHostName;

    // Find the new host's socket ID
    const newHostSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.playerName === newHostName && s.roomCode === roomCode
    );

    if (newHostSocket) {
      room.hostSocketId = newHostSocket.id;
    }

    console.log(
      `Host transfer: ${newHostName} is now the host of room ${roomCode}`
    );

    // Notify all players of host change
    io.to(roomCode).emit("hostChanged", {
      newHost: newHostName,
      newHostId: newHostSocket?.id,
      message: `${newHostName} is now the host`,
    });
  }

  // Update remaining players count for clients
  const remaining = Math.max(
    0,
    room.players.length - (room.finishedPlayers ? room.finishedPlayers.size : 0)
  );

  // Notify remaining players that someone left
  io.to(roomCode).emit("playerLeft", {
    playerName: playerName,
    remainingPlayers: room.players,
    newHost: room.host, // Include current host info
    message: `${playerName} left the game`,
  });

  // Update players list with host info
  const playersWithHost = Array.from(room.playerScores.values()).map(
    (player) => ({
      ...player,
      isHost: player.name === room.host,
    })
  );

  io.to(roomCode).emit("players-updated", {
    players: room.players,
    playerScores: playersWithHost,
    maxPlayers: room.maxPlayers,
    host: room.host,
  });

  // Send updated scores to remaining players
  if (room.playerScores && room.playerScores.size > 0) {
    const allScores = playersWithHost;
    io.to(roomCode).emit("score-update", allScores);
    io.to(roomCode).emit("room-players-scores", allScores);
  }

  console.log(
    `${playerName} left room ${roomCode}. New host: ${room.host}. Remaining players:`,
    room.players
  );
}

//  handle connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("create-room", ({ code, settings, host, avatar }) => {
    socket.join(code);

    // Initialize room if it doesn't exist (with default settings)
    if (!rooms.has(code)) {
      console.log(`Creating new room ${code} with settings:`, settings);
      const room = {
        players: [],
        playerScores: new Map(), // Store player scores: playerName -> score object
        maxPlayers: settings.amountOfPlayers || 8, // default max players
        settings,
        host: host, // store host name
        hostSocketId: socket.id, // store host socket ID
        // New round state tracking
        currentRound: 1,
        isRoundActive: false,
        isIntermission: false,
        roundStartTime: null,
        finishedPlayers: new Set(),
      };
      rooms.set(code, room);

      // For single player mode, automatically add the host to the room
      if (settings.amountOfPlayers === 1) {
        room.players.push(host);
        // host avatar may be provided as separate param
        const hostAvatar = avatar || null;
        room.playerScores.set(host, initializePlayerScore(host, hostAvatar));
        console.log(
          `Single player mode: ${host} automatically joined room ${code}`
        );
      }

      socket.emit("room-created", {
        code,
        rooms: Object.fromEntries(rooms.entries()),
      });
    }
  });

  // join room event
  socket.on("join", ({ code, playerName, avatar }) => {
    console.log(`${playerName} attempting to join room ${code}`);

    socket.join(code);

    const room = rooms.get(code);

    if (!room) {
      socket.emit("join-error", {
        message: `Room ${code} doesn't exist!`,
      });
      return;
    }

    // If this player is the host, update the host socket ID
    if (room.host === playerName) {
      room.hostSocketId = socket.id;
      console.log(`Host ${playerName} socket ID updated to ${socket.id}`);
    }

    // Check if room is full
    if (room.players.length >= room.maxPlayers) {
      console.log(
        `${playerName} tried to join full room ${code} (${room.players.length}/${room.maxPlayers})`
      );
      socket.emit("join-error", {
        message: `Room is full! (${room.players.length}/${room.maxPlayers} players)`,
      });
      return;
    }

    // Check for duplicate names
    if (room.players.includes(playerName)) {
      console.log(
        `${playerName} tried to join room ${code} but name already exists`
      );
      socket.emit("join-error", {
        message: `Player name "${playerName}" is already in this room!`,
      });
      return;
    }

    // Store player info for cleanup
    socket.playerName = playerName;
    socket.roomCode = code;
    playerRooms.set(socket.id, code); // Track the relationship

    // Add player to room
    room.players.push(playerName);

    // Initialize player score if not exists
    if (!room.playerScores) {
      room.playerScores = new Map();
    }
    if (!room.playerScores.has(playerName)) {
      room.playerScores.set(
        playerName,
        initializePlayerScore(playerName, avatar || null)
      );
    }

    console.log(
      `${playerName} joined room ${code}. Players (${room.players.length}/${room.maxPlayers}):`,
      room.players
    );

    // Also send updated scores if available
    if (room.playerScores && room.playerScores.size > 0) {
      const allScores = Array.from(room.playerScores.values());
      io.to(code).emit("score-update", allScores);
    }

    // Send success confirmation to the joining player
    io.to(code).emit("join-success", {
      roomCode: code,
      playerName,
      players: room.players,
      maxPlayers: room.maxPlayers,
      amountOfPlayersInRoom: room.settings.amountOfPlayers, // default to 8 if not set,
      playerScores: Array.from(room.playerScores.values()),
      host: room.host,
    });

    // Send current scores to the new player
    if (room.playerScores && room.playerScores.size > 0) {
      const allScores = Array.from(room.playerScores.values());
      socket.emit("score-update", allScores);
    }

    // Check if game is already active
    if (room.gameActive) {
      console.log(`${playerName} joining active game in room ${code} (Round ${room.currentRound})`);
      
      // Game is in progress - send them to waiting room with game info
      socket.emit("join-active-game", {
        ...room.settings,
        playerName,
        isHost: false,
        currentRound: room.currentRound || 1,
        isRoundActive: !!room.isRoundActive,
        isIntermission: !!room.isIntermission,
        roundStartTime: room.roundStartTime,
        players: room.players,
        playerScores: Array.from(room.playerScores.values()),
        host: room.host,
        gameActive: room.gameActive,
        // Include the current round data so they can join immediately if in intermission
        currentRoundData: room.currentRoundData
      });
      
      // Also notify other players that someone joined
      socket.to(code).emit("players-updated", {
        players: room.players,
        playerScores: Array.from(room.playerScores.values()),
        maxPlayers: room.maxPlayers,
        host: room.host,
      });
      
      return;
    } else {
      // Game hasn't started - normal waiting room flow
      socket.emit("join-success", {
        players: room.players,
        amountOfPlayersInRoom: room.maxPlayers,
        host: room.host,
      });
    }
  });

  socket.on("get-room-players-scores", (code) => {
    socket.join(code);

    const room = rooms.get(code);

    if (!room) {
      console.log(`Room ${code} doesn't exist when getting player scores`);
      socket.emit("room-players-scores", []);
      return;
    }

    io.to(code).emit(
      "room-players-scores",
      Array.from(room.playerScores.values()) || []
    );
  });

  socket.on("get-total-rounds", (code) => {
    socket.join(code);

    const room = rooms.get(code);

    if (!room) {
      console.log(`Room ${code} doesn't exist when getting total rounds`);
      socket.emit("total-rounds", 5); // default fallback
      return;
    }

    socket.emit("total-rounds", room.settings.rounds);
  });

  socket.on("get-rooms", (code) => {
    socket.join(code);

    io.to(code).emit("rooms", Object.fromEntries(rooms.entries()));
  });

  // Handle score updates from players
  socket.on("update-score", ({ code, playerName, points, correctAnswers }) => {
    console.log(`🔍 DEBUG Backend received update-score:`, {
      code,
      playerName,
      points,
      correctAnswers,
      pointsType: typeof points,
      correctAnswersType: typeof correctAnswers,
    });

    const room = rooms.get(code);
    if (!room || !room.playerScores) {
      console.log(
        `❌ DEBUG: Room not found or no playerScores for code: ${code}`
      );
      return;
    }

    const playerScore = room.playerScores.get(playerName);
    if (playerScore) {
      playerScore.points = points;
      playerScore.correctAnswers = correctAnswers;

      console.log(`🔍 DEBUG: After update - playerScore:`, playerScore);
      console.log(
        `Score updated for ${playerName}: ${points} points, ${correctAnswers} correct`
      );

      // Send updated scores to all players in the room
      const allScores = Array.from(room.playerScores.values());
      io.to(code).emit("score-update", allScores);
    }
  });

  // host starts game event
  socket.on("start-game", ({ code }) => {
    const room = rooms.get(code);
    if (room) {
      room.gameActive = true;
      // When game starts we consider the first round not yet active until host starts a round
      room.currentRound = 1;
      room.isRoundActive = false;
      room.isIntermission = true; // waiting for host to start round
      room.roundStartTime = null;

      const settings = room.settings;
      io.to(code).emit("game-started", { ...settings, host: room.host });
      console.log(`Game started in room ${code}`);
    }
  });

  // host distributes round data to all players
  socket.on(
    "host-start-round",
    ({
      code,
      song,
      choices,
      answer,
      startTime,
      songIndex,
      multiSongs,
      shuffleSeed,
    }) => {
      const room = rooms.get(code);
      if (!room) {
        console.log(`Host tried to start round in room ${code}`);
        return;
      }

      // Reset previousPoints for all players at the start of the round
      room.playerScores.forEach((playerScore) => {
        playerScore.previousPoints = playerScore.points;
      });

      // Mark the round active and store start time & ensure currentRound exists
      room.isRoundActive = true;
      room.isIntermission = false;
      room.roundStartTime = startTime || Date.now();
      room.gameActive = true;
      // Ensure currentRound defaults to 1 if undefined
      room.currentRound = room.currentRound || 1;

      // reset finished players for this round
      room.finishedPlayers = new Set();

      // Persist the full current round payload so late joiners can request it
      room.currentRoundData = {
        song,
        choices,
        answer,
        songIndex,
        multiSongs,
        shuffleSeed,
      };

      console.log(
        `Host starting round ${room.currentRound} in room ${code} with song:`,
        song?.title
      );

      // Send round data to all players in the room and include authoritative currentRound
      io.to(code).emit("round-start", {
        song,
        choices,
        answer,
        startTime: room.roundStartTime,
        songIndex,
        multiSongs,
        shuffleSeed,
        currentRound: room.currentRound,
        // Include additional data for players who joined mid-game
        ...room.settings,
        players: room.players,
        playerScores: Array.from(room.playerScores.values()),
        host: room.host,
        isRoundActive: true,
        isIntermission: false,
        gameActive: true
      });

      // Broadcast initial finished state (everyone remaining)
      const remaining = room.players.length - room.finishedPlayers.size;
      io.to(code).emit("player-finished-updated", {
        remaining,
        finishedCount: room.finishedPlayers.size,
      });
    }
  );

  // Track individual players finishing the round
  socket.on("player-finished-round", ({ code, playerName }) => {
    const room = rooms.get(code);
    if (!room) return;
    if (!room.finishedPlayers) room.finishedPlayers = new Set();
    room.finishedPlayers.add(playerName);
    const remaining = Math.max(
      0,
      room.players.length - room.finishedPlayers.size
    );
    io.to(code).emit("player-finished-updated", {
      remaining,
      finishedCount: room.finishedPlayers.size,
    });
    console.log(
      `Player finished in room ${code}: ${playerName} (remaining ${remaining})`
    );
  });

  socket.on("host-skip-round", ({ code }) => {
    const room = rooms.get(code);
    if (
      room &&
      (room.hostSocketId === socket.id || room.host === socket.playerName)
    ) {
      // Host skipped - notify all players in the room to show leaderboard
      io.to(code).emit("host-skipped-round");
      console.log(`Host skipped round in room ${code}`);

      // mark everyone finished for this round
      room.finishedPlayers = new Set(room.players);
      io.to(code).emit("player-finished-updated", {
        remaining: 0,
        finishedCount: room.players.length,
      });
    } else {
      console.log(
        `Non-host tried to skip in room ${code}. Socket ID: ${socket.id}, Host Socket ID: ${room?.hostSocketId}`
      );
    }
  });

  // Handle host continuing to next round
  socket.on("host-continue-round", ({ code, nextRound, totalRounds }) => {
    console.log(`Host in room ${code} continuing to round ${nextRound}`);
    const room = rooms.get(code);
    if (room) {
      // update authoritative round state on server
      room.currentRound = nextRound;
      room.isRoundActive = true;
      room.isIntermission = false;
      room.roundStartTime = Date.now();
      // reset finished players for new round
      room.finishedPlayers = new Set();
    }

    // Emit to all players in the room (including host and any mid-game joiners)
    const roundData = {
      nextRound,
      currentRound: nextRound,
      ...room.settings,
      players: room.players,
      playerScores: Array.from(room.playerScores.values()),
      host: room.host,
      isRoundActive: true,
      isIntermission: false,
      roundStartTime: room.roundStartTime
    };

    io.to(code).emit("continue-to-next-round", roundData);
  });

  // Handle host ending the game
  socket.on("host-end-game", ({ code }) => {
    console.log(`Host in room ${code} ending the game`);

    // Navigate all players to end game page
    socket.to(code).emit("navigate-to-end-game");
    socket.emit("navigate-to-end-game"); // Also send to host
  });

  // Allow late-joiners / recovered clients to ask for the current round payload
  socket.on("get-current-round", (code) => {
    socket.join(code);
    const room = rooms.get(code);
    if (!room || !room.currentRoundData) {
      // No active round to recover
      socket.emit("current-round", null);
      return;
    }

    const payload = {
      ...room.currentRoundData,
      currentRound: room.currentRound || 1,
      startTime: room.roundStartTime || Date.now(),
    };

    console.log(`Providing current-round to ${socket.id} for room ${code}:`, {
      currentRound: payload.currentRound,
      song: payload.song?.title,
    });
    socket.emit("current-round", payload);
  });

  socket.on("leaveRoom", () => {
    handlePlayerLeaving(socket);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    handlePlayerLeaving(socket);
  });
});

httpServer.listen(port, "0.0.0.0", () => {});
