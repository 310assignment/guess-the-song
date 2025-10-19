// React imports for component functionality
import React, { useState, useEffect, useCallback, type JSX } from "react";
// Song service for managing audio playback across the application
import { songService } from "../services/songServices";
// Component-specific styles
import "../css/AudioControls.css";

// Props interface for AudioControls component
interface AudioControlsProps {
  className?: string; // Optional CSS class name for styling flexibility
}

// Volume threshold to determine which icon to display (below 0.5 = low volume icon)
const LOW_VOLUME_THRESHOLD = 0.5;

/** SVG icons split into small pure components for readability */

/**
 * Muted icon component - displays when audio is muted or volume is 0
 * Shows a speaker with a slash through it to indicate muted state
 */
const MutedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

/**
 * Low volume icon component - displays when volume is between 0 and 0.5
 * Shows a speaker with single sound wave to indicate low volume
 */
const LowVolumeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
  </svg>
);

/**
 * High volume icon component - displays when volume is above 0.5
 * Shows a speaker with multiple sound waves to indicate full volume
 */
const HighVolumeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

/**
 * AudioControls component provides volume control and mute functionality
 * Syncs with the songService to maintain consistent audio state across the app
 */
const AudioControls: React.FC<AudioControlsProps> = ({ className = "" }) => {
  // Local state for mute status - initialized from songService
  const [isMuted, setIsMuted] = useState(songService.getCurrentMutedState());
  // Local state for volume level (0-1) - initialized from songService
  const [volume, setVolume] = useState(songService.getCurrentVolume());

  // Sync songService volume whenever local volume state changes
  useEffect(() => {
    songService.setVolume(volume);
  }, [volume]);

  // Sync songService mute state whenever local mute state changes
  useEffect(() => {
    songService.setMuted(isMuted);
  }, [isMuted]);

  // Initialize component state and set up service listeners on mount
  useEffect(() => {
    // Callback function to handle mute state changes from songService
    const handleMuteChange = (muted: boolean) => setIsMuted(muted);

    // Initialize local state with current songService values
    setVolume(songService.getCurrentVolume());
    setIsMuted(songService.getCurrentMutedState());
    // Register listener for external mute state changes
    songService.setOnMuteStateChange(handleMuteChange);

    // Cleanup function - remove listener when component unmounts
    return () => {
      songService.setOnMuteStateChange(undefined);
    };
  }, []); // Empty dependency array - runs only on mount/unmount

  // Event handlers wrapped in useCallback to prevent unnecessary re-renders

  /**
   * Toggles the mute state between muted and unmuted
   * Does not change the volume level, just the mute status
   */
  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  /**
   * Updates the volume level and automatically unmutes if volume is changed
   * Design choice: changing volume should unmute the audio
   */
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(false); // design choice: unmute on change
  }, []);

  /**
   * Handles clicks on the volume slider wrapper
   * Unmutes audio if currently muted (allows quick unmute by clicking slider area)
   */
  const handleSliderClick = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  /**
   * Determines which volume icon to display based on current state
   * Returns appropriate icon component for muted, low volume, or high volume
   */
  const getVolumeIcon = (): JSX.Element => {
    if (isMuted || volume === 0) {
      return <MutedIcon />;
    }
    if (volume < LOW_VOLUME_THRESHOLD) {
      return <LowVolumeIcon />;
    }
    return <HighVolumeIcon />;
  };

  // Calculate display volume percentage (0-100) for UI display
  // Show 0% when muted, otherwise show actual volume percentage
  const displayVolume = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div className={`audio-controls ${className}`}>
      <div className="audio-controls-container">
        <div className="volume-control">
          {/* Mute/Unmute Toggle Button */}
          <button
            className="audio-btn volume-icon-btn"
            onClick={handleMuteToggle}
            title={isMuted ? "Unmute" : "Mute"}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {getVolumeIcon()}
          </button>

          {/* Volume Slider Container - clickable area that can unmute */}
          <div className="volume-slider-wrapper" onClick={handleSliderClick}>
            {/* Range input for volume control */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume} // Show 0 when muted, actual volume when not muted
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="volume-slider"
              title={`Volume: ${displayVolume}%`}
              aria-label={`Volume control, currently ${displayVolume}%`}
            />
            {/* Visual display of current volume percentage */}
            <div className="volume-percentage">{displayVolume}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
