import React, { useState, useEffect } from "react";
import Avatar1 from "../assets/avatars/avatar1.png";
import Avatar2 from "../assets/avatars/avatar2.png";
import Avatar3 from "../assets/avatars/avatar3.png";
import defaultAvatar from "../assets/avatars/avatar1.png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { socket } from '../socket';
import CopyButton from '../components/CopyButton';
import "../css/WaitingRoom.css"; 

interface PlayerObj {
  name: string;
  points?: number;
  previousPoints?: number;
  correctAnswers?: number;
  avatar?: { id?: string; color?: string } | string;
}

const WaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { code } = useParams<{ code: string }>();
  
  const state = location.state as {
    playerName?: string;
    isHost?: boolean;
    socketId?: string;
  };
  
  const playerName = state?.playerName || "Player";
  const isHost = state?.isHost || false;
  
  const [players, setPlayers] = useState<PlayerObj[]>([]);
  const [amountOfPlayersInRoom, setAmountOfPlayersInRoom] = useState(0);

  useEffect(() => {

    if (!socket?.connected) return;

    const avatarId = localStorage.getItem("avatarId") || "a1";
    const avatarColor = localStorage.getItem("avatarColor") || "#FFD166";
    socket.emit("join", { code, playerName, avatar: { id: avatarId, color: avatarColor } });

    socket.on("join-error", ({ message }) => {
      alert(message);
      // Navigate back to lobby
      navigate('/lobby', { state: { playerName } });
    });

    // Handle successful join
    socket.on("join-success", ({ playerScores, amountOfPlayersInRoom }) => {
      // server sends full player score objects; use them to render avatars and names
      if (Array.isArray(playerScores)) {
        setPlayers(playerScores);
      }
      setAmountOfPlayersInRoom(amountOfPlayersInRoom);
    });

    socket.on("game-started", ( settings ) => {  

      // Navigate to actual game 
      navigate(`/room/${code}`, {
        state: {
          ...settings,
          playerName,
          isHost
        }
      });
    });

    return () => {
      socket.off('join-error');
      socket.off('join-success');
      socket.off('game-started');
    };
  }, [code, playerName, navigate]);

  const handleStartGame = () => {
    // Basic validation: check if we have at least one player and socket connection
    if (socket && isHost && players.length > 0) {
      socket.emit("start-game", { code });
    }
  };
  return (
    <div className="waiting-room-container">
      <div className="gradient">
        <h1 className="waiting-room-title">Waiting Room</h1>
        <div className="room-code-section">
          <h2>Room Code: {code}</h2>
          <CopyButton textToCopy={code || ''} />
        </div>
      </div>
      <div className="waiting-room-content">

        <div className={`players-list-section ${amountOfPlayersInRoom === 1 ? 'single-player-mode' : ''}`}>
          <h2>{amountOfPlayersInRoom === 1 ? 'Single Player Mode' : `Players in Room - ${players.length} of ${amountOfPlayersInRoom}`}</h2>
          {amountOfPlayersInRoom === 1 ? (
            <div className="single-player">
              <div className={`player-item ${players[0] === playerName ? 'current-player' : ''}`}>
                {players[0]} {players[0] === playerName && isHost ? '(Host)' : ''}
              </div>
            </div>
          ) : (
            <ul className="players-list">
              {players.map((player) => {
                const avatarId = typeof player.avatar === "string" ? player.avatar : (player.avatar?.id || "a1");
                const avatarSrc = avatarId === "a2" ? Avatar2 : avatarId === "a3" ? Avatar3 : Avatar1;
                return (
                  <li key={player.name} className={`player-item ${player.name === playerName ? 'current-player' : ''}`}>
                    <div style={{
                      width: 36,
                      height: 36,
                      marginRight: 8,
                      borderRadius: "50%",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: (typeof player.avatar === 'object' && player.avatar?.color) ? player.avatar.color : 'transparent'
                    }}>
                      <img src={avatarSrc} alt={`${player.name} avatar`} style={{ width: 28, height: 28, borderRadius: "50%" }} />
                    </div>
                    {player.name} {player.name === playerName && isHost ? '(Host)' : ''}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className={`buttons-section ${amountOfPlayersInRoom === 1 ? 'single-player-mode' : ''}`}>
          <button 
            onClick={() => navigate('/lobby', { state: { playerName } })}
            className="leave-room-button"
            >
            Leave Room
          </button>
          {isHost ? (
              <button onClick={handleStartGame} className="start-game-button">
                START GAME
              </button>  
          ) : (
            <div className="waiting-section">
              <p>Waiting for host...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;