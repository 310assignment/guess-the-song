import React from "react";
import "../css/RoundScoreDisplay.css";
import Avatar1 from "../assets/avatars/avatar1.png";
import Avatar2 from "../assets/avatars/avatar2.png";
import Avatar3 from "../assets/avatars/avatar3.png";

/** Player interface for round score display */
interface Player {
  readonly name: string;
  readonly points: number;
  readonly previousPoints: number;
  readonly correctAnswers: number;
  readonly avatar?: { id?: string; color?: string } | string;
  readonly hasParticipatedThisRound?: boolean; 
}

/** Props interface for RoundScoreDisplay component */
interface RoundScoreDisplayProps {
  readonly players: Player[];
  readonly roundNumber: number;
  readonly totalRounds: number;
  readonly onContinue: () => void;
  readonly isFinalRound?: boolean;
  readonly correctAnswer?: string;
  readonly playerGotCorrect?: boolean;
  readonly isTimeUp?: boolean;
  readonly isHost?: boolean;
}

const avatarFor = (avatar: any) => {
  const id = typeof avatar === "string" ? avatar : (avatar?.id || "a1");
  if (id === "a2") return Avatar2;
  if (id === "a3") return Avatar3;
  return Avatar1;
};

const RoundScoreDisplay: React.FC<RoundScoreDisplayProps> = ({
  players,
  roundNumber,
  totalRounds,
  onContinue,
  isFinalRound = false,
  correctAnswer,
  playerGotCorrect = true,
  isTimeUp = false,
  isHost = false,
}) => {
  // Sort players by points descending
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="round-score-display">
      <div className="round-score-header">
        <h2>{isFinalRound ? "Game Complete!" : `Round ${roundNumber} Complete!`}</h2>
        <p className="round-progress">
          {roundNumber} of {totalRounds}
        </p>
      </div>

      <div className="score-changes">
        {sortedPlayers.map((player, index) => {
          const scoreChange = player.points - player.previousPoints;
          const isPositive = scoreChange > 0;
          const isZero = scoreChange === 0;
          
          // Only show score change if it's actually positive (player earned points)
          // Don't show negative changes or zero changes
          const shouldShowScoreChange = scoreChange > 0;

          return (
            <div key={player.name} className="player-score-change">
              <div className="player-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: (player as any).avatar && typeof (player as any).avatar === 'object' ? (player as any).avatar.color : 'transparent'
                  }}>
                    <img src={avatarFor((player as any).avatar)} alt={`${player.name} avatar`} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  </div>
                  <span className="player-name">{player.name}</span>
                </div>
                <div className="score-details">
                  <span className="total-score">{player.points} pts</span>
                  {shouldShowScoreChange && (
                    <span className="score-change positive">
                      +{scoreChange}
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

      {correctAnswer && (
        <div
          className={`correct-answer-section ${playerGotCorrect ? "correct" : "incorrect"}`}
        >
          <div className="correct-answer-message">
            {playerGotCorrect ? (
              <>
                <span className="correct-icon">✅</span>
                <span className="correct-text">Correct!</span>
              </>
            ) : (
              <>
                <span className="incorrect-icon">❌</span>
                <span className="incorrect-text">
                  {isTimeUp ? "Time's up!" : "Incorrect!"}
                </span>
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
        <button
          className={`continue-button ${!isHost ? 'disabled' : ''}`}
          onClick={isHost ? onContinue : undefined}
          disabled={!isHost}
          aria-label={
            isHost 
              ? (isFinalRound ? "View final results" : `Continue to Round ${roundNumber + 1}`)
              : (isFinalRound ? "Waiting for host to view results" : `Waiting to start Round ${roundNumber + 1}`)
          }
        >
          {isHost 
            ? (isFinalRound ? "View Final Results" : `Continue to Round ${roundNumber + 1}`)
            : (isFinalRound ? "Waiting for host..." : `Waiting to start Round ${roundNumber + 1}`)
          } 
          </button>
      </div>
    </div>
  );
};

export default RoundScoreDisplay;