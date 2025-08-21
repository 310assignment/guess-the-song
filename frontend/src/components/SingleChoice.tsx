import React, { useState, useEffect } from "react";
import "../css/GuessSong.css";
import PlayIcon from "../assets/Play.png";
import { songService } from "../services/songServices";
import type { Song } from "../types/song";

interface SingleChoiceProps {
  onCorrectGuess: () => void;
  currentSong: Song | null;
  hasGuessedCorrectly: boolean;
}

const SingleChoice: React.FC<SingleChoiceProps> = ({ onCorrectGuess, currentSong, hasGuessedCorrectly }) => {
  const [guess, setGuess] = useState<string>("");

  // Show blanks for the title
  // Enhanced blanks function that handles punctuation and featuring
  const createBlanks = (text: string): string => {
    // Remove ALL content in brackets/parentheses (including nested ones)
    let mainTitle = text;

    // Remove parentheses and their content:
    mainTitle = mainTitle.replace(/\s*\([^)]*\)/g, '');

    // Handle standalone featuring without brackets
    mainTitle = mainTitle
      .replace(/\s*feat\.?\s+.*/gi, '')       // Remove feat. Artist (rest of string)
      .replace(/\s*ft\.?\s+.*/gi, '')         // Remove ft. Artist (rest of string)
      .replace(/\s*featuring\s+.*/gi, '')     // Remove featuring Artist (rest of string)
      .trim();

    // Strip all punctuation except spaces and convert to blanks
    const cleanTitle = mainTitle
      .replace(/[^\w\s]/g, '') // Remove all punctuation except word chars and spaces
      .replace(/\s+/g, ' ')    // Normalize multiple spaces to single space
      .trim();

    // Create blanks for each word
    return cleanTitle
      .split(' ')
      .filter(word => word.length > 0) // Remove empty strings
      .map(word => '_'.repeat(word.length))
      .join('   '); // 3 spaces between word blanks
  };

  // Function to normalize text for comparison (same logic as createBlanks)
  const normalizeForComparison = (text: string): string => {
    let mainTitle = text;

    // Remove parentheses and their content
    mainTitle = mainTitle.replace(/\s*\([^)]*\)/g, '');

    // Handle standalone featuring without brackets
    mainTitle = mainTitle
      .replace(/\s*feat\.?\s+.*/gi, '')
      .replace(/\s*ft\.?\s+.*/gi, '')
      .replace(/\s*featuring\s+.*/gi, '')
      .trim();

    // Strip all punctuation except spaces and normalize
    return mainTitle
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  useEffect(() => {
    // Reset guess when song changes
    setGuess("");
  }, [currentSong]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuess(e.target.value);
  };

  const handleSubmitGuess = () => {
    if (!currentSong || hasGuessedCorrectly) return;

    const normalizedGuess = normalizeForComparison(guess);
    const normalizedTitle = normalizeForComparison(currentSong.title);

    if (normalizedGuess === normalizedTitle) {
      alert("Correct! 🎉");
      onCorrectGuess(); // Notify parent component
    } else {
      alert("Try again! 🤔");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !hasGuessedCorrectly) {
      handleSubmitGuess();
    }
  };

  return (
    <div className="music-guess-game">
      {/* Title Label (hidden with blanks) */}
      <div className="artist-label">
        <h1>
          {currentSong
            ? `TITLE: ${createBlanks(currentSong.title)}`
            : "Loading..."}
        </h1>
      </div>

      {/* Artist Label */}
      <div
        className="artist-label"
        style={{ marginBottom: "2rem", marginTop: "1rem" }}
      >
        <h2 style={{ fontSize: "1.5rem", color: "#e5e7eb" }}>
          {currentSong ? `ARTIST: ${currentSong.artist}` : ""}
        </h2>
      </div>

      {/* Central Circle (play button) */}
      <div className="central-circle-container">
        <div className="central-circle" onClick={() => songService.playSong()}>
          <img src={PlayIcon} className="circle-image" alt="Play button" />
        </div>
      </div>

      {/* Input Field */}
      <div className="input-container">
        <input
          type="text"
          value={guess}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={hasGuessedCorrectly ? "CORRECT! WAIT FOR NEXT ROUND..." : "TYPE YOUR GUESS HERE..."}
          className="guess-input"
          disabled={hasGuessedCorrectly}
          style={{
            opacity: hasGuessedCorrectly ? 0.6 : 1,
            cursor: hasGuessedCorrectly ? 'not-allowed' : 'text'
          }}
        />
      </div>

      {/* Controls */}
      <div className="controls" style={{ marginTop: "1rem" }}>
        <button
          onClick={handleSubmitGuess}
          disabled={hasGuessedCorrectly}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: hasGuessedCorrectly ? "#666" : "#4ade80",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: hasGuessedCorrectly ? "not-allowed" : "pointer",
            fontWeight: "bold",
            opacity: hasGuessedCorrectly ? 0.6 : 1,
          }}
        >
          {hasGuessedCorrectly ? "Correct! ✅" : "Submit Guess"}
        </button>
      </div>
    </div>
  );
};

export default SingleChoice;