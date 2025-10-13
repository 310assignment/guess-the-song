import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { socket } from '../socket';
import CopyButton from '../components/CopyButton';
import "../css/WaitingRoom.css"; 


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
  
  const [players, setPlayers] = useState<string[]>([]);
  const [amountOfPlayersInRoom, setAmountOfPlayersInRoom] = useState(0);

  // If a player joins mid-round, keep them in this waiting room and show banner
  const [activeGameInfo, setActiveGameInfo] = useState<any | null>(null);
  // Keep a ref so socket handlers always use the latest settings
  const activeGameInfoRef = useRef<any | null>(null);

  useEffect(() => {
    if (!socket?.connected) return;

    socket.emit("join", { code, playerName });

    socket.on("join-error", ({ message }) => {
      alert(message);
      navigate('/lobby', { state: { playerName } });
    });

    socket.on("join-success", ({ players: roomPlayers, amountOfPlayersInRoom }) => {
      setPlayers(roomPlayers);
      setAmountOfPlayersInRoom(amountOfPlayersInRoom);
    });

    // Add this handler for joining active games
    socket.on("join-active-game", (gameSettings) => {
      // If a round is active, keep the joining client in the waiting room and show banner.
      // Store the full game settings so we can merge them with subsequent round events.
      if (gameSettings?.isRoundActive) {
        setActiveGameInfo(gameSettings);
        activeGameInfoRef.current = gameSettings;
      } else {
        // If not mid-round, navigate straight into the room with full settings
        navigate(`/room/${code}`, {
          state: {
            ...gameSettings,
            playerName,
            isHost: false
          }
        });
      }
    });

    socket.on("game-started", (settings) => {  
      navigate(`/room/${code}`, {
        state: {
          ...settings,
          playerName,
          isHost
        }
      });
    });

    // If host starts a round while this client is waiting, navigate into the round
    socket.on("round-start", (roundData) => {
      const settings = activeGameInfoRef.current || {};
     // Prefer an explicit round number from the round payload, otherwise fall back to stored settings
     const roundNumber =
       roundData?.roundNumber ??
       roundData?.currentRound ??
       settings?.currentRound ??
       settings?.roundNumber ??
       1;
      navigate(`/room/${code}`, {
        state: {
          ...settings,
          ...roundData,
          currentRound: roundNumber,
          playerName,
          isHost: false
        }
      });
    });
    
    // If host continues to next round, also navigate waiting players in
    socket.on("continue-to-next-round", ({ nextRound }) => {
      const settings = activeGameInfoRef.current || {};
      navigate(`/room/${code}`, {
        state: {
          ...settings,
          playerName,
          isHost: false,
          nextRound
        }
      });
    });

    return () => {
      socket.off('join-error');
      socket.off('join-success');
      socket.off('join-active-game'); 
      socket.off('game-started');
      socket.off('round-start');
      socket.off('continue-to-next-round');
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

        {activeGameInfo && (
          <div className="active-game-banner">
            <p>Game in progress. Please wait for the host to finish the round.</p>
            <p>Current Round: {activeGameInfo.currentRound ?? "?"}</p>
          </div>
        )}

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
              {players.map((player, index) => (
                <li key={index} className={`player-item ${player === playerName ? 'current-player' : ''}`}>
                  {player} {player === playerName && isHost ? '(Host)' : ''}
                </li>
              ))}
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