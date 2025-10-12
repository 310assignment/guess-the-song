import React, { useEffect, useState } from "react";
import "../css/JoinRoom.css";
import { songService } from "../services/songServices";
import { useNavigate, useLocation } from "react-router-dom";
import { isValidRoomCode } from "../utils/roomCode.tsx";


interface GuessifyProps {}

const JoinRoom: React.FC<GuessifyProps> = () => {
  const [code, setCode] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();
  const playerNameFromState = location.state?.playerName; // get name from EnterName
  
  const handleCreateRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    songService.fetchRandom().then((songs) => {
      console.log("Fetched songs", songs);
    });

    // Pass playerName along to SettingsPage
    navigate("/create_room", { state: { playerName: playerNameFromState } });
  };

  const handleJoinRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!code.trim()) {
          alert("Please enter a room code!");
          return;
        }
    
    if (!playerNameFromState) {
      alert("Please enter your name first!");
      return;
    }

    if (!isValidRoomCode(code)) {
      alert("Invalid room code format! Code should be 6 characters (letters and numbers).");
      return;
    }
    // Navigate to waiting room first, then host will start the game
    navigate(`/waiting/${code}`, { 
      state: { 
        playerName: playerNameFromState,
        isHost: false
      } 
    });
  };

  const handleBackClick = (): void => { 
    navigate("/"); 
  }; 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(value);
  };

  useEffect(() => {
    songService.fetchRandom().then((songs) => {
    console.log("Fetched songs", songs);
    });
  }, []);

  // Add this useEffect after the existing useState declarations
  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (playerNameFromState) {
      localStorage.setItem('playerName', playerNameFromState);
    } else if (savedName && !playerNameFromState) {
      navigate("/lobby", { state: { playerName: savedName } }); // Change underscore to hyphen
    }
  }, [playerNameFromState, navigate]);

  return (
    <div className="guessify-container">
      {/* Back Button */}
      <button onClick={handleBackClick} className="joinroom-back-button">
        <span className="joinroom-back-arrow">&lt;&lt;</span>
        <span className="joinroom-back-text">Back</span>
      </button>

      <div className="guessify-content">
        {/* Logo/Title */}
        <h1 className="guessify-title">Guessify</h1>

        {/* Input Section */}
        <div className="guessify-input-section">
          <input
            type="text"
            placeholder="ENTER CODE"
            value={code}
            onChange={handleInputChange}
            className="guessify-input"
            maxLength={8}
          />
          <button className="guessify-join-button"             
          onClick={handleJoinRoom}
          disabled={!code.trim()}
          >
            JOIN
          </button>
        </div>

        {/* Divider */}
        <div className="guessify-divider">
          <span className="guessify-or">OR</span>
        </div>

        {/* Create Room Button */}
        <button onClick={handleCreateRoom} className="guessify-create-button">
          CREATE ROOM
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;