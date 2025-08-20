import React, { useState, useEffect } from "react";
import "../css/InGamePage.css";
import Scoreboard from "../components/Scoreboard";
import GameHeader from "../components/GameHeader";
import MultipleChoice from "../components/MultipleChoice";
import SingleChoice from "../components/SingleChoice";
import { useLocation } from "react-router-dom";
import { songService } from "../services/songServices";
import type { Song } from "../types/song";

interface GuessifyProps {}

const InGamePage: React.FC<GuessifyProps> = () => {
  const players = [
    { name: "Player Name 1", points: 0 },
    { name: "Player Name 2", points: 0 },
    { name: "Player Name 3", points: 0 },
    { name: "Player Name 4", points: 0 },
    { name: "Player Name 5", points: 0 },
    { name: "Player Name 6", points: 0 },
    { name: "Player Name 7", points: 0 },
  ];

  const location = useLocation();
  const settings = location.state as {
    rounds: string;
    guessTime: string;
    gameMode: string;
  };

  // Round Logic
  const totalRounds = parseInt(settings?.rounds) || 10;
  const roundTime = parseInt(settings?.guessTime) || 30;
  const isSingleSong = settings?.gameMode?.startsWith("Listening (");

  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(roundTime);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [isIntermission, setIsIntermission] = useState(false);
  const [inviteCode] = useState("ABC123");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // For multiple-choice mode
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");

  // --- helpers ---
  const getRandomSongs = (num: number): Song[] => {
    const all = songService.getCachedSongs();
    const shuffled = [...all].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  const generateOptions = (correctSongs: Song[]): string[] => {
    const all = songService.getCachedSongs();
    const correctTitles = correctSongs.map((s) => s.title);

    function randomMix(): string {
      const shuffled = [...all].sort(() => 0.5 - Math.random());
      return shuffled
        .slice(0, 3)
        .map((s) => s.title)
        .join(", ");
    }

    const opts: string[] = [];
    opts.push(correctTitles.join(", ")); // correct

    while (opts.length < 4) {
      const mix = randomMix();
      if (!opts.includes(mix)) opts.push(mix);
    }

    return opts.sort(() => 0.5 - Math.random());
  };

  // --- selection ---
  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    const chosen = options[index];

    if (chosen === correctAnswer) {
      alert("✅ Correct!");
      // mark correct, but DO NOT advance; next song will play at round end
    } else {
      alert(`❌ Wrong! Correct mix was: ${correctAnswer}`);
    }
  };

  // --- round lifecycle ---
  useEffect(() => {
    setIsRoundActive(true);
    setTimeLeft(roundTime);

    if (isSingleSong) {
      // For round 1, start current track; from round 2+, advance to next track
      if (currentRound === 1) {
        songService.playSong();
      } else {
        songService.playNextSong();
      }
    } else {
      // play 3 at once
      const chosen = getRandomSongs(3);
      songService.playMultiSong(chosen);

      const opts = generateOptions(chosen);
      setOptions(opts);
      setCorrectAnswer(chosen.map((s) => s.title).join(", "));
    }
  }, [currentRound]); // runs at start and every new round

  useEffect(() => {
    if (!isRoundActive || isIntermission) return;

    if (timeLeft <= 0) {
      handleRoundEnd();
      return;
    }

    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isRoundActive, isIntermission]);

  function handleRoundEnd() {
    if (currentRound < totalRounds) {
      setIsRoundActive(false);
      setIsIntermission(true);
      songService.stopSong(); // stops both single + multi

      setTimeout(() => {
        setCurrentRound((r) => r + 1); // ⬅️ triggers next song via effect above
        setTimeLeft(roundTime);
        setIsRoundActive(true);
        setIsIntermission(false);
        setSelectedIndex(null); // Reset selected answer for new round
      }, 5000);
    } else {
      songService.stopSong();
      alert("Game over!");
      setIsRoundActive(false);
      setSelectedIndex(null); // Also reset at game end
      songService.refreshKpop();
      console.log("Song cache refreshed");
    }
  }

  return (
    <div className="game-2-container">
      <GameHeader
        roundNumber={`${currentRound}/${totalRounds}`}
        timer={`${timeLeft}`}
        inviteCode={inviteCode}
      />
      <div className="game-2-body">
        <Scoreboard players={players} />

        {isSingleSong ? (
          <SingleChoice />
        ) : (
          <MultipleChoice
            options={options}
            onSelect={handleSelect}
            selectedIndex={selectedIndex}
          />
        )}
      </div>
    </div>
  );
};

export default InGamePage;
