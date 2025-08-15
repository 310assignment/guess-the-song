import React from "react";
import "../css/Scoreboard.css";
import medalGold from "../assets/1st-place-medal.png";
import medalSilver from "../assets/2nd-place-medal.png";
import medalBronze from "../assets/3rd-place-medal.png";

interface Player {
  name: string;
  points: number;
}

interface ScoreboardProps {
  players: Player[];
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players }) => {
  return (
    <div className="scoreboard">
      {players.map((player, index) => (
        <div className={`scoreboard-player`} key={index}>
          <div className="player-rank">
            {index === 0 && <img src={medalGold} alt="1st" />}
            {index === 1 && <img src={medalSilver} alt="2nd" />}
            {index === 2 && <img src={medalBronze} alt="3rd" />}
            {index > 2 && <span className="rank-text">#{index + 1}</span>}
          </div>
          <div className="player-info">
            <span className="player-name">{player.name}</span>
            <span className="player-points">{player.points} points</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;