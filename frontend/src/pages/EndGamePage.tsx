import '../css/EndGamePage.css';
import Leaderboard from "../components/Leaderboard";
import { useLocation, useNavigate } from 'react-router-dom';
import React from "react";

interface PlayerResult {
  name: string;
  points: number;
  correctAnswers: number;
  totalRounds: number;
}

interface GuessifyProps {}

const EndGamePage: React.FC<GuessifyProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract players data from state passed by InGamePage
  const players: PlayerResult[] = location.state?.players || [];

  // Format scoreDetail dynamically: "correctAnswers / totalRounds"
  const formattedPlayers = players.map(p => ({
    name: p.name,
    points: p.points,
    scoreDetail: `${p.correctAnswers ?? 0}/${p.totalRounds ?? 0}`, 
}));
  // Navigate back to lobby
  const handleBackToLobby = () => {
    navigate("/lobby");
  };

  return (
    <div className="end-game-container">
      <Leaderboard players={formattedPlayers} />
      <div className="end-game-button">
        <button className="back-button" onClick={handleBackToLobby}>
          Back to Lobby
        </button>
      </div>
    </div>
  );
};

export default EndGamePage;