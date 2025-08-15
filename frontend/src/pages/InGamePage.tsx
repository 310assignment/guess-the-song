import React, { useState } from 'react';
import '../css/InGamePage.css';
import Scoreboard from "../components/Scoreboard";
interface GuessifyProps {}


const InGamePage: React.FC<GuessifyProps> = () => {

  const players = [
    { name: "Player Name 1", points: 0 },
    { name: "Player Name 2", points: 0 },
    { name: "Player Name 3", points: 0 },
    { name: "Player Name 4", points: 0 },
    { name: "Player Name 5", points: 0 },
    { name: "Player Name 6", points: 0 },
    { name: "Player Name 7", points: 0 },
  ];

  return (
    <div className="in-game-container">
      <Scoreboard players={players} />
    </div>
  );
};

export default InGamePage;