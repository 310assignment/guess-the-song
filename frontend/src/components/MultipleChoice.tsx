import React from "react";
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
      // If this is the selected option, show green if correct, red if wrong
      if (showCorrectAnswer) {
        if (options[index] === correctAnswer) {
          className += " correct";
        } else {
          className += " wrong";
        }
      } else {
        className += " selected";
      }
    }

    if (selectedIndex !== null && selectedIndex !== index) {
      className += " disabled";

      // Show the correct answer in green when user selected wrong
      if (showCorrectAnswer && options[index] === correctAnswer) {
        className += " correct";
      }
    }

    return className;
  };

  const handleButtonClick = (index: number) => {
    // Prevent clicking if an option is already selected
    if (selectedIndex !== null) {
      return;
    }
    onSelect(index);
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
            key={index}
            className={getButtonClass(index)}
            onClick={() => handleButtonClick(index)}
            disabled={selectedIndex !== null && selectedIndex !== index}
          >
            {`${index + 1}. ${option}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoice;