// React imports for component functionality and optimization hooks
import React, { useCallback } from "react";
// Component-specific styles for multiple choice interface
import "../css/MultipleChoice.css";
// Song icon asset to display above answer options
import songIcon from "../assets/song-icon.png";

/**
 * Props interface for the MultipleChoice component
 * Defines all the data and callbacks needed for the multiple choice game interface
 */
interface MultipleChoiceProps {
  options: string[]; // Array of answer choices to display
  onSelect: (index: number) => void; // Callback when user selects an answer
  selectedIndex: number | null; // Currently selected answer index (null if none selected)
  correctAnswer: string; // The correct answer text for comparison
  showCorrectAnswer: boolean; // Whether to reveal correct/incorrect answers
  onSkip?: () => void; // Optional callback for skipping the round
}

/**
 * MultipleChoice component renders a game interface with selectable answer options
 * Handles visual feedback for selection states and correct/incorrect answers
 *
 * @param options - Array of answer choices to display as buttons
 * @param onSelect - Callback function when user selects an answer
 * @param selectedIndex - Index of currently selected answer (null if none)
 * @param correctAnswer - The correct answer text for visual feedback
 * @param showCorrectAnswer - Whether to show correct/incorrect answer states
 * @param onSkip - Optional callback for skipping the current round
 */
const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  options,
  onSelect,
  selectedIndex,
  correctAnswer,
  showCorrectAnswer,
  onSkip,
}) => {
  /**
   * Determines the CSS class for each answer button based on selection and correctness
   * Handles different visual states: default, selected, correct, wrong, disabled
   *
   * @param index - The index of the button to get classes for
   * @returns CSS class string for the button
   */
  const getButtonClass = (index: number) => {
    let className = "answer-btn";

    // Handle styling for the currently selected button
    if (selectedIndex === index) {
      if (showCorrectAnswer) {
        // Show green for correct, red for incorrect when answers are revealed
        className += options[index] === correctAnswer ? " correct" : " wrong";
      } else {
        // Show selected state when answers aren't revealed yet
        className += " selected";
      }
    }

    // Handle styling for non-selected buttons when something is selected
    if (selectedIndex !== null && selectedIndex !== index) {
      className += " disabled";
      // Highlight the correct answer even if it wasn't selected
      if (showCorrectAnswer && options[index] === correctAnswer) {
        className += " correct";
      }
    }

    return className;
  };

  /**
   * Handles button click events for answer selection
   * Only allows selection if no answer has been chosen yet
   * Uses useCallback for performance optimization to prevent unnecessary re-renders
   *
   * @param index - Index of the clicked answer option
   */
  const handleButtonClick = useCallback(
    (index: number) => {
      // Only allow selection if nothing is currently selected
      if (selectedIndex === null) {
        onSelect(index);
      }
    },
    [selectedIndex, onSelect]
  );

  /**
   * Handles skip button click events
   * Only allows skipping if no answer has been selected and skip callback is provided
   */
  const handleSkip = () => {
    if (selectedIndex === null && onSkip) {
      onSkip();
    }
  };

  return (
    <div className="choose-song-container">
      {/* Header label for the question section */}
      <h2>SONG:</h2>

      {/* Visual song icon to indicate this is a music-related question */}
      <div className="song-icon">
        <img src={songIcon} alt="Song Icon" />
      </div>

      {/* Container for all answer option buttons */}
      <div className="answer-buttons">
        {/* Map through options to create numbered answer buttons */}
        {options.map((option, index) => (
          <button
            key={option} // Use option text as key for React reconciliation (more stable than index)
            type="button"
            className={getButtonClass(index)}
            onClick={() => handleButtonClick(index)}
            // Disable buttons for non-selected options after a selection is made
            disabled={selectedIndex !== null && selectedIndex !== index}
            // ARIA attribute for accessibility - indicates if button is pressed/selected
            aria-pressed={selectedIndex === index}
          >
            {/* Display numbered option (1. Option A, 2. Option B, etc.) */}
            {`${index + 1}. ${option}`}
          </button>
        ))}
      </div>

      {/* Optional skip button - only rendered if onSkip callback is provided */}
      {onSkip && (
        <div className="skip-button-container">
          <button
            type="button"
            onClick={handleSkip}
            // Apply disabled styling when an answer is already selected
            className={`skip-btn ${
              selectedIndex !== null ? "skip-btn--disabled" : ""
            }`}
            // Disable skip functionality after an answer is selected
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
