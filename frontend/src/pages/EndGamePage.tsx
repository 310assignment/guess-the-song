import '../css/EndGamePage.css';
import Leaderboard from "../components/Leaderboard";
import { useLocation, useNavigate } from 'react-router-dom';
import React from "react";

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

  // Extract players from navigation state safely
  const players: PlayerResult[] = Array.isArray(location.state?.players)
    ? location.state.players
    : [];

  // Format player data for Leaderboard: "correctAnswers / totalRounds"
  const formattedPlayers = players.map((p) => ({
    name: p.name,
    points: p.points,
    scoreDetail: `${p.correctAnswers}/${p.totalRounds}`,
  }));

  // Navigate back to the lobby screen
  const handleBackToLobby = (): void => {
    navigate("/lobby");
  };

  return (
    <div className="end-game-container">
      {/* Leaderboard with final scores */}
      <Leaderboard players={formattedPlayers} />

      {/* Navigation button */}
      <div className="end-game-button">
        <button className="back-button" onClick={handleBackToLobby}>
          Back to Lobby
        </button>
      </div>
    </div>
  );
};

export default EndGamePage;