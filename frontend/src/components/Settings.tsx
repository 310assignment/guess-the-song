import '../css/Settings.css';

import PlayersIcon from '../assets/setting-icons/Players.png';
import ModeIcon from '../assets/setting-icons/Vector.png';
import RoundIcon from '../assets/setting-icons/Round.png';
import TimerIcon from '../assets/setting-icons/Timer.png';
import HintIcon from '../assets/setting-icons/Hints.png';

interface SettingsProps {
  settings: {
    players: string;
    guessType: string;
    gameMode: string;
    rounds: string;
    guessTime: string;
    hints: string;
  };
  setSettings: React.Dispatch<React.SetStateAction<{
    players: string;
    guessType: string;
    gameMode: string;
    rounds: string;
    guessTime: string;
    hints: string;
  }>>;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  const handleSettingChange = (setting: string, value: string): void => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    console.log(`${setting} changed to:`, value);
  };

  const playerOptions = ['Single Player', '2 Players', '3 Players', '4 Players', '5 Players', '6 Players', '7 Players', '8 Players'];
  // const guessTypeOptions = ['Guess Song', 'Guess Artist'];
  const gameModeOptions = ['Listening (1 sec)', 'Listening (5 sec)', 'Listening (10 sec)', 'Mixed Songs'];
  const roundOptions = ['5 Rounds', '10 Rounds', '15 Rounds', '20 Rounds'];
  const timeOptions = ['10 sec', '15 sec', '20 sec', '30 sec'];
  const hintOptions = ['0', '1', '2', '3', '4', '5'];

  return (
    <div className="settings-container">
      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-icon">
            <img src={PlayersIcon} alt="Players" />
          </div>
          <span className="setting-label">PLAYERS</span>
        </div>
        <select
          className="setting-dropdown"
          value={settings.players}
          onChange={(e) => handleSettingChange('players', e.target.value)}
        >
          {playerOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* <div className="setting-row">
        <div className="setting-info">
          <div className="setting-icon">
            <img src={GuessIcon} alt="Guess" />
          </div>
          <span className="setting-label">GUESS ARTIST/SONG</span>
        </div>
        <select
          className="setting-dropdown"
          value={settings.guessType}
          onChange={(e) => handleSettingChange('guessType', e.target.value)}
        >
          {guessTypeOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div> */}


      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-icon">
            <img src={ModeIcon} alt="GameMode" />
          </div>
          <span className="setting-label">GAME MODE</span>
        </div>
        <select
          className="setting-dropdown"
          value={settings.gameMode}
          onChange={(e) => handleSettingChange('gameMode', e.target.value)}
        >
          {gameModeOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-icon">
            <img src={RoundIcon} alt="Rounds" />
          </div>
          <span className="setting-label">ROUNDS</span>
        </div>
        <select
          className="setting-dropdown"
          value={settings.rounds}
          onChange={(e) => handleSettingChange('rounds', e.target.value)}
        >
          {roundOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-icon">
            <img src={TimerIcon} alt="Time" />
          </div>
          <span className="setting-label">GUESS TIME</span>
        </div>
        <select
          className="setting-dropdown"
          value={settings.guessTime}
          onChange={(e) => handleSettingChange('guessTime', e.target.value)}
        >
          {timeOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <div className="setting-icon">
            <img src={HintIcon} alt="Hints" />
          </div>
          <span className="setting-label">HINTS</span>
        </div>
        <select
          className="setting-dropdown"
          value={settings.hints}
          onChange={(e) => handleSettingChange('hints', e.target.value)}
        >
          {hintOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Settings;