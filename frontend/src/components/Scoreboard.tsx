// React imports for component functionality and JSX types
import React, { type JSX } from "react";
// Avatar image assets - three different character options for players
import Avatar1 from "../assets/avatars/avatar1.png";
import Avatar2 from "../assets/avatars/avatar2.png";
import Avatar3 from "../assets/avatars/avatar3.png";
// Default avatar fallback (same as Avatar1 for consistency)
import defaultAvatar from "../assets/avatars/avatar1.png";
// Component-specific styles for scoreboard display
import "../css/Scoreboard.css";
// Medal assets for top 3 positions in the scoreboard
import medalGold from "../assets/1st-place-medal.png";
import medalSilver from "../assets/2nd-place-medal.png";
import medalBronze from "../assets/3rd-place-medal.png";

/**
 * Represents a player with a name and score.
 * Contains essential player information for scoreboard display during active gameplay.
 */
interface Player {
  name: string; // Player's display name
  points: number; // Current total points earned
  avatar?: { id?: string; color?: string } | string; // Avatar configuration (image ID and background color)
}

/**
 * Props for Scoreboard component.
 * Defines the data structure expected by the scoreboard during active gameplay.
 */
interface ScoreboardProps {
  players: Player[]; // Array of players to display in their current order (pre-sorted by game logic)
}

/**
 * Renders a medal image or rank number depending on player position.
 * Top 3 players get medal images, others get numbered rank text.
 * Used to provide visual hierarchy in the scoreboard display.
 *
 * @param index - Zero-based index representing player's current position
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
 * Scoreboard component for displaying player rankings during active gameplay.
 * Shows real-time player positions, scores, and avatars in a compact sidebar format.
 * Differs from Leaderboard component by being used during gameplay rather than round results.
 *
 * @param players - Array of players in their current order (assumes pre-sorted by game logic)
 */
const Scoreboard: React.FC<ScoreboardProps> = ({ players = [] }) => {
  return (
    <div className="scoreboard">
      {/* Handle empty state when no players are available */}
      {players.length === 0 ? (
        <div className="scoreboard-empty">
          <span>Waiting for players...</span>
        </div>
      ) : (
        // Map through players to create individual scoreboard entries
        players.map((player, index) => {
          // Determine avatar image based on avatar configuration
          const avatarId =
            typeof player.avatar === "string"
              ? player.avatar
              : player.avatar?.id || "a1";
          const avatarSrc =
            avatarId === "a2" ? Avatar2 : avatarId === "a3" ? Avatar3 : Avatar1;

          return (
            <div className="scoreboard-player" key={player.name}>
              {/* Rank indicator (medal or number) */}
              <div className="player-rank">{renderRank(index)}</div>

              {/* Avatar display with customizable background color */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  marginRight: 8,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // Apply custom color if avatar is object with color property
                  backgroundColor:
                    typeof player.avatar === "object" && player.avatar?.color
                      ? player.avatar.color
                      : "transparent",
                }}
              >
                {/* Avatar image with fallback to default */}
                <img
                  src={avatarSrc || defaultAvatar}
                  alt={`${player.name} avatar`}
                  style={{ width: 32, height: 32, borderRadius: "50%" }}
                />
              </div>

              {/* Player information: name and current points */}
              <div className="player-info">
                <span className="player-name">{player.name}</span>
                <span className="current-player-points">
                  {player.points} points
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Scoreboard;
