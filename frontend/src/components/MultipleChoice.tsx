import React, { useCallback } from "react";
import "../css/MultipleChoice.css";
import songIcon from "../assets/song-icon.png";

interface MultipleChoiceProps {
  options: string[];
  onSelect: (index: number) => void;
  selectedIndex: number | null;
  correctAnswer: string;
  showCorrectAnswer: boolean;
  onSkip?: () => void;                 // Optional callback for skipping the round
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  options,
  onSelect,
  selectedIndex,
  correctAnswer,
  showCorrectAnswer,
  onSkip,
}) => {
  const getButtonClass = (index: number) => {
    let className = "answer-btn";

    if (selectedIndex === index) {
      if (showCorrectAnswer) {
        className += options[index] === correctAnswer ? " correct" : " wrong";
      } else {
        className += " selected";
      }
    }

    if (selectedIndex !== null && selectedIndex !== index) {
      className += " disabled";
      if (showCorrectAnswer && options[index] === correctAnswer) {
        className += " correct";
      }
    }

    return className;
  };

  const handleButtonClick = useCallback(
    (index: number) => {
      if (selectedIndex === null) {
        onSelect(index);
      }
    },
    [selectedIndex, onSelect]
  );

  const handleSkip = () => {
    if (selectedIndex === null && onSkip) {
      onSkip();
    }
  };

  return (
    <div className="choose-song-container">
      <h2>SONG:</h2>

      <div className="song-icon">
        <img src={songIcon} alt="Song Icon" />
      </div>

      <div className="answer-buttons">
        {options.map((option, index) => (
          <button
            key={option} // <-- Use the option text as key instead of index
            type="button"
            className={getButtonClass(index)}
            onClick={() => handleButtonClick(index)}
            disabled={selectedIndex !== null && selectedIndex !== index}
            aria-pressed={selectedIndex === index}
          >
            {`${index + 1}. ${option}`}
          </button>
        ))}
      </div>

      {/* Skip button */}
      {onSkip && (
        <div className="button-container">
          <button
            type="button"
            onClick={handleSkip}
            className={`skip-btn ${selectedIndex !== null ? "skip-btn--disabled" : ""}`}
            disabled={selectedIndex !== null}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
};

export default MultipleChoice;