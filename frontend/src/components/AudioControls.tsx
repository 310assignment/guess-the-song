import React, { useState, useEffect } from 'react';
import { songService } from '../services/songServices';
import '../css/AudioControls.css';

interface AudioControlsProps {
  className?: string;
}

/**
 * AudioControls component provides volume control and mute functionality
 * Syncs with the songService to maintain consistent audio state across the app
 */
const AudioControls: React.FC<AudioControlsProps> = ({ className = '' }) => {
  const [isMuted, setIsMuted] = useState(songService.getCurrentMutedState());
  const [volume, setVolume] = useState(songService.getCurrentVolume());

  useEffect(() => {
    songService.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    songService.setMuted(isMuted);
  }, [isMuted]);

  // Initialize component state and set up service listeners
  useEffect(() => {
    setVolume(songService.getCurrentVolume());
    setIsMuted(songService.getCurrentMutedState());
    
    songService.setOnMuteStateChange((muted) => {
      setIsMuted(muted);
    });
    
    // Cleanup: prevent memory leaks from dangling event listeners
    return () => {
      songService.setOnMuteStateChange(undefined);
    };
  }, []);

  // Toggle mute state when mute button is clicked
  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    songService.setMuted(newMutedState);
  };

  // Update volume and unmute when slider is changed
  // Design Decision: Always unmute when volume changes
  // This provides intuitive UX - adjusting volume implies user wants audio
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(false);
    songService.setVolume(newVolume);
    songService.setMuted(false);
  };

  // Unmute when clicking on the slider track (if currently muted)
  const handleSliderClick = () => {
    if (isMuted) {
      setIsMuted(false);
      songService.setMuted(false);
    }
  };

  // Determine which volume icon to display based on mute state and volume level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      // Muted icon
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      );
    } else if (volume < 0.5) {
      // Low volume icon
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
        </svg>
      );
    } else {
      // High volume icon
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      );
    }
  };

  // Calculate display volume (0 when muted, otherwise actual volume as percentage)
  const displayVolume = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div className={`audio-controls ${className}`}>
      <div className="audio-controls-container">
        <div className="volume-control">
          {/* Mute/Unmute Button */}
          <button
            className="audio-btn volume-icon-btn"
            onClick={handleMuteToggle}
            title={isMuted ? "Unmute" : "Mute"}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {getVolumeIcon()}
          </button>

          {/* Volume Slider Container */}
          <div className="volume-slider-wrapper" onClick={handleSliderClick}>
            {/* Volume Range Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="volume-slider"
              title={`Volume: ${displayVolume}%`}
              aria-label={`Volume control, currently ${displayVolume}%`}
            />
            
            {/* Volume Percentage Display */}
            <div className="volume-percentage">
              {displayVolume}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioControls;