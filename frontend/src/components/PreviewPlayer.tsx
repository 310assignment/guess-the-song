// React hooks for component state management, DOM references, and optimization
import { useEffect, useRef, useState, useCallback } from "react";

// Global variable to ensure only one audio instance plays at a time across all components
let currentAudio: HTMLAudioElement | null = null; // ensure only one plays at once

/**
 * Custom hook for managing audio playback with controls
 * Provides play, pause, seek functionality and tracks playback state
 * Ensures only one audio instance plays globally to prevent audio conflicts
 *
 * @param url - Optional URL of the audio file to play
 * @returns Object containing playback state and control functions
 */
export function useAudioPlayer(url?: string) {
  // Ref to store the current audio element instance
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // State to track if audio is currently playing
  const [isPlaying, setIsPlaying] = useState(false);
  // State to track current playback position in seconds
  const [currentTime, setCurrentTime] = useState(0);
  // State to track total duration of the audio file
  const [duration, setDuration] = useState(0);

  // Effect to create and configure audio element when URL changes
  useEffect(() => {
    if (!url) return;

    // Create new audio element with the provided URL
    const audio = new Audio(url);
    audio.preload = "metadata"; // Preload metadata to get duration
    audioRef.current = audio;

    // Event handler for when audio metadata is loaded (duration available)
    const onLoaded = () => setDuration(audio.duration || 30);
    // Event handler for tracking playback progress
    const onTime = () => setCurrentTime(audio.currentTime);
    // Event handler for when audio playback ends
    const onEnd = () => setIsPlaying(false);

    // Register event listeners for audio events
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);

    // Cleanup function: pause audio and remove event listeners
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audioRef.current = null;
    };
  }, [url]); // Re-run effect when URL changes

  /**
   * Plays the audio, ensuring only one audio plays globally
   * Pauses any other currently playing audio before starting this one
   * Uses useCallback for performance optimization
   */
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Stop any other audio that might be playing globally
    if (currentAudio && currentAudio !== audio) currentAudio.pause();
    currentAudio = audio;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      // Handle cases where playback fails (e.g., user interaction required)
      console.warn("Playback failed:", e);
    }
  }, []);

  /**
   * Pauses the current audio playback
   * Updates the playing state to reflect the pause
   */
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  /**
   * Seeks to a specific time position in the audio
   * Clamps the time value between 0 and the duration to prevent invalid seeks
   *
   * @param t - Time in seconds to seek to
   */
  const seek = useCallback(
    (t: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      // Ensure seek time is within valid bounds (0 to duration)
      audio.currentTime = Math.min(Math.max(t, 0), duration || 30);
    },
    [duration]
  ); // Re-create when duration changes

  // Return all state and control functions for use in components
  return { isPlaying, currentTime, duration, play, pause, seek };
}

/**
 * PreviewPlayer component that provides a complete audio preview interface
 * Uses the useAudioPlayer hook to manage playback state and controls
 * Displays play/pause button, progress slider, and time information
 *
 * @param url - Optional URL of the audio file to preview
 */
export function PreviewPlayer({ url }: { url?: string }) {
  // Get all audio state and controls from the custom hook
  const { isPlaying, currentTime, duration, play, pause, seek } =
    useAudioPlayer(url);

  // Early return if no URL is provided
  if (!url) return <p>No preview available</p>;

  return (
    <div className="flex items-center gap-3">
      {/* Play/Pause toggle button */}
      <button
        type="button"
        onClick={isPlaying ? pause : play}
        className="rounded-xl px-3 py-2 shadow"
        aria-label={isPlaying ? "Pause preview" : "Play preview"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      {/* Progress slider for seeking through the audio */}
      <input
        type="range"
        min={0}
        max={duration || 30}
        step={0.1}
        value={currentTime}
        onChange={(e) => seek(Number(e.target.value))}
        style={{ width: 200 }}
        // Accessibility attributes for screen readers
        aria-label="Preview progress"
        aria-valuemin={0}
        aria-valuemax={duration || 30}
        aria-valuenow={currentTime}
      />

      {/* Time display showing current position and total duration */}
      <span>
        {Math.floor(currentTime)}/{Math.floor(duration || 30)}s
      </span>
    </div>
  );
}
