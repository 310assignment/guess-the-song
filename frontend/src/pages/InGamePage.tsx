import React, { useState } from 'react';
import '../css/InGamePage.css';
import Scoreboard from "../components/Scoreboard";
import GameHeader from '../components/GameHeader';

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

  // Example state for timer and round
  const [roundNumber] = useState('1/10');
  const [timer] = useState('30');
  const [inviteCode] = useState('ABC123');

  return (
    <div className="in-game-container">
        <GameHeader
          roundNumber={roundNumber}
          timer={timer}
          inviteCode={inviteCode}
        />
      <Scoreboard players={players} />
        {/* Placeholder for game content */}
        <div className="game-body">
        </div>
      </div>
  );
};

export default InGamePage;