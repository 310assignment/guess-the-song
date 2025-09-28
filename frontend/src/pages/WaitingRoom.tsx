import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const url = import.meta.env.VITE_SOCKET_URL;
console.log('VITE ENV SOCKET URL:', url);

const WaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { code } = useParams<{ code: string }>();
  
  const state = location.state as {
    playerName?: string;
    isHost?: boolean;
    socketId?: string;
  };

  // console.log("WaitingRoom state:", state);
  
  const playerName = state?.playerName || "Player";
  const isHost = state?.isHost || false;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [amountOfPlayersInRoom, setAmountOfPlayersInRoom] = useState(0);


  useEffect(() => {

    console.log('HERE')

    const socketUrl = "http://localhost:8080";
    const newSocket = io(socketUrl);
    setSocket(newSocket);
    newSocket.emit("join", { code, playerName });

    // Listen for updated player list (includes all current players)
    newSocket.on("players-updated", ({ players: updatedPlayers }) => {
      console.log("👥 Players updated:", updatedPlayers);
      setPlayers(updatedPlayers);
    });

    // Handle join errors (room full, duplicate name, etc.)
    newSocket.on("join-error", ({ message }) => {
      console.log("❌ Join error:", message);
      alert(message);
      // Navigate back to lobby
      navigate('/lobby', { state: { playerName } });
    });

    // Handle successful join
    newSocket.on("join-success", ({ roomCode, playerName: joinedPlayer, players: roomPlayers, amountOfPlayersInRoom }) => {
      console.log("✅ Successfully joined room:", roomCode, "as", joinedPlayer);
      console.log("Room players:", roomPlayers);
      console.log("Amount of players in room:", amountOfPlayersInRoom);

      setAmountOfPlayersInRoom(amountOfPlayersInRoom);
    });

    newSocket.on("game-started", (gameSettings) => {
      setGameStarted(true);
      // Navigate to actual game with settings
      navigate(`/room/${code}`, {
        state: {
          ...gameSettings,
          playerName,
          isHost: false
        }
      });
    });

    // Handle connection events
    newSocket.on("connect", () => {
      console.log("🔌 Connected to server with ID:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Disconnected from server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [code, playerName, navigate]);

  const handleStartGame = () => {
    //TODO: Validate enough players, settings, etc.
    if (socket && isHost) {
      // Host starts the game with default settings
      const gameSettings = {
        players: "Multiplayer",
        guessType: "Guess Song", 
        gameMode: "Single Song",
        rounds: "10 Rounds",
        guessTime: "30 sec",
      };
      
      console.log("Host starting game with settings:", gameSettings);
      socket.emit("start-game", { code, settings: gameSettings });
      
      // Navigate host to game immediately
      navigate(`/room/${code}`, {
        state: {
          ...gameSettings,
          playerName,
          isHost: true
        }
      });
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#9191e9ff', 
      color: 'black', 
      width: '100vw',
      height: '100vh',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1> Waiting Room </h1>
        
        <div style={{ 
          backgroundColor: '#b8b8f1ff', 
          padding: '20px', 
          borderRadius: '10px', 
          margin: '20px 0' 
        }}>
          <h2>Room: {code}</h2>
          <p><strong>You:</strong> {playerName}</p>
        </div>

        <div style={{ 
          backgroundColor: '#aaaae8ff', 
          padding: '20px', 
          borderRadius: '10px', 
          margin: '20px 0' 
        }}>
          <h3>Players in Room ({players.length}/{amountOfPlayersInRoom}):</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {players.map((player, index) => (
              <li key={index} style={{ 
                padding: '8px', 
                backgroundColor: '#7e7eb7ff', 
                margin: '5px 0', 
                borderRadius: '5px' 
              }}>
                {player} {player === playerName && isHost ? '(Host)' : ''}
              </li>
            ))}
          </ul>
        </div>

        {isHost ? (
          <div>
            <p>You are the host! Start the game when everyone has joined.</p>
            <button 
              onClick={handleStartGame}
              style={{
                padding: '15px 30px',
                backgroundColor: '#e94560',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              START GAME
            </button>
          </div>
        ) : (
          <div>
            <p>Waiting for host to start the game...</p>
            <div style={{ fontSize: '24px' }}>⏳</div>
          </div>
        )}

        <button 
          onClick={() => navigate('/lobby', { state: { playerName } })}
          style={{
            padding: '30px 50px',
            backgroundColor: '#ffffffff',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            marginTop: '20px',
            cursor: 'pointer'
          }}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;
