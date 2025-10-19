import React from "react";
import "../css/GameHeader.css";
import timerIcon from "../assets/Timer.png";
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
   * Uses the browser's clipboard API to copy the invite code
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
  };

  return (
    <header className="game-header">
      {/* Left section: Round number and timer */}
      <div className="header-left">
        <div className="round-label">ROUND {roundNumber}</div>
        <div className="timer-container">
          <img src={timerIcon} alt="Timer Icon" className="timer-icon" />
          <span className="timer">{timer}</span>
        </div>
      </div>

      {/* Center section: Game title */}
      <div className="header-center">
        <h1 className="title">Guessify</h1>
      </div>

      {/* Right section: Invite code with copy functionality */}
      <div className="header-right">
        <div className="game-code-section">
          <span className="invite-text">INVITE CODE:</span>
          <button className="game-code-button" onClick={handleCopy}>
            <span className="code-text">{inviteCode}</span>
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
