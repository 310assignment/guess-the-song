import { useEffect, useRef, useState } from "react";

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

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    // stop any other preview that might be playing
    if (currentAudio && currentAudio !== audio) currentAudio.pause();
    currentAudio = audio;

    try {
      await audio.play(); // requires a user gesture on mobile
      setIsPlaying(true);
    } catch (e) {
      // Autoplay blocked or other error
      console.warn("Playback failed:", e);
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  };

  const seek = (t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(t, 0), duration || 30);
  };

  return { isPlaying, currentTime, duration, play, pause, seek };
}

// Example UI
export function PreviewPlayer({ url }: { url?: string }) {
  const { isPlaying, currentTime, duration, play, pause, seek } =
    useAudioPlayer(url);
  if (!url) return <p>No preview available</p>;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={isPlaying ? pause : play}
        className="rounded-xl px-3 py-2 shadow"
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
      />

      <span>
        {Math.floor(currentTime)}/{Math.floor(duration || 30)}s
      </span>
    </div>
  );
}
