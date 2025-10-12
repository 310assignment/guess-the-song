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
      <div className="customizer-section">
        <div className="customizer-label">Choose avatar</div>
        <div className="avatar-grid">
          {avatars.map(a => (
            <button
              key={a.id}
              className={`avatar-btn ${avatar === a.id ? 'selected' : ''}`}
              onClick={() => setAvatar(a.id)}
              type="button"
              // apply background color; uses selected color only for the chosen avatar
              style={{ backgroundColor: avatar === a.id ? color : 'transparent' }}
              aria-label={`Choose ${a.id}`}
            >
              <img src={a.src} alt={a.id} />
            </button>
          ))}
        </div>
      </div>

      <div className="customizer-section">
        <div className="customizer-label">Choose color</div>
        <div className="color-grid">
          {colors.map(c => (
            <button
              key={c}
              className={`color-swatch ${color === c ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterCustomizer;