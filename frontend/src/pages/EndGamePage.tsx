import '../css/EndGamePage.css';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { socket } from '../socket';
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'


/**
 * Represents the result of a player at the end of the game.
 */
interface PlayerResult {
  name: string;
  points: number;
  correctAnswers: number;
  totalRounds: number;
}

/**
 * EndGamePage - displays the final leaderboard and a button to return to the lobby.
 */
const EndGamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const [ totalRounds, setTotalRounds ] = useState(0);
  const code: string = location.state?.code || '';
  const currentPlayerName: string = location.state?.playerName || '';
  // Extract players from navigation state safely
  const [ players, setPlayers ] = useState<PlayerResult[]>([]);


  // Navigate back to the lobby screen
  const handleBackToLobby = (): void => {
    navigate("/lobby");
  };

    /* ----------------- SOCKET CONNECTION ----------------- */
  useEffect(() => {
    if (!socket?.connected) return;


    socket.emit("get-room-players-scores", code );
    socket.emit("get-total-rounds", code );

    // Listen for players joined the room
    socket.on("room-players-scores", ( playerScores ) => {
      setPlayers(playerScores);
    });

    // Get total rounds from game settings
    socket.on("total-rounds", (totalRounds: number) => {
      setTotalRounds(totalRounds);
    });

    return () => {
      socket.off("room-players-scores");
      socket.off("total-rounds");
    };
  }, [ code ]);

  return (
    <div className="end-game-container">
      {/* Confetti Effect */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={300}
        gravity={0.8}
      />
      
      {/* Game Title */}
      <div className="header-section">
        <div className="back-button">
          <button className="back-button" onClick={handleBackToLobby}>
            Back to Lobby
          </button>
        </div>
        <div className="game-title">Guessify</div>
      </div>      
      {/* Podium Rankings */}
      <Rankings rankings={players} totalNumberOfQuestions={totalRounds} currentPlayerName={currentPlayerName} />
    </div>
  );
};

/**
 * FinalRankings - displays the top 3 players in podium style
 */
interface FinalRankingsProps {
  rankings: PlayerResult[];
  totalNumberOfQuestions: number;
  currentPlayerName: string;
}

const Rankings: React.FC<FinalRankingsProps> = ({ rankings, totalNumberOfQuestions, currentPlayerName }) => {
  // Sort players by points in descending order (same method used for both podium and rankings)
  const sortedRankings = rankings.sort((a, b) => b.points - a.points);
  const [first, second, third] = sortedRankings;
  
  // Apply slide left animation only if there are more than 3 players
  const shouldSlideLeft = rankings.length > 3;

  const firstDiv = (
    <div className="column">
      <div className="first-bar">
        <div><b>{first?.points || 0}</b> pts</div>
        <div className="correct-answers">
          {first?.correctAnswers || 0} out of {totalNumberOfQuestions}
        </div>
      </div>
      <div className="nickname">{first?.name || "No Player"}</div>
    </div>
  );

  const secondDiv = second ? (
    <div className="column">
      <div className="second-bar">
        <div><b>{second.points}</b> pts</div>
        <div className="correct-answers">
          {second.correctAnswers} out of {totalNumberOfQuestions}
        </div>
      </div>
      <div className="nickname">{second.name}</div>
    </div>
  ) : (
    <div className="column">
      <div className="second-bar"></div>
    </div>
  );

  const thirdDiv = third ? (
    <div className="column">
      <div className="third-bar">
        <div><b>{third.points}</b> pts</div>
        <div className="correct-answers">
          {third.correctAnswers} out of {totalNumberOfQuestions}
        </div>
      </div>
      <div className="nickname">{third.name}</div>
    </div>
  ) : (
    <div className="column">
      <div className="third-bar"></div>
    </div>
  );

  return (
    <div className={`main-rankings`}>
      <div className={`podiums ${shouldSlideLeft ? 'slide-left' : ''}`}>
        <div className="podium-labels">
        {secondDiv}
        {firstDiv}
        {thirdDiv}
        </div>
        <div className="Podiums-Base"></div>
      </div>
      <div className={`scoreboard-container ${shouldSlideLeft ? 'slide-left' : ''}`}>
        <h2 className="final-rankings-title">Final Rankings</h2>
        <div className="player-rankings-list">
          {sortedRankings
            .map((player, index) => (
              <div key={player.name} className={`player-ranking-row ${player.name === currentPlayerName ? 'current-player' : ''}`}>
                <div className={`display-player-rank ${player.name === currentPlayerName ? 'current-player-rank' : ''}`}>
                  {index === 0 && <span className="rank-medal">🥇</span>}
                  {index === 1 && <span className="rank-medal">🥈</span>}
                  {index === 2 && <span className="rank-medal">🥉</span>}
                  {index > 2 && <span className="players-final-placing">#{index + 1}</span>}
                </div>
                <div className="player-details">
                  <span className="player-name-leaderboard">{player.name}</span>
                  <div className="player-stats">
                    <span className="player-points">{player.points} pts</span>
                    <span className="players-correct-answers">{player.correctAnswers} correct</span>
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