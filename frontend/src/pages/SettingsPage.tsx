import React from 'react';
import Settings from '../components/Settings';
import '../css/SettingsPage.css';

const SettingsPage = () => {
  return (
    <div className="settings-page">
      <div className="settings-page-background">
        <Settings />
      </div>
    </div>
  );
};

export default SettingsPage;