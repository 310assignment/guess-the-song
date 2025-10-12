import React, { useState, useEffect } from 'react';
import '../css/EnterName.css';
interface GuessifyProps {}
import { useNavigate } from 'react-router-dom';

const EnterName: React.FC<GuessifyProps> = () => {
  const [name, setName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('playerName', name.trim());
      navigate('/lobby', { state: { playerName: name.trim() } }); // Change underscore to hyphen
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSubmit(e);
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
            placeholder="ENTER NAME"
            value={name}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="guessify-input"
          />
          <button
            onClick={handleSubmit}
            className="guessify-button"
          >
            GO
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterName;