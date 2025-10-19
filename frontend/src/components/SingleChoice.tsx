// React hooks for component state and lifecycle management
import React, { useState, useEffect } from "react";
// Component-specific styling for the guess song interface
import "../css/GuessSong.css";
// Play button icon asset for the song playback control
import PlayIcon from "../assets/Play.png";
// Service for handling song playback functionality
import { songService } from "../services/songServices";
// TypeScript type definition for song data structure
import type { Song } from "../types/song";

// Props interface for the SingleChoice component
// Defines all the callback functions and data needed for the guessing game
interface SingleChoiceProps {
  onCorrectGuess: () => void; // Called when user guesses correctly
  currentSong: Song | null; // Current song data from the game
  hasGuessedCorrectly: boolean; // Whether the user already guessed right this round
  onWrongGuess?: () => void; // Optional callback for wrong guess handling
  mode: "title" | "artist"; // Mode to guess either song title or artist name
  isHost?: boolean; // Whether the current user is the host (can skip rounds)
  onHostSkip?: () => void; // Callback for host skip functionality
}

/**
 * SingleChoice component for text-based song guessing game mode.
 * Players type their guesses for either song title or artist name.
 * Includes text normalization, hint display, and host controls.
 *
 * @param onCorrectGuess - Callback when user guesses correctly
 * @param currentSong - Current song data object
 * @param hasGuessedCorrectly - Whether user already guessed correctly this round
 * @param onWrongGuess - Optional callback for wrong guess handling
 * @param mode - Whether to guess "title" or "artist"
 * @param isHost - Whether current user is the host (enables skip button)
 * @param onHostSkip - Callback for host skip functionality
 */
const SingleChoice: React.FC<SingleChoiceProps> = ({
  onCorrectGuess,
  currentSong,
  hasGuessedCorrectly,
  onWrongGuess,
  mode,
  isHost = false,
  onHostSkip,
}) => {
  // User's current guess input text
  const [guess, setGuess] = useState("");
  // Flag to display wrong guess feedback message
  const [showWrongMessage, setShowWrongMessage] = useState(false);

  /**
   * Create a masked version of the text with underscores for each letter.
   * Removes featuring artists, parenthetical content, and punctuation
   * to focus on the core title/artist name that players need to guess.
   *
   * @param text - The original song title or artist name
   * @returns String with words replaced by underscores (e.g., "Hello World" → "_____ _____")
   */
  const createBlanks = (text: string): string => {
    // Remove common featuring artist patterns and parenthetical content
    // This helps focus on the main title/artist name
    let mainText = text
      .replace(/\s*\([^)]*\)/g, "") // Remove parentheses content like "(Remix)"
      .replace(/\s*feat\.?\s+.*/gi, "") // Remove "feat." and everything after
      .replace(/\s*ft\.?\s+.*/gi, "") // Remove "ft." and everything after
      .replace(/\s*featuring\s+.*/gi, "") // Remove "featuring" and everything after
      .trim();

    // Clean the text by removing punctuation and normalizing spaces
    const cleanText = mainText
      .replace(/[^\w\s]/g, "") // Remove all punctuation marks
      .replace(/\s+/g, " ") // Normalize multiple spaces to single space
      .trim();

    // Convert each word to underscores of the same length
    // Join with extra spaces for better visual separation
    return cleanText
      .split(" ")
      .filter(Boolean) // Remove empty strings from splitting
      .map((word) => "_".repeat(word.length)) // Replace each word with underscores
      .join("   "); // Join with triple spaces for readability
  };

  /**
   * Normalize text for accurate comparison between user guess and correct answer.
   * Applies the same cleaning logic as createBlanks to ensure fair matching.
   * Converts to lowercase for case-insensitive comparison.
   *
   * @param text - Text to normalize (user guess or correct answer)
   * @returns Cleaned, lowercase text ready for comparison
   */
  const normalizeForComparison = (text: string): string => {
    return text
      .replace(/\s*\([^)]*\)/g, "") // Remove parenthetical content
      .replace(/\s*feat\.?\s+.*/gi, "") // Remove featuring artists (feat.)
      .replace(/\s*ft\.?\s+.*/gi, "") // Remove featuring artists (ft.)
      .replace(/\s*featuring\s+.*/gi, "") // Remove featuring artists (featuring)
      .replace(/[^\w\s]/g, "") // Remove all punctuation
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim() // Remove leading/trailing spaces
      .toLowerCase(); // Convert to lowercase for comparison
  };

  /**
   * Reset component state when the current song changes.
   * Clears user input and any feedback messages to prepare for new round.
   * Runs whenever currentSong prop changes.
   */
  useEffect(() => {
    setGuess(""); // Clear the input field
    setShowWrongMessage(false); // Hide any wrong guess feedback
  }, [currentSong]);

  /**
   * Handle changes to the guess input field.
   * Updates the guess state as user types their answer.
   *
   * @param e - React change event from the input element
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuess(e.target.value);
  };

  /**
   * Process and validate the user's guess against the correct answer.
   * Compares normalized versions of the guess and target (title or artist).
   * Triggers appropriate callbacks based on whether the guess is correct.
   */
  const handleSubmitGuess = () => {
    // Don't process if no song loaded or user already guessed correctly
    if (!currentSong || hasGuessedCorrectly) return;

    // Normalize both the user's guess and the target answer for fair comparison
    const normalizedGuess = normalizeForComparison(guess);
    const target = mode === "title" ? currentSong.title : currentSong.artist;
    const normalizedTarget = normalizeForComparison(target);

    // Check if the normalized strings match exactly
    if (normalizedGuess === normalizedTarget) {
      onCorrectGuess(); // Notify parent component of correct guess
    } else {
      setShowWrongMessage(true); // Show "wrong" feedback to user
      onWrongGuess?.(); // Call optional wrong guess callback if provided
    }
  };

  /**
   * Handle Enter key press for submitting guesses.
   * Allows users to submit their guess by pressing Enter instead of clicking submit.
   * Only processes if user hasn't already guessed correctly.
   *
   * @param e - React keyboard event from the input element
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !hasGuessedCorrectly) {
      handleSubmitGuess();
    }
  };

  /**
   * Generate display content based on current game mode and song data.
   * Returns objects with blanked text (what user needs to guess) and
   * shown text (what's revealed as a hint).
   *
   * @returns Object with 'blanked' (masked text) and 'shown' (hint text) properties
   */
  const getDisplayContent = () => {
    if (!currentSong) return { blanked: "Loading...", shown: "" };

    if (mode === "title") {
      // Title guessing mode: blank the title, show the artist as hint
      return {
        blanked: `TITLE: ${createBlanks(currentSong.title)}`,
        shown: `ARTIST: ${currentSong.artist}`,
      };
    } else {
      // Artist guessing mode: blank the artist, show the title as hint
      return {
        blanked: `ARTIST: ${createBlanks(currentSong.artist)}`,
        shown: `TITLE: ${currentSong.title}`,
      };
    }
  };

  // Extract the display content for the current mode and song
  const { blanked, shown } = getDisplayContent();

  return (
    <div className="music-guess-game">
      {/* Main content area - blanked text that user needs to guess */}
      <div className="artist-label">
        <h1> {blanked} </h1>
      </div>

      {/* Hint section - shown text that provides context clue */}
      <div className="artist-label artist-label--spacing">
        <h2 className="artist-text">{shown}</h2>
      </div>

      {/* Song playback control - central play button */}
      <div className="central-circle-container">
        <button
          className="central-circle"
          onClick={() => songService.playSong()}
        >
          <img src={PlayIcon} className="circle-image" alt="Play button" />
        </button>
      </div>

      {/* User input section for typing guesses */}
      <div className="input-container">
        <input
          type="text"
          value={guess}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={
            hasGuessedCorrectly
              ? "CORRECT! WAIT FOR NEXT ROUND..." // Success state placeholder
              : "TYPE YOUR GUESS HERE..." // Default placeholder
          }
          className="guess-input"
          disabled={hasGuessedCorrectly} // Disable input after correct guess
        />
      </div>

      {/* Control buttons and feedback section */}
      <div className="controls">
        {/* Submit guess button - main interaction for submitting answers */}
        <button
          onClick={() => handleSubmitGuess()}
          disabled={hasGuessedCorrectly}
          className={`submit-btn ${
            hasGuessedCorrectly ? "submit-btn--disabled" : ""
          }`}
        >
          {hasGuessedCorrectly ? "Correct! ✅" : "Submit Guess"}
        </button>

        {/* Host-only skip button - allows host to skip current round */}
        {isHost && onHostSkip && (
          <button
            onClick={onHostSkip}
            disabled={hasGuessedCorrectly}
            className={`skip-btn ${
              hasGuessedCorrectly ? "skip-btn--disabled" : ""
            }`}
          >
            Skip Round
          </button>
        )}

        {/* Wrong guess feedback - appears when user guesses incorrectly */}
        {showWrongMessage && !hasGuessedCorrectly && (
          <div className="wrong-message">Try again! 🤔</div>
        )}
      </div>
    </div>
  );
};

export default SingleChoice;
