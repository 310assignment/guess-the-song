import React, { useState, useEffect } from 'react';
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

  // Round logic
  const totalRounds = 10;
  const roundTime = 30;
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(roundTime);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [inviteCode] = useState('ABC123');


  useEffect(() => {
    // Start the first round automatically
    setIsRoundActive(true);
    setTimeLeft(roundTime);
    }, []);

  useEffect(() => {
    if (!isRoundActive) return;

    if (timeLeft <= 0) {
      handleRoundEnd();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isRoundActive]);

  // Handle end of round
  function handleRoundEnd() {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
      setTimeLeft(roundTime);
    } else {
      alert("Game over!"); //Change this part to scoreboard
    }
  }


  return (
    <div className="in-game-container">
      <GameHeader
        roundNumber={`${currentRound}/${totalRounds}`}
        timer={`${timeLeft}`}
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