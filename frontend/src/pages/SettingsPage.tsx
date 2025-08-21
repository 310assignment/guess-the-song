import Settings from "../components/Settings";
import "../css/SettingsPage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SettingsPage = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    players: "Single Player",
    guessType: "Guess Song",
    gameMode: "Single Song",
    rounds: "10 Rounds",
    guessTime: "15 sec",
    hints: "3",
  });

  const handleBackClick = () => {
    navigate("/lobby");
    console.log("Back button clicked");
  };

  const handleGameCodeClick = () => {
    // Add your game code logic here (copy to clipboard, etc.)
    console.log("Game code clicked");
  };

  const handleCreateRoom = () => {
    // Navigate to InGamePage and passthe settings state

    navigate("/game", { state: settings });
  };

  return (
    <div className="settings-page">
      <div className="settings-page-background">
        {/* Header */}
        <div className="settings-header">
          <button className="back-button" onClick={handleBackClick}>
            <span className="back-arrow">&lt;&lt;</span>
            <span className="back-text">Back</span>
          </button>

          <div className="logo">
            <span className="logo-text">Guessify</span>
          </div>

          <div className="game-code-section">
            <span className="invite-text">INVITE CODE:</span>
            <button className="game-code-button" onClick={handleGameCodeClick}>
              <span className="code-text">ABC123</span>
              <span className="copy-icon">📋</span>
            </button>
          </div>
        </div>

        {/* Settings Component */}
        <Settings settings={settings} setSettings={setSettings} />

        {/* Create Room Button */}
        <div className="create-room-section">
          <button className="create-room-button" onClick={handleCreateRoom}>
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
