// React imports for component functionality and hooks
import React, { useEffect, useState } from "react";
// Component-specific styles for round score display and leaderboard
import "../css/RoundScoreDisplay.css";
// Avatar image assets for player display (three different character options)
import Avatar1 from "../assets/avatars/avatar1.png";
import Avatar2 from "../assets/avatars/avatar2.png";
import Avatar3 from "../assets/avatars/avatar3.png";

/**
 * Player interface for round score display
 * Contains all player information needed to show round results and progress
 */
interface Player {
  readonly name: string; // Player's display name
  readonly points: number; // Current total points
  readonly previousPoints: number; // Points before this round (for calculating score change)
  readonly correctAnswers: number; // Total number of correct answers
  readonly avatar?: { id?: string; color?: string } | string; // Avatar configuration (image and color)
  readonly hasParticipatedThisRound?: boolean; // Whether player has finished this round
}

/**
 * Props interface for RoundScoreDisplay component
 * Defines all data and callbacks needed for displaying round results and managing game flow
 */
interface RoundScoreDisplayProps {
  readonly players: Player[]; // Array of players with their current scores
  readonly roundNumber: number; // Current round number (1-based)
  readonly totalRounds: number; // Total number of rounds in the game
  readonly onContinue: () => void; // Callback to proceed to next round or end game
  readonly isFinalRound?: boolean; // Whether this is the last round of the game
  readonly correctAnswer?: string; // The correct answer to display
  readonly playerGotCorrect?: boolean; // Whether the current player answered correctly
  readonly isTimeUp?: boolean; // Whether the round timer has expired
  readonly isHost?: boolean; // Whether current user is the host (can continue game)

  // Props for displaying waiting state while round is still active
  readonly timeLeft?: number; // Seconds remaining in the round
  readonly playersRemaining?: number | null; // Number of players still answering

  // Authoritative round timing props for accurate countdown calculation
  readonly roundStartTime?: number | null; // Unix timestamp when round started
  readonly roundDuration?: number; // Round duration in seconds
}

/**
 * Helper function to get the correct avatar image based on avatar configuration
 * Handles both string and object avatar formats, defaults to Avatar1 if invalid
 *
 * @param avatar - Avatar configuration (string ID or object with id property)
 * @returns The appropriate avatar image import
 */
const avatarFor = (avatar: any) => {
  const id = typeof avatar === "string" ? avatar : avatar?.id || "a1";
  if (id === "a2") return Avatar2;
  if (id === "a3") return Avatar3;
  return Avatar1;
};

/**
 * RoundScoreDisplay component shows round results and manages game flow
 * Displays player scores, rank changes, correct answers, and continue controls
 * Handles both "waiting for players" and "round complete" states
 *
 * @param players - Array of players with current and previous scores
 * @param roundNumber - Current round number for display
 * @param totalRounds - Total rounds for progress tracking
 * @param onContinue - Callback to advance to next round or end game
 * @param isFinalRound - Whether this is the final round (changes button text)
 * @param correctAnswer - Correct answer to display (if any)
 * @param playerGotCorrect - Whether current player answered correctly
 * @param isTimeUp - Whether round timer has expired
 * @param isHost - Whether current user can control game flow
 * @param timeLeft - Fallback time remaining if authoritative timing unavailable
 * @param playersRemaining - Number of players still answering
 * @param roundStartTime - Authoritative round start timestamp
 * @param roundDuration - Round duration for accurate countdown
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
  isHost = false,
  timeLeft = 0,
  playersRemaining = null,
  roundStartTime = null,
  roundDuration,
}) => {
  // Sort players by points in descending order for leaderboard display
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  // Determine how many players are still actively playing this round
  // If server provided playersRemaining use that, otherwise derive from player score differences
  const derivedRemaining = players.filter((p) =>
    p.points === p.previousPoints ? true : false
  ).length;
  // Note: players with points === previousPoints may or may not have finished (server should supply playersRemaining)
  const remaining =
    typeof playersRemaining === "number" ? playersRemaining : derivedRemaining;

  // Determine current round state: waiting for players vs round complete
  const everyoneDone = remaining === 0;
  const showWaiting = !everyoneDone && !isTimeUp;

  // Enable continue button only if user is host and either everyone is done or timer expired
  const canContinue = isHost && (everyoneDone || isTimeUp);

  /**
   * Computes remaining seconds in the round using authoritative timing when available
   * Falls back to provided timeLeft prop if authoritative timing is unavailable
   *
   * @returns Number of seconds remaining in the round (minimum 0)
   */
  const computeRemaining = (): number => {
    if (
      typeof roundStartTime === "number" &&
      typeof roundDuration === "number"
    ) {
      // Use authoritative server timing for accurate countdown
      const end = roundStartTime + roundDuration * 1000;
      return Math.max(0, Math.ceil((end - Date.now()) / 1000));
    }
    // Fallback to provided timeLeft prop
    return Math.max(0, Math.ceil(Number(timeLeft ?? 0)));
  };

  // Countdown state that updates every second while showing waiting state
  const [countdown, setCountdown] = useState<number>(computeRemaining());

  /**
   * Effect to manage countdown timer updates
   * Updates countdown every second while in waiting state
   * Cleans up interval when component unmounts or waiting ends
   */
  useEffect(() => {
    // Update countdown immediately when effect runs
    setCountdown(computeRemaining());

    // Don't start interval if not in waiting state
    if (!showWaiting) return;

    // Set up interval to update countdown every second
    const id = setInterval(() => {
      const rem = computeRemaining();
      setCountdown(rem);
      // Clear interval when countdown reaches zero
      if (rem <= 0) clearInterval(id);
    }, 1000);

    // Cleanup function to clear interval on unmount or dependency change
    return () => clearInterval(id);
    // Include inputs that affect computation in dependency array
  }, [roundStartTime, roundDuration, timeLeft, showWaiting, playersRemaining]);

  return (
    <div className="round-score-display">
      {/* Header section showing round status and progress */}
      <div className="round-score-header">
        <h2>
          {showWaiting
            ? `Waiting on ${remaining} player${remaining === 1 ? "" : "s"}...`
            : isFinalRound
            ? "Game Complete!"
            : `Round ${roundNumber} Complete!`}
        </h2>
        <p className="round-progress">
          {roundNumber} of {totalRounds}
        </p>
        {/* Show countdown timer only during waiting state */}
        {showWaiting && (
          <p className="waiting-timer">Time left: {countdown}s</p>
        )}
      </div>

      {/* Player score changes and current rankings */}
      <div className="score-changes">
        {/* Map through sorted players to display score information */}
        {sortedPlayers.map((player, index) => {
          const scoreChange = player.points - player.previousPoints;
          // Variables for potential future use in score change logic
          const isPositive = scoreChange > 0;
          const isZero = scoreChange === 0;

          // Only show score change if it's actually positive (player earned points)
          // Don't show negative changes or zero changes
          const shouldShowScoreChange = scoreChange > 0;

          return (
            <div key={player.name} className="player-score-change">
              {/* Player information section with avatar and name */}
              <div className="player-info">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Avatar display with background color */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        (player as any).avatar &&
                        typeof (player as any).avatar === "object"
                          ? (player as any).avatar.color
                          : "transparent",
                    }}
                  >
                    <img
                      src={avatarFor((player as any).avatar)}
                      alt={`${player.name} avatar`}
                      style={{ width: 32, height: 32, borderRadius: "50%" }}
                    />
                  </div>
                  <span className="player-name">{player.name}</span>
                </div>
                {/* Score information: total points and change indicator */}
                <div className="score-details">
                  <span className="total-score">{player.points} pts</span>
                  {/* Only show positive score changes */}
                  {shouldShowScoreChange && (
                    <span className="score-change positive">
                      +{scoreChange}
                    </span>
                  )}
                </div>
              </div>

              {/* Ranking display: medals for top 3, numbers for others */}
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

      {/* Correct answer section - only shown if correct answer is provided */}
      {correctAnswer && (
        <div
          className={`correct-answer-section ${
            playerGotCorrect ? "correct" : "incorrect"
          }`}
        >
          {/* Message indicating whether player got it right or wrong */}
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
          {/* Display of the actual correct answer */}
          <div className="correct-answer-display">
            <span className="correct-label">Correct answer:</span>
            <span className="correct-answer">{correctAnswer}</span>
          </div>
        </div>
      )}

      {/* Continue section - only shown when round is actually complete */}
      {(everyoneDone || isTimeUp) && (
        <div className="continue-section">
          {isHost ? (
            // Host can continue to next round or view final results
            <button
              className="continue-button"
              onClick={onContinue}
              aria-label={
                isFinalRound
                  ? "View final results"
                  : `Continue to Round ${roundNumber + 1}`
              }
            >
              {isFinalRound
                ? "View Final Results"
                : `Continue to Round ${roundNumber + 1}`}
            </button>
          ) : (
            // Non-hosts see disabled button with waiting message
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
