import React from 'react';
import '../css/GameHeader.css';
import timerIcon from '../assets/Timer.png';
import copyAndPasteIcon from '../assets/copy-and-paste.png';


interface GameHeaderProps {
  roundNumber: string;
  timer: string;
  inviteCode: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({ roundNumber, timer, inviteCode }) => {
    const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
  };

  return (
    <header className="game-header">
      <div className="header-left">
        <div className="round-label">ROUND {roundNumber}</div>
        <div className="timer-container">
            <img src={timerIcon} alt="Timer Icon" className="timer-icon" />
            <span className="timer">{timer}</span>
        </div>
      </div>

      <div className="header-center">
        <h1 className="title">Guessify</h1>
      </div>

    <div className="header-right">
        <div className="invite-container">
          <span className="invite-label">INVITE CODE:</span>
          <div className="invite-code-wrapper">
            <span className="invite-code">{inviteCode}</span>
            <img
              src={copyAndPasteIcon}
              alt="Copy code"
              className="copy-and-paste-icon"
              onClick={handleCopy}
            />
          </div>
        </div>
      </div>
    </header>

  );
};

export default GameHeader;