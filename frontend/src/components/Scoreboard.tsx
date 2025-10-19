import React, { type JSX } from "react";
import Avatar1 from "../assets/avatars/avatar1.png";
import Avatar2 from "../assets/avatars/avatar2.png";
import Avatar3 from "../assets/avatars/avatar3.png";
import defaultAvatar from "../assets/avatars/avatar1.png";
import "../css/Scoreboard.css";
import medalGold from "../assets/1st-place-medal.png";
import medalSilver from "../assets/2nd-place-medal.png";
import medalBronze from "../assets/3rd-place-medal.png";

/**
 * Represents a player with a name and score.
 */
interface Player {
  name: string;
  points: number;
  avatar?: { id?: string; color?: string } | string;
}

/**
 * Props for Scoreboard component.
 */
interface ScoreboardProps {
  players: Player[];
}

/**
 * Renders a medal or rank number depending on index.
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
 * Scoreboard component for displaying player rankings during the game.
 */
const Scoreboard: React.FC<ScoreboardProps> = ({ players = [] }) => {
  return (
    <div className="scoreboard">
      {players.length === 0 ? (
        <div className="scoreboard-empty">
          <span>Waiting for players...</span>
        </div>
      ) : (
        players.map((player, index) => {
          const avatarId = typeof player.avatar === "string" ? player.avatar : (player.avatar?.id || "a1");
          const avatarSrc = avatarId === "a2" ? Avatar2 : avatarId === "a3" ? Avatar3 : Avatar1;
          return (
            <div className="scoreboard-player" key={player.name}>
              <div className="player-rank">{renderRank(index)}</div>
              <div style={{
                width: 40,
                height: 40,
                marginRight: 8,
                borderRadius: "50%",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (typeof player.avatar === 'object' && player.avatar?.color) ? player.avatar.color : 'transparent'
              }}>
                <img src={avatarSrc || defaultAvatar} alt={`${player.name} avatar`} style={{ width: 32, height: 32, borderRadius: "50%" }} />
              </div>
              <div className="player-info">
                <span className="player-name">{player.name}</span>
                <span className="current-player-points">{player.points} points</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Scoreboard;
