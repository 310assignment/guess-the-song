import React from "react";
import "../css/MultipleChoice.css";
import songIcon from "../assets/song-icon.png";

/**
 * Props interface for the MultipleChoice component
 * @interface MultipleChoiceProps
 * @property {string[]} options - Array of answer options to display
 * @property {(index: number) => void} onSelect - Callback function when an option is selected
 * @property {number | null} selectedIndex - Index of the currently selected option (null if none selected)
 * @property {string} correctAnswer - The correct answer string to compare against
 * @property {boolean} showCorrectAnswer - Whether to reveal the correct answer (for feedback)
 */
interface MultipleChoiceProps {
  options: string[];
  onSelect: (index: number) => void;
  selectedIndex: number | null;
  correctAnswer: string;
  showCorrectAnswer: boolean;
}

/**
 * MultipleChoice Component
 * 
 * Renders a multiple choice question interface with:
 * - Song icon and "SONG:" label
 * - Multiple answer buttons with dynamic styling
 * - Visual feedback for correct/incorrect answers
 * - Disabled state after selection
 * 
 * @param {MultipleChoiceProps} props - Component props
 * @returns {JSX.Element} The multiple choice component
 */
const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  options,
  onSelect,
  selectedIndex,
  correctAnswer,
  showCorrectAnswer,
}) => {
  /**
   * Determines the CSS class for each answer button based on selection state
   * 
   * @param {number} index - Index of the button
   * @returns {string} CSS class string for the button
   */
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

  /**
   * Handles button click events for answer selection
   * Prevents multiple selections and calls the onSelect callback
   * 
   * @param {number} index - Index of the clicked button
   */
  const handleButtonClick = (index: number) => {
    // Prevent clicking if an option is already selected
    if (selectedIndex !== null) {
      return;
    }
    onSelect(index);
  };

  return (
    <div className="choose-song-container">
      {/* Question header */}
      <h2>SONG:</h2>
      
      {/* Song icon display */}
      <div className="song-icon">
        <img src={songIcon} alt="Song Icon" />
      </div>
      
      {/* Answer options container */}
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