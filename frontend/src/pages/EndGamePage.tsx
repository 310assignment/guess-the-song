import '../css/EndGamePage.css';
import Leaderboard from "../components/Leaderboard";

interface GuessifyProps {}

const EndGamePage: React.FC<GuessifyProps> = () => {
  const players = [
    { name: "Player 1", points: 49800, scoreDetail: "10/10" },
    { name: "Player 2", points: 48700, scoreDetail: "9/10" },
    { name: "Player 3", points: 45000, scoreDetail: "7/10" },
    { name: "Player 4", points: 42500, scoreDetail: "6/10" },
    { name: "Player 5", points: 40000, scoreDetail: "6/10" },
  ];

  return (
    <div className="end-game-container">
      <Leaderboard players={players} />
      <div className="end-game-button">
        <button className="back-button">Back to Lobby</button>
      </div>
    </div>
  );
};

export default EndGamePage;