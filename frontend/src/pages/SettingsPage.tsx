import Settings from '../components/Settings';
import '../css/SettingsPage.css';
import { useNavigate , useLocation } from 'react-router-dom';

const SettingsPage = () => {

  const navigate = useNavigate();

  const handleBackClick = () => {
    
    navigate('/lobby');
    console.log('Back button clicked');
  };

  const handleGameCodeClick = () => {
    // Add your game code logic here (copy to clipboard, etc.)
    console.log('Game code clicked');
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
        <Settings />
        
        {/* Create Room Button */}
        <div className="create-room-section">
          <button className="create-room-button" onClick={() => console.log('Create room clicked')}>
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;