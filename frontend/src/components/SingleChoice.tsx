import React, { useState, useEffect } from "react";
import "../css/GuessSong.css";
import PlayIcon from "../assets/Play.png";
import { songService } from "../services/songServices";
import type { Song } from "../types/song";

const GuessSong: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [guess, setGuess] = useState<string>("");

  // Show blanks for the title
  const createBlanks = (text: string): string => {
    return text
      .split(" ")
      .map((word) => "_".repeat(word.length))
      .join("   ");
  };

  useEffect(() => {
    // Set initial song if one is already playing
    const cached = songService.getCachedSongs();
    if (cached.length > 0) {
      setCurrentSong(cached[0]);
    }

    // Subscribe to track changes
    songService.setOnTrackChange((song) => {
      setCurrentSong(song);
      setGuess(""); // reset guess when new song starts
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuess(e.target.value);
  };

  const handleSubmitGuess = () => {
    if (guess.toLowerCase().trim() === currentSong?.title.toLowerCase()) {
      alert("Correct! 🎉");
    } else {
      alert("Try again! 🤔");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
          placeholder="TYPE YOUR GUESS HERE..."
          className="guess-input"
        />
      </div>

      {/* Controls */}
      <div className="controls" style={{ marginTop: "1rem" }}>
        <button
          onClick={handleSubmitGuess}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#4ade80",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Submit Guess
        </button>
      </div>
    </div>
  );
};

export default GuessSong;
