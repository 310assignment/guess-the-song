import React, { useState, useEffect, useRef } from "react";
import "../css/InGamePage.css";
import Scoreboard from "../components/Scoreboard";
import GameHeader from "../components/GameHeader";
import MultipleChoice from "../components/MultipleChoice";
import SingleChoice from "../components/SingleChoice";
import AudioControls from "../components/AudioControls";
import { useLocation } from "react-router-dom";
import { songService } from "../services/songServices";
import type { Song } from "../types/song";

interface GuessifyProps { }

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
  const isSingleSong = settings?.gameMode === "Single Song";

  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(roundTime);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [isIntermission, setIsIntermission] = useState(false);
  const [inviteCode] = useState("ABC123");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Track if user guessed correctly in SingleChoice mode
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // Track if user has selected correctly in MultipleChoice mode
  const [hasSelectedCorrectly, setHasSelectedCorrectly] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // For multiple-choice mode
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");

  // Ref to prevent multiple simultaneous round starts
  const isRoundStarting = useRef(false);

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
    // Prevent selecting if already selected an option
    if (selectedIndex !== null) {
      return;
    }

    setSelectedIndex(index);
    const chosen = options[index];

    if (chosen === correctAnswer) {
      setHasSelectedCorrectly(true);
      setShowCorrectAnswer(true); // Show green for correct
      alert("✅ Correct!");
    } else {
      setHasSelectedCorrectly(false);
      setShowCorrectAnswer(true); // Show red for wrong, green for correct
      alert(`❌ Wrong! Correct mix was: ${correctAnswer}`);
    }
  };

  // Handle correct guess in SingleChoice mode
  const handleCorrectGuess = () => {
    setHasGuessedCorrectly(true);
  };

  // --- clean-up and song tracking ---
  useEffect(() => {
    console.log("🚀 InGamePage mounted");

    // Subscribe to track changes to keep currentSong updated
    songService.setOnTrackChange((song) => {
      console.log("🎵 Track changed to:", song?.title);
      setCurrentSong(song);
    });

    return () => {
      console.log("🔥 InGamePage unmounting - cleaning up audio");
      songService.stopSong();
      isRoundStarting.current = false;
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  // --- round lifecycle ---
  useEffect(() => {
    // Prevent multiple simultaneous round starts
    if (isRoundStarting.current) {
      console.log("⚠️ Round start already in progress, skipping...");
      return;
    }

    console.log(`🎯 Starting Round ${currentRound}/${totalRounds}`);
    isRoundStarting.current = true;

    // Stop any existing audio before starting new round
    songService.stopSong();

    setIsRoundActive(true);
    setTimeLeft(roundTime);
    setHasGuessedCorrectly(false); // Reset for new round
    setHasSelectedCorrectly(false); // Reset for new round
    setShowCorrectAnswer(false); // Reset for new round

    if (isSingleSong) {
      console.log("🎵 Single song mode - Round", currentRound);
      if (currentRound === 1) {
        songService.playSong();
      } else {
        songService.playNextSong();
      }
      // currentSong will be updated via the setOnTrackChange callback
    } else {
      console.log("🎶 Multi-song mode - Round", currentRound);
      const chosen = getRandomSongs(3);

      console.log("=== ROUND", currentRound, "MULTI-SONG DEBUG ===");
      console.log("Selected songs:", chosen.map(s => s.title));

      // Start playing the songs
      songService.playMultiSong(chosen);

      const opts = generateOptions(chosen);
      setOptions(opts);
      setCorrectAnswer(chosen.map((s) => s.title).join(", "));

      console.log("Correct answer:", chosen.map((s) => s.title).join(", "));
      console.log("=====================================");
    }

    // Reset the flag after a short delay
    setTimeout(() => {
      isRoundStarting.current = false;
    }, 1000);

  }, [currentRound, isSingleSong, roundTime]); // Include all dependencies

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
    console.log("⏰ Round ended - stopping all audio");

    // ALWAYS stop all audio first (both single and multi)
    songService.stopSong();

    // Show alert for SingleChoice mode if user didn't guess correctly
    if (isSingleSong && !hasGuessedCorrectly && currentSong) {
      alert(`❌ Time's up! The correct answer was: ${currentSong.title}`);
    }

    // Show alert for MultipleChoice mode if user didn't select correctly or didn't select at all
    if (!isSingleSong && (!hasSelectedCorrectly || selectedIndex === null)) {
      alert(`❌ Time's up! The correct answer was: ${correctAnswer}`);
    }

    if (currentRound < totalRounds) {
      setIsRoundActive(false);
      setIsIntermission(true);

      console.log("🔄 Starting intermission...");

      setTimeout(() => {
        console.log("🎯 Moving to next round");
        setCurrentRound((r) => r + 1); // ⬅️ triggers next song via effect above
        setTimeLeft(roundTime);
        setIsRoundActive(true);
        setIsIntermission(false);
        setSelectedIndex(null); // Reset selected answer for new round
      }, 5000);
    } else {
      console.log("🎉 Game over - final cleanup");
      alert("Game over!");
      setIsRoundActive(false);
      setSelectedIndex(null); // Also reset at game end
      songService.refreshKpop();
      console.log("Song cache refreshed");
    }
  }

  return (
    <div className="game-2-container">
      <AudioControls />
      <GameHeader
        roundNumber={`${currentRound}/${totalRounds}`}
        timer={`${timeLeft}`}
        inviteCode={inviteCode}
      />
      <div className="game-2-body">
        <Scoreboard players={players} />

        {isSingleSong ? (
          <SingleChoice
            onCorrectGuess={handleCorrectGuess}
            currentSong={currentSong}
            hasGuessedCorrectly={hasGuessedCorrectly}
          />
        ) : (
          <MultipleChoice
            options={options}
            onSelect={handleSelect}
            selectedIndex={selectedIndex}
            correctAnswer={correctAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        )}
      </div>
    </div>
  );
};

export default InGamePage;