import React, { useState } from "react";
import "../css/MultipleChoiceMode.css";
import Scoreboard from "../components/Scoreboard";
import GameHeader from "../components/GameHeader";
import ChooseSong from "../components/MultipleChoice";

/**
 * MultipleChoiceMode Page Component
 * 
 * Main game page for multiple choice mode that displays:
 * - Game header with round info, timer, and invite code
 * - Player scoreboard
 * - Multiple choice question interface
 * 
 * Currently uses mock data for demonstration purposes
 * 
 * @returns {JSX.Element} The multiple choice mode page
 */
const MultipleChoiceMode: React.FC = () => {
  // Mock player data - in a real app this would come from props or API
  const players = [
    { name: "Player Name 1", points: 0 },
    { name: "Player Name 2", points: 0 },
    { name: "Player Name 3", points: 0 },
    { name: "Player Name 4", points: 0 },
    { name: "Player Name 5", points: 0 },
    { name: "Player Name 6", points: 0 },
    { name: "Player Name 7", points: 0 },
  ];

  // Game state - these would typically be managed by a game context or props
  const [roundNumber] = useState("1/10");
  const [timer] = useState("30");
  const [inviteCode] = useState("ABC123");

  // Track which answer option is currently selected
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Mock answer options - in a real app this would come from the game API
  const options = [
    "SONG 1, SONG 2, SONG 3",
    "SONG 1, SONG 4, SONG 3",
    "SONG 2, SONG 5, SONG 3",
    "SONG 1, SONG 4, SONG 5",
  ];

  /**
   * Handles answer selection from the multiple choice component
   * Updates the selected index and would typically trigger answer validation
   * 
   * @param {number} index - Index of the selected answer option
   */
  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className="game-2-container">
      {/* Game header with round info, timer, and invite code */}
      <GameHeader
        roundNumber={roundNumber}
        timer={timer}
        inviteCode={inviteCode}
      />
      
      {/* Main game content area */}
      <div className="game-2-body">
        {/* Player scoreboard showing current scores */}
        <Scoreboard players={players} />
        
        {/* Multiple choice question interface */}
        <ChooseSong
          options={options}
          onSelect={handleSelect}
          selectedIndex={selectedIndex}
          correctAnswer="SONG 1, SONG 2, SONG 3" // Mock correct answer
          showCorrectAnswer={false} // Would be true after answer is selected
        />
      </div>
    </div>
  );
};

export default MultipleChoiceMode;
