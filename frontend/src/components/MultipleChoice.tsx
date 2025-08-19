// components/ChooseSong.tsx
import React from 'react';
import '../css/MultipleChoice.css';
import songIcon from '../assets/song-icon.png';

interface MultipleChoiceProps {
  options: string[];
  onSelect: (index: number) => void;
  selectedIndex: number | null;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ options, onSelect, selectedIndex }) => {
  return (
    <div className="choose-song-container">
      <h2>SONG:</h2>
      <div className="song-icon">
        <img src={songIcon} alt="Song Icon" />
      </div>
      <div className="answer-buttons">
        {options.map((option, index) => (
          <button
            key={index}
            className={`answer-btn ${selectedIndex === index ? 'selected' : ''}`}
            onClick={() => onSelect(index)}
          >
            {`${index + 1}. ${option}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoice;
