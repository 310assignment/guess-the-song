import React from "react";
import "../css/RoundScoreDisplay.css";

interface Player {
  name: string;
  points: number;
  previousPoints: number;
  correctAnswers: number;
}

interface RoundScoreDisplayProps {
  players: Player[];
  roundNumber: number;
  totalRounds: number;
  onContinue: () => void;
  isFinalRound?: boolean;
  correctAnswer?: string;
  playerGotCorrect?: boolean;
  isTimeUp?: boolean;
}

const RoundScoreDisplay: React.FC<RoundScoreDisplayProps> = ({
  players,
  roundNumber,
  totalRounds,
  onContinue,
  isFinalRound = false,
  correctAnswer,
  playerGotCorrect = true,
  isTimeUp = false,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="round-score-display">
      <div className="round-score-header">
        <h2>{isFinalRound ? 'Game Complete!' : `Round ${roundNumber} Complete!`}</h2>
        <p className="round-progress">{roundNumber} of {totalRounds}</p>
      </div>
      
      <div className="score-changes">
        {sortedPlayers.map((player, index) => {
          const scoreChange = player.points - player.previousPoints;
          const isPositive = scoreChange > 0;
          const isZero = scoreChange === 0;
          
          return (
            <div key={index} className="player-score-change">
              <div className="player-info">
                <span className="player-name">{player.name}</span>
                <div className="score-details">
                  <span className="total-score">{player.points} pts</span>
                  {!isZero && (
                    <span className={`score-change ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? '+' : ''}{scoreChange}
                    </span>
                  )}
                </div>
              </div>
              <div className="player-rank">
                {index === 0 && <span className="rank-medal">🥇</span>}
                {index === 1 && <span className="rank-medal">🥈</span>}
                {index === 2 && <span className="rank-medal">🥉</span>}
                {index > 2 && <span className="rank-number">#{index + 1}</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Show correct answer for all cases */}
      {correctAnswer && (
        <div className={`correct-answer-section ${playerGotCorrect ? 'correct' : 'incorrect'}`}>
          <div className="correct-answer-message">
            {playerGotCorrect ? (
              <>
                <span className="correct-icon">✅</span>
                <span className="correct-text">Correct!</span>
              </>
            ) : (
              <>
                <span className="incorrect-icon">❌</span>
                <span className="incorrect-text">{isTimeUp ? "Time's up!" : "Incorrect!"}</span>
              </>
            )}
          </div>
          <div className="correct-answer-display">
            <span className="correct-label">Correct answer:</span>
            <span className="correct-answer">{correctAnswer}</span>
          </div>
        </div>
      )}
      
      <div className="continue-section">
        <button className="continue-button" onClick={onContinue}>
          {isFinalRound ? 'View Final Results' : `Continue to Round ${roundNumber + 1}`}
        </button>
      </div>
    </div>
  );
};

export default RoundScoreDisplay;
