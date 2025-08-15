import React, { useState } from 'react';
import '../css/JoinRoom.css';
interface GuessifyProps {}
import { useNavigate } from 'react-router-dom';

const JoinRoom: React.FC<GuessifyProps> = () => {
  const [code, setCode] = useState<string>('');
  const navigate = useNavigate();
  
  const handleJoin = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (code.trim()) {
      console.log('Joining room with code:', code);
      navigate('/game');
      // Add your join room logic here
    }
  };

  const handleCreateRoom = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    console.log('Creating new room');
    // Add your create room logic here
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCode(e.target.value.toUpperCase());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleJoin(e);
    }
  };

  return (
    <div className="guessify-container">
      <div className="guessify-content">
        {/* Logo/Title */}
        <h1 className="guessify-title">
          Guessify
        </h1>
        
        {/* Input Section */}
        <div className="guessify-input-section">
          <input
            type="text"
            placeholder="ENTER CODE"
            value={code}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="guessify-input"
            maxLength={8}
          />
          <button
            onClick={handleJoin}
            className="guessify-join-button"
          >
            JOIN
          </button>
        </div>

        {/* Divider */}
        <div className="guessify-divider">
          <span className="guessify-or">OR</span>
        </div>
        
        {/* Create Room Button */}
        <button
          onClick={handleCreateRoom}
          className="guessify-create-button"
        >
          CREATE ROOM
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;