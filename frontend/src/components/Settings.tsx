// Component-specific styling for the settings interface
import "../css/Settings.css";
// React library for component functionality
import React from "react";

// Setting icon assets - visual indicators for each configuration option
import PlayersIcon from "../assets/setting-icons/Players.png"; // Player count setting icon
import ModeIcon from "../assets/setting-icons/Vector.png"; // Game mode and genre setting icon
import RoundIcon from "../assets/setting-icons/Round.png"; // Rounds count setting icon
import TimerIcon from "../assets/setting-icons/Timer.png"; // Guess time setting icon

// Available music genres for the game - readonly tuple for type safety
const GENRES = [
  "kpop",
  "pop",
  "hiphop",
  "karaoke hits",
  "top hits",
  "r&b",
] as const;
// Type derived from the GENRES array for type checking
export type Genre = (typeof GENRES)[number];

// Player count mapping object - maps display strings to actual numeric values
// Supports 1-8 players for multiplayer gameplay
export const PlayerCount = {
  "Single Player": 1,
  "2 Players": 2,
  "3 Players": 3,
  "4 Players": 4,
  "5 Players": 5,
  "6 Players": 6,
  "7 Players": 7,
  "8 Players": 8,
} as const;

// Rounds count mapping object - maps display strings to actual numeric values
// Supports different game lengths from quick 5-round games to longer 20-round sessions
export const RoundsCount = {
  "5 Rounds": 5,
  "10 Rounds": 10,
  "15 Rounds": 15,
  "20 Rounds": 20,
} as const;

// Type definitions for the mapping object keys - ensures type safety for valid player/round options
export type PlayerCountKey = keyof typeof PlayerCount;
export type RoundsCountKey = keyof typeof RoundsCount;

// Helper function to convert player count display string to numeric value
// @param playerString - Display string like "5 Players"
// @returns Numeric player count, defaults to 1 if invalid string provided
export const getPlayerCount = (playerString: string): number => {
  return PlayerCount[playerString as PlayerCountKey] || 1;
};

// Helper function to convert rounds count display string to numeric value
// @param roundsString - Display string like "10 Rounds"
// @returns Numeric rounds count, defaults to 10 if invalid string provided
export const getRoundsCount = (roundsString: string): number => {
  return RoundsCount[roundsString as RoundsCountKey] || 10;
};

// Helper function to convert numeric player count back to display string
// @param count - Numeric player count
// @returns Display string like "5 Players", or "Unknown" if count not found
export const getPlayerCountString = (count: number): string => {
  const entry = Object.entries(PlayerCount).find(
    ([, value]) => value === count
  );
  return entry ? entry[0] : "Unknown";
};

// Helper function to convert numeric rounds count back to display string
// @param count - Numeric rounds count
// @returns Display string like "10 Rounds", or "Unknown" if count not found
export const getRoundsCountString = (count: number): string => {
  const entry = Object.entries(RoundsCount).find(
    ([, value]) => value === count
  );
  return entry ? entry[0] : "Unknown";
};

// Interface defining the complete game configuration state
// Used by parent components to manage and persist game settings
export interface GameSettings {
  amountOfPlayers: number; // Number of players (1-8)
  guessType: string; // How players input guesses (currently unused in UI)
  gameMode: string; // Type of game mode (Single Song, Mixed Songs, etc.)
  rounds: number; // Number of rounds to play (5, 10, 15, or 20)
  guessTime: string; // Time limit per guess (10s, 15s, 20s, 30s)
  genre: Genre; // Music genre preference
}

// Props interface for the Settings component
interface SettingsProps {
  settings: GameSettings; // Current settings state
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>; // State setter function
}

// Configuration object defining all available options for each setting type
// These arrays populate the dropdown menus in the UI
const options = {
  // Player count options - supports single player up to 8 players
  amountOfPlayers: [
    "Single Player",
    "2 Players",
    "3 Players",
    "4 Players",
    "5 Players",
    "6 Players",
    "7 Players",
    "8 Players",
  ],
  // Game mode variations - different ways to play the guessing game
  gameMode: [
    "Single Song",
    "Mixed Songs",
    "Guess the Artist",
    "Reverse Song",
    "Quick Guess - 1s",
    "Quick Guess - 3s",
    "Quick Guess - 5s",
  ],
  // Available round counts - different game session lengths
  rounds: ["5 Rounds", "10 Rounds", "15 Rounds", "20 Rounds"],
  // Time limits for each guess attempt
  guessTime: ["10 sec", "15 sec", "20 sec", "30 sec"],
  // Music genres - references the GENRES constant defined above
  genre: GENRES,
};

// Icon and label configuration for each setting type
// Provides visual indicators and text labels for the settings interface
const icons = {
  amountOfPlayers: { src: PlayersIcon, label: "PLAYERS" }, // Player count setting display
  gameMode: { src: ModeIcon, label: "GAME MODE" }, // Game mode setting display
  rounds: { src: RoundIcon, label: "ROUNDS" }, // Rounds count setting display
  guessTime: { src: TimerIcon, label: "GUESS TIME" }, // Time limit setting display
  genre: { src: ModeIcon, label: "GENRE" }, // Genre setting display (reuses mode icon)
};

/**
 * Settings component for configuring game parameters before starting a match.
 * Provides dropdown interfaces for all customizable game options including
 * player count, game mode, rounds, time limits, and music genre.
 *
 * @param settings - Current game settings state object
 * @param setSettings - React state setter function to update settings
 */
const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  // Handle dropdown value changes and update settings state accordingly
  // Special handling for numeric values (players/rounds) vs string values
  const handleChange = (key: keyof GameSettings, value: string) => {
    // Convert player count string to numeric value using helper function
    if (key === "amountOfPlayers" && value in PlayerCount) {
      setSettings((prev) => ({ ...prev, [key]: getPlayerCount(value) }));
    }
    // Convert rounds count string to numeric value using helper function
    else if (key === "rounds" && value in RoundsCount) {
      setSettings((prev) => ({ ...prev, [key]: getRoundsCount(value) }));
    }
    // For all other settings, store the string value directly
    else {
      setSettings((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Reusable dropdown renderer function - creates consistent UI for each setting type
  // @param key - The setting type to render (must exist in options object)
  // @returns JSX element containing icon, label, and dropdown select
  const renderDropdown = (key: keyof typeof options) => (
    <div className="setting-row" key={key}>
      {/* Setting icon and label section */}
      <div className="setting-info">
        <div className="setting-icon">
          <img src={icons[key].src} alt={icons[key].label} />
        </div>
        <span className="setting-label">{icons[key].label}</span>
      </div>
      {/* Dropdown select element with current value and change handler */}
      <select
        className="setting-dropdown"
        value={(() => {
          // Convert numeric values back to display strings for dropdown display
          if (key === "amountOfPlayers")
            return getPlayerCountString(settings[key]);
          if (key === "rounds") return getRoundsCountString(settings[key]);
          // For string values, use the setting value directly
          return settings[key];
        })()}
        onChange={(e) => handleChange(key, e.target.value)}
      >
        {/* Generate option elements from the options configuration */}
        {options[key].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="settings-container">
      {/* Render all available settings dropdowns in specific order */}
      {renderDropdown("amountOfPlayers")} {/* Player count selection */}
      {renderDropdown("gameMode")} {/* Game mode selection */}
      {renderDropdown("rounds")} {/* Number of rounds selection */}
      {renderDropdown("guessTime")} {/* Time limit selection */}
      {renderDropdown("genre")} {/* Music genre selection */}
    </div>
  );
};

export default Settings;
