import React from "react";
import "../css/Leaderboard.css";
import medalGold from "../assets/1st-place-medal.png";
import medalSilver from "../assets/2nd-place-medal.png";
import medalBronze from "../assets/3rd-place-medal.png";

interface Player {
  name: string;
  points: number;
  scoreDetail?: string; 
}

interface LeaderboardProps {
  players: Player[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">LEADERBOARD</h1>
      <div className="leaderboard-list">
        {players.map((player, index) => (
        <div className="leaderboard-row" key={index}>
            <div className="leaderboard-rank-icon">
                {index === 0 && <img src={medalGold} alt="1st" />}
                {index === 1 && <img src={medalSilver} alt="2nd" />}
                {index === 2 && <img src={medalBronze} alt="3rd" />}
                {index > 2 && <span>#{index + 1}</span>}
            </div>
            <div className="leaderboard-player-name">{player.name}</div>
            <div className="score-detail">{player.scoreDetail}</div>
            <div className="leaderboard-player-points">{player.points} pts</div>
        </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;