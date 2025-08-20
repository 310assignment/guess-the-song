import React, { useState, useEffect } from 'react';
import '../css/InGamePage.css';
import Scoreboard from "../components/Scoreboard";
import GameHeader from '../components/GameHeader';
import MultipleChoice from '../components/MultipleChoice';
import SingleChoice from '../components/SingleChoice';
import { useLocation } from 'react-router-dom';

interface GuessifyProps { }

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

  const location = useLocation();
  const settings = location.state as {
    rounds: string;
    guessTime: string;
    gameMode: string;
    // include other settings later
  };

  // Round Logic
  const totalRounds = parseInt(settings?.rounds) || 10; // fallback 10
  const roundTime = parseInt(settings?.guessTime) || 30; // fallback 30
  const isSingleSong = settings?.gameMode?.startsWith('Listening (');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(roundTime);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [isIntermission, setIsIntermission] = useState(false);
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

  useEffect(() => {
    // Start the first round automatically
    setIsRoundActive(true);
    setTimeLeft(roundTime);
  }, []);

  useEffect(() => {
    if (!isRoundActive || isIntermission) return;

    if (timeLeft <= 0) {
      handleRoundEnd();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isRoundActive, isIntermission]);

  // Handle end of round
  function handleRoundEnd() {
    if (currentRound < totalRounds) {
      setIsRoundActive(false);
      setIsIntermission(true);

      // Wait 5 seconds before starting next round
      setTimeout(() => {
        setCurrentRound(r => r + 1);
        setTimeLeft(roundTime); // reset full round timer
        setIsRoundActive(true);
        setIsIntermission(false);
      }, 5000);
    } else {
      alert("Game over!"); //Change this part to score
      setIsRoundActive(false);
    }
  }

  return (
    <div className="game-2-container">
      <GameHeader
        roundNumber={`${currentRound}/${totalRounds}`}
        timer={`${timeLeft}`}
        inviteCode={inviteCode}
      />
      <div className="game-2-body">
        <Scoreboard players={players} />

        {isSingleSong ? (
          <SingleChoice
          // add props for SingleChoice component here
          />
        ) : (
          <MultipleChoice
            options={options}
            onSelect={handleSelect}
            selectedIndex={selectedIndex}
          />
        )}
      </div>
    </div>
  );
};

export default InGamePage;