import '../css/EndGamePage.css';
//import Leaderboard from "../components/Leaderboard";
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

  // Extract players from navigation state safely
  const [ players, setPlayers ] = useState<PlayerResult[]>([]);

  // Format player data for Leaderboard: "correctAnswers / totalRounds"
  const formattedPlayers = players.map((p) => ({
    name: p.name,
    points: p.points,
    scoreDetail: `${p.correctAnswers}/${totalRounds}`,
  }));

  // Navigate back to the lobby screen
  const handleBackToLobby = (): void => {
    navigate("/lobby");
  };

    /* ----------------- SOCKET CONNECTION ----------------- */
  useEffect(() => {
    if (!socket || !socket.connected) return;


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
      <Rankings rankings={players} totalNumberOfQuestions={totalRounds} />
    </div>
  );
};

/**
 * FinalRankings - displays the top 3 players in podium style
 */
interface FinalRankingsProps {
  rankings: PlayerResult[];
  totalNumberOfQuestions: number;
}

const Rankings: React.FC<FinalRankingsProps> = ({ rankings, totalNumberOfQuestions }) => {
  // For testing purposes - add dummy players if none exist
  const testPlayers: PlayerResult[] = rankings.length === 0 ? [
    { name: "Alice", points: 850, correctAnswers: 8, totalRounds: 10 },
    { name: "Bob", points: 720, correctAnswers: 7, totalRounds: 10 },
    { name: "Charlie", points: 680, correctAnswers: 6, totalRounds: 10 },
    { name: "Diana", points: 540, correctAnswers: 5, totalRounds: 10 },
    { name: "Eve", points: 430, correctAnswers: 4, totalRounds: 10 },
    { name: "Frank", points: 320, correctAnswers: 3, totalRounds: 10 }
  ] : rankings;

  const [first, second, third] = testPlayers;
  const [currentPlayerName, setCurrentPlayerName] = useState<string>('Eve'); // Set to Alice for testing
  
  // Apply slide left animation only if there are more than 3 players
  //const shouldSlideLeft = rankings.length > 3;
  const shouldSlideLeft = true;

  // Get current player name from socket
  useEffect(() => {
    if (!socket || !socket.connected) return;

    socket.emit("get-player-name");
    
    socket.on("player-name", (playerName: string) => {
      setCurrentPlayerName(playerName);
    });

    return () => {
      socket.off("player-name");
    };
  }, []);

  const firstDiv = (
    <div className="column">
      <div className="first-bar">
        <div>{first?.points || 0} pts</div>
        <div>{first?.correctAnswers || 0} out of {totalNumberOfQuestions}</div>
      </div>
      <div className="nickname">{first?.name || "No Player"}</div>
    </div>
  );

  const secondDiv = second ? (
    <div className="column">
      <div className="second-bar">
        <div>{second.points} pts</div>
        <div>{second.correctAnswers} out of {totalNumberOfQuestions}</div>
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
        <div>{third.points} pts</div>
        <div>{third.correctAnswers} out of {totalNumberOfQuestions}</div>
      </div>
      <div className="nickname">{third.name}</div>
    </div>
  ) : (
    <div className="column">
      <div className="third-bar"></div>
    </div>
  );

  return (
    <div className={`main-rankings ${shouldSlideLeft ? 'slide-left' : ''}`}>
      <div className="podiums">
        <div className="podium-labels">
        {secondDiv}
        {firstDiv}
        {thirdDiv}
        </div>
        <div className="Podiums-Base"></div>
      </div>
      <div className="scoreboard-container">
        <h2 className="final-rankings-title">Final Rankings</h2>
        <div className="player-rankings-list">
          {testPlayers
            .sort((a, b) => b.points - a.points)
            .map((player, index) => (
              <div key={player.name} className={`player-ranking-row ${player.name === currentPlayerName ? 'current-player' : ''}`}>
                <div className={`player-rank ${player.name === currentPlayerName ? 'current-player-rank' : ''}`}>
                  {index === 0 && <span className="rank-medal">🥇</span>}
                  {index === 1 && <span className="rank-medal">🥈</span>}
                  {index === 2 && <span className="rank-medal">🥉</span>}
                  {index > 2 && <span className="rank-number">#{index + 1}</span>}
                </div>
                <div className="player-details">
                  <span className="player-name">{player.name}</span>
                  <div className="player-stats">
                    <span className="player-points">{player.points} pts</span>
                    <span className="player-correct">{player.correctAnswers} correct</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// const FinalRankingsList: React.FC<FinalRankingsProps> = ({ rankings }) => {
//   return (
//     <div className="final-rankings-container">
//       <h2 className="final-rankings-title">Final Rankings</h2>
//       <Scoreboard players={rankings} />
//       </div>
//   )
// }


export default EndGamePage;