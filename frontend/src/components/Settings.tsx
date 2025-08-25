import '../css/Settings.css';

// Import setting icons
import PlayersIcon from '../assets/setting-icons/Players.png';
import ModeIcon from '../assets/setting-icons/Vector.png';
import RoundIcon from '../assets/setting-icons/Round.png';
import TimerIcon from '../assets/setting-icons/Timer.png';

// Define shape of settings state
interface GameSettings {
  players: string;
  guessType: string;
  gameMode: string;
  rounds: string;
  guessTime: string;
}

// Props expected by Settings component
interface SettingsProps {
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

// Dropdown options for each setting
const options = {
  players: ['Single Player', '2 Players', '3 Players', '4 Players', '5 Players', '6 Players', '7 Players', '8 Players'],
  gameMode: ['Single Song', 'Mixed Songs'],
  rounds: ['5 Rounds', '10 Rounds', '15 Rounds', '20 Rounds'],
  guessTime: ['10 sec', '15 sec', '20 sec', '30 sec'],
};

// Icon & Label mapping for each setting
const icons = {
  players: { src: PlayersIcon, label: 'PLAYERS' },
  gameMode: { src: ModeIcon, label: 'GAME MODE' },
  rounds: { src: RoundIcon, label: 'ROUNDS' },
  guessTime: { src: TimerIcon, label: 'GUESS TIME' },
};

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  // Update settings when a dropdown changes
  const handleChange = (key: keyof GameSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    console.log(`${key} changed to:`, value);
  };

  // Reusable dropdown renderer method
  const renderDropdown = (key: keyof typeof options) => (
    <div className="setting-row" key={key}>
      <div className="setting-info">
        <div className="setting-icon">
          <img src={icons[key].src} alt={icons[key].label} />
        </div>
        <span className="setting-label">{icons[key].label}</span>
      </div>
      <select
        className="setting-dropdown"
        value={settings[key]}
        onChange={(e) => handleChange(key, e.target.value)}
      >
        {options[key].map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="settings-container">
      {renderDropdown('players')}
      {renderDropdown('gameMode')}
      {renderDropdown('rounds')}
      {renderDropdown('guessTime')}
    </div>
  );
};

export default Settings;
