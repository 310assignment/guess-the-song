// React imports for component functionality and JSX types
import React, { type JSX } from "react";
// Component-specific styles for leaderboard display
import "../css/Leaderboard.css";
// Medal assets for top 3 positions (1st, 2nd, 3rd place)
import medalGold from "../assets/1st-place-medal.png";
import medalSilver from "../assets/2nd-place-medal.png";
import medalBronze from "../assets/3rd-place-medal.png";

/**
 * Represents a player displayed on the leaderboard.
 * Contains essential player information for ranking and display purposes.
 */
interface Player {
  name: string; // Player's display name
  points: number; // Total points earned by the player
  scoreDetail?: string; // Optional additional score information (e.g., round-specific details)
}

/**
 * Props for the Leaderboard component.
 * Defines the data structure expected by the leaderboard.
 */
interface LeaderboardProps {
  players: Player[]; // Array of players to display in ranked order
}

/**
 * Returns a medal image or rank text depending on player position.
 * Top 3 players get medal images, others get numbered rank text.
 *
 * @param index - Zero-based index representing player's rank position
 * @returns JSX element containing either a medal image or rank number
 */
const renderRank = (index: number): JSX.Element => {
  switch (index) {
    case 0:
      // First place gets gold medal
      return <img src={medalGold} alt="1st place" />;
    case 1:
      // Second place gets silver medal
      return <img src={medalSilver} alt="2nd place" />;
    case 2:
      // Third place gets bronze medal
      return <img src={medalBronze} alt="3rd place" />;
    default:
      // 4th place and below get numbered rank text
      return <span className="rank-text">#{index + 1}</span>;
  }
};

/**
 * Leaderboard component that displays ranked players with optional score details.
 * Automatically sorts players by points in descending order and displays appropriate
 * rank indicators (medals for top 3, numbers for others).
 *
 * @param players - Array of player objects to display on the leaderboard
 */
const Leaderboard: React.FC<LeaderboardProps> = ({ players = [] }) => {
  // Sort players by points in descending order (highest → lowest)
  // Create a new array to avoid mutating the original props
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="leaderboard-container">
      {/* Main leaderboard title */}
      <h1 className="leaderboard-title">LEADERBOARD</h1>
      {/* Container for all player rows */}
      <div className="leaderboard-list">
        {/* Map through sorted players to create individual rows */}
        {sortedPlayers.map((player, index) => (
          <div className="leaderboard-row" key={player.name}>
            {/* Rank indicator (medal or number based on position) */}
            <div className="leaderboard-rank-icon">{renderRank(index)}</div>
            {/* Player's name */}
            <div className="leaderboard-player-name">{player.name}</div>
            {/* Optional score detail - only displayed if provided */}
            {player.scoreDetail && (
              <div className="score-detail">{player.scoreDetail}</div>
            )}
            {/* Player's total points */}
            <div className="leaderboard-player-points">{player.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
