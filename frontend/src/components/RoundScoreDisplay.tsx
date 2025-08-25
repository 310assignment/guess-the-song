import React from "react";
import "../css/RoundScoreDisplay.css";

/**
 * Player interface for round score display
 * @interface Player
 * @property {string} name - Player's name
 * @property {number} points - Current total points
 * @property {number} previousPoints - Points before this round
 * @property {number} correctAnswers - Number of correct answers this round
 */
interface Player {
  name: string;
  points: number;
  previousPoints: number;
  correctAnswers: number;
}

/**
 * Props interface for the RoundScoreDisplay component
 * @interface RoundScoreDisplayProps
 * @property {Player[]} players - Array of players with their scores
 * @property {number} roundNumber - Current round number
 * @property {number} totalRounds - Total number of rounds in the game
 * @property {() => void} onContinue - Callback function to continue to next round
 * @property {boolean} [isFinalRound=false] - Whether this is the final round
 * @property {string} [correctAnswer] - The correct answer to display
 * @property {boolean} [playerGotCorrect=true] - Whether the player answered correctly
 * @property {boolean} [isTimeUp=false] - Whether the round ended due to time running out
 */
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

/**
 * RoundScoreDisplay Component
 * 
 * Displays the results of a completed round including:
 * - Round completion message and progress
 * - Player rankings with score changes
 * - Correct answer display with feedback
 * - Continue button to proceed to next round
 * 
 * @param {RoundScoreDisplayProps} props - Component props
 * @returns {JSX.Element} The round score display component
 */
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
  // Sort players by points in descending order for ranking display
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="round-score-display">
      {/* Round header with completion message and progress */}
      <div className="round-score-header">
        <h2>{isFinalRound ? 'Game Complete!' : `Round ${roundNumber} Complete!`}</h2>
        <p className="round-progress">{roundNumber} of {totalRounds}</p>
      </div>
      
      {/* Player rankings and score changes */}
      <div className="score-changes">
        {sortedPlayers.map((player, index) => {
          // Calculate score change for this round
          const scoreChange = player.points - player.previousPoints;
          const isPositive = scoreChange > 0;
          const isZero = scoreChange === 0;
          
          return (
            <div key={index} className="player-score-change">
              {/* Player info section with name and scores */}
              <div className="player-info">
                <span className="player-name">{player.name}</span>
                <div className="score-details">
                  <span className="total-score">{player.points} pts</span>
                  {/* Show score change if not zero */}
                  {!isZero && (
                    <span className={`score-change ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? '+' : ''}{scoreChange}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Player ranking with medals for top 3 */}
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
      
      {/* Correct answer display with feedback */}
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
      
      {/* Continue button section */}
      <div className="continue-section">
        <button className="continue-button" onClick={onContinue}>
          {isFinalRound ? 'View Final Results' : `Continue to Round ${roundNumber + 1}`}
        </button>
      </div>
    </div>
  );
};

export default RoundScoreDisplay;
