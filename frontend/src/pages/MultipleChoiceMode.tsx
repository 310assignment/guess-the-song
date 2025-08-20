import React, { useState } from 'react';
import '../css/MultipleChoiceMode.css';
import Scoreboard from "../components/Scoreboard";
import GameHeader from '../components/GameHeader';
import ChooseSong from '../components/MultipleChoice';

const MultipleChoiceMode: React.FC = () => {

  const players = [
    { name: "Player Name 1", points: 0 },
    { name: "Player Name 2", points: 0 },
    { name: "Player Name 3", points: 0 },
    { name: "Player Name 4", points: 0 },
    { name: "Player Name 5", points: 0 },
    { name: "Player Name 6", points: 0 },
    { name: "Player Name 7", points: 0 },
  ];

  const [roundNumber] = useState('1/10');
  const [timer] = useState('30');
  const [inviteCode] = useState('ABC123');

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const options = [
    "SONG 1, SONG 2, SONG 3",
    "SONG 1, SONG 4, SONG 3",
    "SONG 2, SONG 5, SONG 3",
    "SONG 1, SONG 4, SONG 5",
  ];

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    // Add logic here to check answer / update score
  };

  return (
    <div className="game-2-container">
      <GameHeader
        roundNumber={roundNumber}
        timer={timer}
        inviteCode={inviteCode}
      />
      <div className="game-2-body">
        <Scoreboard players={players} />
        <ChooseSong
          options={options}
          onSelect={handleSelect}
          selectedIndex={selectedIndex}
        />
      </div>
    </div>
  );
};

export default MultipleChoiceMode;
