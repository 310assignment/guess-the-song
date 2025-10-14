import React, { useEffect, useState } from "react";
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

  // props to display waiting state
  readonly timeLeft?: number;
  readonly playersRemaining?: number | null;

  // authoritative round timing so component can compute a live countdown
  readonly roundStartTime?: number | null;
  readonly roundDuration?: number;
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
  timeLeft = 0,
  playersRemaining = null,
  roundStartTime = null,
  roundDuration,
}) => {
  // Sort players by points descending
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  // Determine how many players are still playing
  // If server provided playersRemaining use that, otherwise derive from player score differences
  const derivedRemaining = players.filter(p => (p.points === p.previousPoints) ? true : false).length;
  // players with points === previousPoints may or may not have finished (server should supply playersRemaining)
  const remaining = typeof playersRemaining === "number" ? playersRemaining : derivedRemaining;

  // decide header: waiting vs complete
  const everyoneDone = remaining === 0;
  const showWaiting = !everyoneDone && !isTimeUp;

  // enable continue button only if host and either everyone done or timer expired
  const canContinue = isHost && (everyoneDone || isTimeUp);

  // compute remaining seconds (prefer server authoritative start + duration)
  const computeRemaining = (): number => {
    if (typeof roundStartTime === "number" && typeof roundDuration === "number") {
      const end = roundStartTime + roundDuration * 1000;
      return Math.max(0, Math.ceil((end - Date.now()) / 1000));
    }
    // fallback to provided timeLeft prop
    return Math.max(0, Math.ceil(Number(timeLeft ?? 0)));
  };

  // countdown state that updates every second while showing waiting
  const [countdown, setCountdown] = useState<number>(computeRemaining());

  useEffect(() => {
    // update immediately
    setCountdown(computeRemaining());

    if (!showWaiting) return;

    const id = setInterval(() => {
      const rem = computeRemaining();
      setCountdown(rem);
      if (rem <= 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  // include inputs that affect computation
  }, [roundStartTime, roundDuration, timeLeft, showWaiting, playersRemaining]);

  return (
    <div className="round-score-display">
      <div className="round-score-header">
        <h2>
          {showWaiting
            ? `Waiting on ${remaining} player${remaining === 1 ? "" : "s"}...`
            : (isFinalRound ? "Game Complete!" : `Round ${roundNumber} Complete!`)
          }
        </h2>
        <p className="round-progress">
          {roundNumber} of {totalRounds}
        </p>
        {showWaiting && (
          <p className="waiting-timer">Time left: {countdown}s</p>
        )}
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

      {/* Show continue section only when the round is actually over */}
      {(everyoneDone || isTimeUp) && (
        <div className="continue-section">
          {isHost ? (
            <button
              className="continue-button"
              onClick={onContinue}
              aria-label={isFinalRound ? "View final results" : `Continue to Round ${roundNumber + 1}`}
            >
              {isFinalRound ? "View Final Results" : `Continue to Round ${roundNumber + 1}`}
            </button>
          ) : (
            <button
              className="continue-button disabled"
              disabled
              aria-label="Waiting for host..."
            >
              Waiting for host...
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RoundScoreDisplay;