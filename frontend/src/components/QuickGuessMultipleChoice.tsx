import React from "react";
import "../css/MultipleChoice.css";
import songIcon from "../assets/song-icon.png";

interface QuickGuessMultipleChoiceProps {
  options: string[];
  onSelect: (index: number) => void;
  selectedIndex: number | null;
  correctAnswer: string;
  showCorrectAnswer: boolean;
  hasPlayedSnippet: boolean;
  snippetDuration?: number;
  onSkip?: () => void;
  isHost?: boolean; 
}

// Multiple choice component for quick guess mode
const QuickGuessMultipleChoice: React.FC<QuickGuessMultipleChoiceProps> = ({
  options,
  onSelect,
  selectedIndex,
  correctAnswer,
  showCorrectAnswer,
  hasPlayedSnippet,
  snippetDuration = 3,
  onSkip,
  isHost = true,
}) => {
  const getButtonClass = (index: number) => {
    let className = "answer-btn";

    // Highlight selected answer and show correct/wrong feedback
    if (selectedIndex === index) {
      if (showCorrectAnswer) {
        className += options[index] === correctAnswer ? " correct" : " wrong";
      } else {
        className += " selected";
      }
    }

    // Disable other buttons once one is selected, show correct answer if needed
    if (selectedIndex !== null && selectedIndex !== index) {
      className += " disabled";
      if (showCorrectAnswer && options[index] === correctAnswer) {
        className += " correct";
      }
    }

    return className;
  };

  // Handle button click only if snippet has played and no answer selected yet
  const handleButtonClick = (index: number) => {
    if (selectedIndex === null && hasPlayedSnippet) {
      onSelect(index);
    }
  };

  const handleSkip = () => {
    if (selectedIndex === null && hasPlayedSnippet && onSkip) {
      onSkip();
    }
  };

  return (
    <div className="choose-song-container">
      {!hasPlayedSnippet ? (
        <div className="status-message waiting">
          🎵 Get ready! A {snippetDuration}-second snippet will play automatically...
        </div>
      ) : (
        <h2>SONG:</h2>
      )}

      <div className="song-icon">
        <img src={songIcon} alt="Song Icon" />
      </div>

      <div className="answer-buttons">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={getButtonClass(index)}
            onClick={() => handleButtonClick(index)}
            disabled={!hasPlayedSnippet || (selectedIndex !== null && selectedIndex !== index)}
            aria-pressed={selectedIndex === index}
          >
            {`${index + 1}. ${option}`}
          </button>
        ))}
      </div>

      {/* Skip button */}
      {onSkip && isHost && (
        <div className="button-container">
          <button
            type="button"
            onClick={handleSkip}
            className={`skip-btn ${!hasPlayedSnippet || selectedIndex !== null ? "skip-btn--disabled" : ""}`}
            disabled={!hasPlayedSnippet || selectedIndex !== null}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickGuessMultipleChoice;