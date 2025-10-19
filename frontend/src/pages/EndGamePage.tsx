// Component-specific styling for the end game results page
import "../css/EndGamePage.css";
// React Router hooks for navigation and location state access
import { useLocation, useNavigate } from "react-router-dom";
// React hooks for component state and lifecycle management
import React, { useEffect, useState } from "react";
// Avatar image assets for player representation
import Avatar1 from "../assets/avatars/avatar1.png"; // Default avatar option
import Avatar2 from "../assets/avatars/avatar2.png"; // Second avatar option
import Avatar3 from "../assets/avatars/avatar3.png"; // Third avatar option
// Socket.io client for real-time communication with game server
import { socket } from "../socket";
// Hook for getting window dimensions (used for confetti sizing)
import { useWindowSize } from "react-use";
// Confetti animation component for celebration effect
import Confetti from "react-confetti";

/**
 * Interface representing a player's final game results.
 * Contains all the statistics needed for end-game leaderboard display.
 */
interface PlayerResult {
  name: string; // Player's display name
  points: number; // Total points earned during the game
  correctAnswers: number; // Number of correct answers given
  totalRounds: number; // Total number of rounds played
  avatar?: { id?: string; color?: string } | string; // Avatar configuration (object or string ID)
}

/**
 * Helper function to resolve avatar image source from avatar configuration.
 * Handles both string IDs and object configurations with fallback to default avatar.
 *
 * @param avatar - Avatar configuration (string ID or object with id property)
 * @returns Imported avatar image asset
 */
const avatarFor = (avatar: any) => {
  // Extract avatar ID from string or object, default to "a1"
  const id = typeof avatar === "string" ? avatar : avatar?.id || "a1";
  // Return appropriate avatar image based on ID
  if (id === "a2") return Avatar2;
  if (id === "a3") return Avatar3;
  return Avatar1; // Default fallback avatar
};

/**
 * EndGamePage component for displaying final game results and leaderboard.
 * Shows confetti celebration, final rankings with podium display, and navigation back to lobby.
 * Fetches player scores and game statistics from the server via socket communication.
 *
 * Displays:
 * - Celebratory confetti animation
 * - Game title and back button
 * - Podium-style rankings for top 3 players
 * - Complete leaderboard with all player statistics
 */
const EndGamePage: React.FC = () => {
  const location = useLocation(); // Access to navigation state data
  const navigate = useNavigate(); // Navigation function for routing
  const { width, height } = useWindowSize(); // Window dimensions for confetti sizing

  // Game statistics state
  const [totalRounds, setTotalRounds] = useState(0);
  // Extract room code and player name from navigation state
  const code: string = location.state?.code || "";
  const currentPlayerName: string = location.state?.playerName || "";
  // Player results data fetched from server
  const [players, setPlayers] = useState<PlayerResult[]>([]);

  /**
   * Navigate back to the main lobby/home screen.
   * Allows players to start a new game or join different rooms.
   */
  const handleBackToLobby = (): void => {
    navigate("/lobby");
  };

  /* ----------------- SOCKET CONNECTION ----------------- */
  /**
   * Set up socket communication to fetch final game results.
   * Requests player scores and total rounds from server, then listens for responses.
   * Cleans up socket listeners on component unmount or code change.
   */
  useEffect(() => {
    // Only proceed if socket is connected
    if (!socket?.connected) return;

    // Request final game data from server
    socket.emit("get-room-players-scores", code); // Get all player final scores
    socket.emit("get-total-rounds", code); // Get total number of rounds played

    // Listen for player scores response from server
    socket.on("room-players-scores", (playerScores) => {
      setPlayers(playerScores);
    });

    // Listen for total rounds response from server
    socket.on("total-rounds", (totalRounds: number) => {
      setTotalRounds(totalRounds);
    });

    // Cleanup socket listeners when component unmounts or dependencies change
    return () => {
      socket.off("room-players-scores");
      socket.off("total-rounds");
    };
  }, [code]);

  return (
    <div className="end-game-container">
      {/* Celebratory confetti animation covering the entire screen */}
      <Confetti
        width={width} // Match window width
        height={height} // Match window height
        recycle={false} // Don't loop the animation
        numberOfPieces={300} // Number of confetti pieces
        gravity={0.8} // Falling speed
      />

      {/* Header section with navigation and game branding */}
      <div className="header-section">
        <div className="back-button">
          <button className="back-button" onClick={handleBackToLobby}>
            Back to Lobby
          </button>
        </div>
        <div className="game-title">Guessify</div>
      </div>

      {/* Main rankings display with podium and leaderboard */}
      <Rankings
        rankings={players} // All player results
        totalNumberOfQuestions={totalRounds} // Total rounds for statistics
        currentPlayerName={currentPlayerName} // Highlight current player
      />
    </div>
  );
};

/**
 * Rankings component for displaying final game results in podium and list format.
 * Shows top 3 players on an Olympic-style podium with additional leaderboard below.
 * Highlights the current player and applies animations when there are many players.
 */
interface FinalRankingsProps {
  rankings: PlayerResult[]; // Array of all player results
  totalNumberOfQuestions: number; // Total rounds played (for statistics display)
  currentPlayerName: string; // Name of current player (for highlighting)
}

const Rankings: React.FC<FinalRankingsProps> = ({
  rankings,
  totalNumberOfQuestions,
  currentPlayerName,
}) => {
  // Sort players by points in descending order for consistent ranking
  // Used for both podium display and detailed leaderboard
  const sortedRankings = rankings.sort((a, b) => b.points - a.points);
  // Extract top 3 players for podium display
  const [first, second, third] = sortedRankings;

  // Determine if slide animation should be applied
  // Animation helps fit both podium and leaderboard when there are many players
  const shouldSlideLeft = rankings.length > 3;

  // First place podium element - tallest position in center
  const firstDiv = (
    <div className="column">
      {/* Score display bar for first place */}
      <div className="first-bar">
        <div>
          <b>{first?.points || 0}</b> pts
        </div>
        <div className="correct-answers">
          {first?.correctAnswers || 0} out of {totalNumberOfQuestions}
        </div>
      </div>
      {/* Player avatar and name section */}
      <div className="nickname">
        <div
          className="podium-avatar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            // Apply custom background color if avatar has color property
            backgroundColor:
              first?.avatar && typeof first.avatar === "object"
                ? first.avatar.color
                : "transparent",
            marginBottom: 1,
          }}
        >
          <img
            src={avatarFor(first?.avatar)}
            alt={`${first?.name || "Player"} avatar`}
          />
        </div>
        <span>{first?.name || "No Player"}</span>
      </div>
    </div>
  );

  // Second place podium element - medium height on left side
  // Conditionally rendered only if second place player exists
  const secondDiv = second ? (
    <div className="column">
      {/* Score display bar for second place */}
      <div className="second-bar">
        <div>
          <b>{second.points}</b> pts
        </div>
        <div className="correct-answers">
          {second.correctAnswers} out of {totalNumberOfQuestions}
        </div>
      </div>
      {/* Player avatar and name section */}
      <div className="nickname">
        <div
          className="podium-avatar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            // Apply custom background color if avatar has color property
            backgroundColor:
              second?.avatar && typeof second.avatar === "object"
                ? second.avatar.color
                : "transparent",
            marginBottom: 1,
          }}
        >
          <img
            src={avatarFor(second?.avatar)}
            alt={`${second?.name || "Player"} avatar`}
          />
        </div>
        <span>{second.name}</span>
      </div>
    </div>
  ) : (
    // Empty column placeholder when no second place player
    <div className="column">
      <div className="second-bar"></div>
    </div>
  );

  // Third place podium element - shortest height on right side
  // Conditionally rendered only if third place player exists
  const thirdDiv = third ? (
    <div className="column">
      {/* Score display bar for third place */}
      <div className="third-bar">
        <div>
          <b>{third.points}</b> pts
        </div>
        <div className="correct-answers">
          {third.correctAnswers} out of {totalNumberOfQuestions}
        </div>
      </div>
      {/* Player avatar and name section */}
      <div className="nickname">
        <div
          className="podium-avatar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            // Apply custom background color if avatar has color property
            backgroundColor:
              third?.avatar && typeof third.avatar === "object"
                ? third.avatar.color
                : "transparent",
            marginBottom: 1,
          }}
        >
          <img
            src={avatarFor(third?.avatar)}
            alt={`${third?.name || "Player"} avatar`}
          />
        </div>
        <span>{third.name}</span>
      </div>
    </div>
  ) : (
    // Empty column placeholder when no third place player
    <div className="column">
      <div className="third-bar"></div>
    </div>
  );

  return (
    <div className={`main-rankings`}>
      {/* Podium section displaying top 3 players in Olympic-style layout */}
      <div className={`podiums ${shouldSlideLeft ? "slide-left" : ""}`}>
        <div className="podium-labels">
          {/* Podium order: 2nd, 1st, 3rd (Olympic-style arrangement) */}
          {secondDiv} {/* Left side - second place */}
          {firstDiv} {/* Center - first place (tallest) */}
          {thirdDiv} {/* Right side - third place */}
        </div>
        {/* Base platform for the podium */}
        <div className="Podiums-Base"></div>
      </div>

      {/* Detailed leaderboard section with all players */}
      <div
        className={`scoreboard-container ${
          shouldSlideLeft ? "slide-left" : ""
        }`}
      >
        <h2 className="final-rankings-title">Final Rankings</h2>
        <div className="player-rankings-list">
          {/* Map through all players to create detailed ranking list */}
          {sortedRankings.map((player, index) => (
            <div
              key={player.name}
              className={`player-ranking-row ${
                // Highlight current player's row
                player.name === currentPlayerName ? "current-player" : ""
              }`}
            >
              {/* Rank display with medals for top 3, numbers for others */}
              <div
                className={`display-player-rank ${
                  player.name === currentPlayerName ? "current-player-rank" : ""
                }`}
              >
                {/* Medal emojis for top 3 positions */}
                {index === 0 && <span className="rank-medal">🥇</span>}
                {index === 1 && <span className="rank-medal">🥈</span>}
                {index === 2 && <span className="rank-medal">🥉</span>}
                {/* Numeric ranks for 4th place and below */}
                {index > 2 && (
                  <span className="players-final-placing">#{index + 1}</span>
                )}
              </div>

              {/* Player details section with avatar, name, and statistics */}
              <div className="player-details">
                {/* Avatar and name display */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Avatar container with custom background color */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      // Apply custom color if avatar is object with color property
                      backgroundColor:
                        player.avatar && typeof player.avatar === "object"
                          ? player.avatar.color
                          : "transparent",
                    }}
                  >
                    {/* Avatar image */}
                    <img
                      src={avatarFor(player.avatar)}
                      style={{ width: 28, height: 28, borderRadius: "50%" }}
                    />
                  </div>
                  {/* Player name */}
                  <span className="player-name-leaderboard">{player.name}</span>
                </div>

                {/* Statistics section with points and correct answers */}
                <div className="player-stats">
                  <span className="player-points">{player.points} pts</span>
                  <span className="players-correct-answers">
                    {player.correctAnswers} correct
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EndGamePage;
