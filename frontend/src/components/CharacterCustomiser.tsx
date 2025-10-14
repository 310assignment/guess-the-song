import React from 'react';
import Avatar1 from '../assets/avatars/avatar1.png';
import Avatar2 from '../assets/avatars/avatar2.png';
import Avatar3 from '../assets/avatars/avatar3.png';
import '../css/CharacterCustomiser.css';

interface Props {
  avatar: string;
  setAvatar: (a: string) => void;
  color: string;
  setColor: (c: string) => void;
}

const avatars = [
  { id: 'a1', src: Avatar1 },
  { id: 'a2', src: Avatar2 },
  { id: 'a3', src: Avatar3 },
];

const colors = ['#FFD166', '#06D6A0', '#118AB2', '#EF476F'];

const CharacterCustomizer: React.FC<Props> = ({ avatar, setAvatar, color, setColor }) => {
  return (
    <div className="customizer">
      {/* Row 1: labels (distinct cells) */}
      <div className="label-cell avatar-label">
        <div className="customizer-label">Choose avatar</div>
      </div>
      <div className="label-cell color-label">
        <div className="customizer-label">Choose color</div>
      </div>

      {/* Row 2: controls (distinct cells) */}
      <div className="controls-cell avatar-controls">
        <div className="avatar-grid">
          {avatars.map(a => (
            <button
              key={a.id}
              className={`avatar-btn ${avatar === a.id ? 'selected' : ''}`}
              onClick={() => setAvatar(a.id)}
              type="button"
              style={{ backgroundColor: avatar === a.id ? color : 'transparent' }}
              aria-label={`Choose ${a.id}`}
            >
              <img src={a.src} alt={a.id} />
            </button>
          ))}
        </div>
      </div>

      <div className="controls-cell color-controls">
        <div className="color-grid">
          {colors.map(c => (
            <button
              key={c}
              className={`color-swatch ${color === c ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              type="button"
              aria-label={`Choose color ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterCustomizer;