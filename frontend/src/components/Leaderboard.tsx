import React, { type JSX } from "react";
import "../css/Leaderboard.css";
import medalGold from "../assets/1st-place-medal.png";
import medalSilver from "../assets/2nd-place-medal.png";
import medalBronze from "../assets/3rd-place-medal.png";

/**
 * Represents a player displayed on the leaderboard.
 */
interface Player {
  name: string;
  points: number;
  scoreDetail?: string;
}

/**
 * Props for the Leaderboard component.
 */
interface LeaderboardProps {
  players: Player[];
}

/**
 * Returns a medal or rank text depending on index.
 */
const renderRank = (index: number): JSX.Element => {
  switch (index) {
    case 0:
      return <img src={medalGold} alt="1st place" />;
    case 1:
      return <img src={medalSilver} alt="2nd place" />;
    case 2:
      return <img src={medalBronze} alt="3rd place" />;
    default:
      return <span className="rank-text">#{index + 1}</span>;
  }
};

/**
 * Leaderboard component that displays ranked players with optional score details.
 */
const Leaderboard: React.FC<LeaderboardProps> = ({ players = [] }) => {
  // Sort players by points (highest → lowest)
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">LEADERBOARD</h1>
      <div className="leaderboard-list">
        {sortedPlayers.map((player, index) => (
          <div className="leaderboard-row" key={player.name}>
            <div className="leaderboard-rank-icon">{renderRank(index)}</div>
            <div className="leaderboard-player-name">{player.name}</div>
            {/* Show scoreDetail only if provided */}
            {player.scoreDetail && (
              <div className="score-detail">{player.scoreDetail}</div>
            )}
            <div className="leaderboard-player-points">{player.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;