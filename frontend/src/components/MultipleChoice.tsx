import React, { useCallback } from "react";
import "../css/MultipleChoice.css";
import songIcon from "../assets/song-icon.png";

interface MultipleChoiceProps {
  options: string[];
  onSelect: (index: number) => void;
  selectedIndex: number | null;
  correctAnswer: string;
  showCorrectAnswer: boolean;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  options,
  onSelect,
  selectedIndex,
  correctAnswer,
  showCorrectAnswer,
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
    </div>
  );
};

export default MultipleChoice;