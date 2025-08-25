import { useEffect, useRef, useState, useCallback } from "react";

let currentAudio: HTMLAudioElement | null = null; // ensure only one plays at once

export function useAudioPlayer(url?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoaded = () => setDuration(audio.duration || 30);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnd = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audioRef.current = null;
    };
  }, [url]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentAudio && currentAudio !== audio) currentAudio.pause();
    currentAudio = audio;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      console.warn("Playback failed:", e);
    }
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const seek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(t, 0), duration || 30);
  }, [duration]);

  return { isPlaying, currentTime, duration, play, pause, seek };
}

// Example UI
export function PreviewPlayer({ url }: { url?: string }) {
  const { isPlaying, currentTime, duration, play, pause, seek } = useAudioPlayer(url);

  if (!url) return <p>No preview available</p>;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={isPlaying ? pause : play}
        className="rounded-xl px-3 py-2 shadow"
        aria-label={isPlaying ? "Pause preview" : "Play preview"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <input
        type="range"
        min={0}
        max={duration || 30}
        step={0.1}
        value={currentTime}
        onChange={(e) => seek(Number(e.target.value))}
        style={{ width: 200 }}
        aria-label="Preview progress"
        aria-valuemin={0}
        aria-valuemax={duration || 30}
        aria-valuenow={currentTime}
      />

      <span>
        {Math.floor(currentTime)}/{Math.floor(duration || 30)}s
      </span>
    </div>
  );
}