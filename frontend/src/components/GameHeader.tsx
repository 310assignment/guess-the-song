// React import for component functionality
import React from "react";
// Component-specific styles
import "../css/GameHeader.css";
// Timer icon asset for displaying next to countdown
import timerIcon from "../assets/Timer.png";
// Copy icon asset (currently imported but not used - svg is referenced directly in JSX)
import copyAndPasteIcon from "../assets/copy-and-paste.png";

/**
 * Props interface for the GameHeader component
 * @interface GameHeaderProps
 * @property {string} roundNumber - Current round number (e.g., "1/10")
 * @property {string} timer - Current timer value to display
 * @property {string} inviteCode - Room invite code for players to join
 * @property {boolean} [showInvite=true] -  flag to show/hide invite code section
 */
interface GameHeaderProps {
  roundNumber: string;
  timer: string;
  inviteCode: string;
  showInvite?: boolean;
}

/**
 * GameHeader Component
 *
 * Displays the main game header containing:
 * - Round number and timer on the left
 * - Game title "Guessify" in the center
 * - Invite code with copy functionality on the right
 *
 * @param {GameHeaderProps} props - Component props
 * @returns {JSX.Element} The game header component
 */
const GameHeader: React.FC<GameHeaderProps> = ({
  roundNumber,
  timer,
  inviteCode,
}) => {
  /**
   * Handles copying the invite code to the user's clipboard
   * Implements both modern clipboard API and fallback method for browser compatibility
   * Shows console feedback to indicate copy success or failure
   */
  const handleCopy = async () => {
    try {
      // Attempt to use the modern clipboard API (requires HTTPS or localhost)
      await navigator.clipboard.writeText(inviteCode);
      // Optional: Add visual feedback
      console.log("Invite code copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers or when clipboard API fails
      console.error("Failed to copy: ", err);

      // Fallback method using deprecated execCommand (works in more contexts)
      const textArea = document.createElement("textarea");
      textArea.value = inviteCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      console.log("Invite code copied using fallback method!");
    }
  };

  return (
    <header className="game-header">
      {/* Left section: Round number and timer display */}
      <div className="header-left">
        {/* Current round indicator */}
        <div className="round-label">ROUND {roundNumber}</div>
        {/* Timer display with icon */}
        <div className="timer-container">
          <img src={timerIcon} alt="Timer Icon" className="timer-icon" />
          <span className="timer">{timer}</span>
        </div>
      </div>

      {/* Center section: Game title/branding */}
      <div className="header-center">
        <h1 className="title">Guessify</h1>
      </div>

      {/* Right section: Invite code with copy functionality */}
      <div className="header-right">
        <div className="game-code-section">
          {/* Label for the invite code */}
          <span className="invite-text">INVITE CODE:</span>
          {/* Clickable button containing the code and copy icon */}
          <button className="game-code-button" onClick={handleCopy}>
            {/* The actual invite code text */}
            <span className="code-text">{inviteCode}</span>
            {/* Copy icon to indicate clickable copy functionality */}
            <span className="copy-icon">
              <img
                src="/src/assets/copy-symbol.svg"
                alt="Copy Icon"
                className="copy-icon-img"
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
