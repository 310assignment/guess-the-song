// React import for component functionality
import React from "react";
// Shared CSS styles with regular MultipleChoice component
import "../css/MultipleChoice.css";
// Song icon asset to display above answer options
import songIcon from "../assets/song-icon.png";

/**
 * Props interface for the QuickGuessMultipleChoice component
 * Extends regular multiple choice with quick guess specific features
 */
interface QuickGuessMultipleChoiceProps {
  options: string[]; // Array of answer choices to display
  onSelect: (index: number) => void; // Callback when user selects an answer
  selectedIndex: number | null; // Currently selected answer index (null if none selected)
  correctAnswer: string; // The correct answer text for comparison
  showCorrectAnswer: boolean; // Whether to reveal correct/incorrect answers
  hasPlayedSnippet: boolean; // Whether the audio snippet has finished playing
  snippetDuration?: number; // Duration of the audio snippet in seconds
  onSkip?: () => void; // Optional callback for skipping the round
  isHost?: boolean; // Whether current user is the host (controls skip visibility)
}

/**
 * Multiple choice component specialized for quick guess game mode
 * Differs from regular multiple choice by requiring audio snippet to play first
 * Only allows selection after the audio snippet has completed
 *
 * @param options - Array of answer choices to display as buttons
 * @param onSelect - Callback function when user selects an answer
 * @param selectedIndex - Index of currently selected answer (null if none)
 * @param correctAnswer - The correct answer text for visual feedback
 * @param showCorrectAnswer - Whether to show correct/incorrect answer states
 * @param hasPlayedSnippet - Whether audio snippet has finished (enables interaction)
 * @param snippetDuration - Length of audio snippet in seconds (default: 3)
 * @param onSkip - Optional callback for skipping the current round
 * @param isHost - Whether current user is host (default: true, controls skip visibility)
 */
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
  /**
   * Determines the CSS class for each answer button based on selection and correctness
   * Same logic as regular MultipleChoice but with additional snippet playback consideration
   *
   * @param index - The index of the button to get classes for
   * @returns CSS class string for the button
   */
  const getButtonClass = (index: number) => {
    let className = "answer-btn";

    // Highlight selected answer and show correct/wrong feedback
    if (selectedIndex === index) {
      if (showCorrectAnswer) {
        // Show green for correct, red for incorrect when answers are revealed
        className += options[index] === correctAnswer ? " correct" : " wrong";
      } else {
        // Show selected state when answers aren't revealed yet
        className += " selected";
      }
    }

    // Disable other buttons once one is selected, show correct answer if needed
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
   * Key difference from regular MultipleChoice: only allows selection after snippet has played
   * Prevents premature guessing before the audio cue is complete
   *
   * @param index - Index of the clicked answer option
   */
  const handleButtonClick = (index: number) => {
    // Only allow selection if nothing is currently selected AND snippet has finished playing
    if (selectedIndex === null && hasPlayedSnippet) {
      onSelect(index);
    }
  };

  /**
   * Handles skip button click events
   * Only allows skipping if snippet has played, no answer selected, and skip callback provided
   * Ensures skip functionality follows same rules as answer selection
   */
  const handleSkip = () => {
    if (selectedIndex === null && hasPlayedSnippet && onSkip) {
      onSkip();
    }
  };

  return (
    <div className="choose-song-container">
      {/* Conditional header: waiting message before snippet, question after */}
      {!hasPlayedSnippet ? (
        <div className="status-message waiting">
          🎵 Get ready! A {snippetDuration}-second snippet will play
          automatically...
        </div>
      ) : (
        <h2>SONG:</h2>
      )}

      {/* Visual song icon to indicate this is a music-related question */}
      <div className="song-icon">
        <img src={songIcon} alt="Song Icon" />
      </div>

      {/* Container for all answer option buttons */}
      <div className="answer-buttons">
        {/* Map through options to create numbered answer buttons */}
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={getButtonClass(index)}
            onClick={() => handleButtonClick(index)}
            // Disable buttons until snippet plays AND for non-selected options after selection
            disabled={
              !hasPlayedSnippet ||
              (selectedIndex !== null && selectedIndex !== index)
            }
            // ARIA attribute for accessibility - indicates if button is pressed/selected
            aria-pressed={selectedIndex === index}
          >
            {/* Display numbered option (1. Option A, 2. Option B, etc.) */}
            {`${index + 1}. ${option}`}
          </button>
        ))}
      </div>

      {/* Optional skip button - only for hosts and when skip callback is provided */}
      {onSkip && isHost && (
        <div className="button-container">
          <button
            type="button"
            onClick={handleSkip}
            // Disable skip until snippet plays or when answer is selected
            className={`skip-btn ${
              !hasPlayedSnippet || selectedIndex !== null
                ? "skip-btn--disabled"
                : ""
            }`}
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
