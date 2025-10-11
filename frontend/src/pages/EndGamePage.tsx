import '../css/EndGamePage.css';
import Leaderboard from "../components/Leaderboard";
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { socket } from '../socket';


/**
 * Represents the result of a player at the end of the game.
 */
interface PlayerResult {
  name: string;
  points: number;
  correctAnswers: number;
  totalRounds: number;
}

/**
 * EndGamePage - displays the final leaderboard and a button to return to the lobby.
 */
const EndGamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [ totalRounds, setTotalRounds ] = useState(0);
  const code: string = location.state?.code || '';

  // Extract players from navigation state safely
  const [ players, setPlayers ] = useState<PlayerResult[]>([]);

  // Format player data for Leaderboard: "correctAnswers / totalRounds"
  const formattedPlayers = players.map((p) => ({
    name: p.name,
    points: p.points,
    scoreDetail: `${p.correctAnswers}/${totalRounds}`,
  }));

  // Navigate back to the lobby screen
  const handleBackToLobby = (): void => {
    navigate("/lobby");
  };

    /* ----------------- SOCKET CONNECTION ----------------- */
  useEffect(() => {
    if (!socket || !socket.connected) return;


    socket.emit("get-room-players-scores", code );
    socket.emit("get-total-rounds", code );

    // Listen for players joined the room
    socket.on("room-players-scores", ( playerScores ) => {
      setPlayers(playerScores);
    });

    // Get total rounds from game settings
    socket.on("total-rounds", (totalRounds: number) => {
      setTotalRounds(totalRounds);
    });

    return () => {
      socket.off("room-players-scores");
      socket.off("total-rounds");
    };
  }, [ code ]);

  return (
    <div className="end-game-container">
      {/* Game Title */}
      <div className="header-section">
        <div className="back-button">
          <button className="back-button" onClick={handleBackToLobby}>
            Back to Lobby
          </button>
        </div>
        <div className="game-title">Guessify</div>
      </div>      
      {/* Podium Rankings */}
      <FinalRankings rankings={players} totalNumberOfQuestions={totalRounds} />
    </div>
  );
};

/**
 * FinalRankings - displays the top 3 players in podium style
 */
interface FinalRankingsProps {
  rankings: PlayerResult[];
  totalNumberOfQuestions: number;
}

const FinalRankings: React.FC<FinalRankingsProps> = ({ rankings, totalNumberOfQuestions }) => {
  const [first, second, third] = rankings;

  const firstDiv = (
    <div className="column">
      <div className="first-bar">
        <div>{first?.points || 0} pts</div>
        <div>{first?.correctAnswers || 0} out of {totalNumberOfQuestions}</div>
      </div>
      <div className="nickname">{first?.name || "No Player"}</div>
    </div>
  );

  const secondDiv = second ? (
    <div className="column">
      <div className="second-bar">
        <div>{second.points}</div>
        <div>{second.correctAnswers} out of {totalNumberOfQuestions}</div>
      </div>
      <div className="nickname">{second.name}</div>
    </div>
  ) : (
    <div className="column">
      <div className="second-bar"></div>
    </div>
  );

  const thirdDiv = third ? (
    <div className="column">
      <div className="third-bar">
        <div>{third.points}</div>
        <div>{third.correctAnswers} out of {totalNumberOfQuestions}</div>
      </div>
      <div className="nickname">{third.name}</div>
    </div>
  ) : (
    <div className="column">
      <div className="third-bar"></div>
    </div>
  );

  return (
    <div className="main-rankings">
      <div className="podiums">
        {secondDiv}
        {firstDiv}
        {thirdDiv}
      </div>
    </div>
  );
};

export default EndGamePage;