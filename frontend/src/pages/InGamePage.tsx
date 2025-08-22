import React, { useState, useEffect, useRef } from "react";
import "../css/InGamePage.css";
import Scoreboard from "../components/Scoreboard";
import GameHeader from "../components/GameHeader";
import MultipleChoice from "../components/MultipleChoice";
import SingleChoice from "../components/SingleChoice";
import AudioControls from "../components/AudioControls";
import RoundScoreDisplay from "../components/RoundScoreDisplay";
import { useLocation, useNavigate } from "react-router-dom";
import { songService } from "../services/songServices";
import type { Song } from "../types/song";

interface GuessifyProps {}

const InGamePage: React.FC<GuessifyProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Extract settings safely ---
  const state = location.state as {
    playerName?: string;
    rounds?: string;
    guessTime?: string;
    gameMode?: string;
  };

  // Single player data (added correctAnswers and previousPoints)
  const [player, setPlayer] = useState({
    name: state?.playerName || "You",
    points: 0,
    previousPoints: 0, // Track previous score for score change display
    correctAnswers: 0, // ✅ track correct answers
  });

  // Round Logic
  const totalRounds = parseInt(state?.rounds || "10");
  const roundTime = parseInt(state?.guessTime || "30");
  const isSingleSong = state?.gameMode === "Single Song";

  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(roundTime);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [isIntermission, setIsIntermission] = useState(false);
  const [inviteCode] = useState("ABC123");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // SingleChoice tracking
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // MultipleChoice tracking
  const [hasSelectedCorrectly, setHasSelectedCorrectly] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [isTimeUp, setIsTimeUp] = useState(false);

  const [roundStartTime, setRoundStartTime] = useState<number>(0);
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
    opts.push(correctTitles.join(", "));

    while (opts.length < 4) {
      const mix = randomMix();
      if (!opts.includes(mix)) opts.push(mix);
    }

    return opts.sort(() => 0.5 - Math.random());
  };

  const calculatePoints = (timeRemaining: number): number => {
    const maxPoints = 1000;
    const minPoints = 100;
    const timeRatio = timeRemaining / roundTime;
    const points = Math.floor(minPoints + (maxPoints - minPoints) * timeRatio);
    return Math.max(points, minPoints);
  };

  // Add points and optionally increment correctAnswers
  const addPointsToPlayer = (points: number, correct: boolean = false) => {
    setPlayer(prev => ({
      ...prev,
      points: prev.points + points,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
    }));
  };

  // --- selection ---
  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return;

    setSelectedIndex(index);
    const chosen = options[index];

    if (chosen === correctAnswer) {
      const points = calculatePoints(timeLeft);
      addPointsToPlayer(points, true); // ✅ correct answer count
      setHasSelectedCorrectly(true);
      setShowCorrectAnswer(true);
      // Stop the song and go immediately to round score display
      songService.stopSong();
      setIsRoundActive(false);
      setIsIntermission(true);
    } else {
      setHasSelectedCorrectly(false);
      setShowCorrectAnswer(true);
      // For MCQ, wrong answer ends the round immediately (not time up)
      setIsTimeUp(false);
      songService.stopSong();
      setIsRoundActive(false);
      setIsIntermission(true);
    }
  };

  const handleCorrectGuess = () => {
    if (!hasGuessedCorrectly) {
      const points = calculatePoints(timeLeft);
      addPointsToPlayer(points, true); // ✅ correct answer count
      setHasGuessedCorrectly(true);
      // Stop the song and go immediately to round score display
      songService.stopSong();
      setIsRoundActive(false);
      setIsIntermission(true);
    }
  };

  // --- song tracking ---
  useEffect(() => {
    songService.setOnTrackChange((song) => {
      setCurrentSong(song);
    });

    return () => {
      songService.stopSong();
      isRoundStarting.current = false;
    };
  }, []);

  // --- round lifecycle ---
  useEffect(() => {
    if (isRoundStarting.current) return;

    isRoundStarting.current = true;
    songService.stopSong();

    // Update previous points before starting new round (except for first round)
    if (currentRound > 1) {
      setPlayer(prev => ({
        ...prev,
        previousPoints: prev.points,
      }));
    }

    setIsRoundActive(true);
    setTimeLeft(roundTime);
    setRoundStartTime(Date.now());
    setHasGuessedCorrectly(false);
    setHasSelectedCorrectly(false);
    setShowCorrectAnswer(false);
    setIsTimeUp(false);

    if (isSingleSong) {
      if (currentRound === 1) songService.playSong();
      else songService.playNextSong();
    } else {
      const chosen = getRandomSongs(3);
      songService.playMultiSong(chosen);

      const opts = generateOptions(chosen);
      setOptions(opts);
      setCorrectAnswer(chosen.map(s => s.title).join(", "));
    }

    setTimeout(() => { isRoundStarting.current = false; }, 1000);
  }, [currentRound, isSingleSong, roundTime]);

  useEffect(() => {
    if (!isRoundActive || isIntermission) return;

    if (timeLeft <= 0) {
      handleRoundEnd();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isRoundActive, isIntermission]);

  function handleRoundEnd() {
    songService.stopSong();

    // Time ran out - will show correct answer in round score display
    setIsTimeUp(true);
    setIsRoundActive(false);
    setIsIntermission(true);
  }

  const handleContinueToNextRound = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(r => r + 1);
      setTimeLeft(roundTime);
      setIsRoundActive(true);
      setIsIntermission(false);
      setSelectedIndex(null);
    } else {
      // Navigate to end game page
      navigate("/end_game", {
        state: {
          players: [
            {
              name: player.name,
              points: player.points,
              correctAnswers: player.correctAnswers,
              totalRounds: totalRounds, 
            },
          ],
        },
      });
    }
  };

  return (
    <div className="game-2-container">
      <AudioControls />
      {isIntermission ? (
        <RoundScoreDisplay
          players={[player]}
          roundNumber={currentRound}
          totalRounds={totalRounds}
          onContinue={handleContinueToNextRound}
          isFinalRound={currentRound === totalRounds}
          correctAnswer={isSingleSong ? currentSong?.title : correctAnswer}
          playerGotCorrect={isSingleSong ? hasGuessedCorrectly : hasSelectedCorrectly}
          isTimeUp={isTimeUp}
        />
      ) : (
        <>
          <GameHeader
            roundNumber={`${currentRound}/${totalRounds}`}
            timer={`${timeLeft}`}
            inviteCode={inviteCode}
          />
          <div className="game-2-body">
            <Scoreboard players={[player]} />
            {isSingleSong ? (
              <SingleChoice
                onCorrectGuess={handleCorrectGuess}
                currentSong={currentSong}
                hasGuessedCorrectly={hasGuessedCorrectly}
                onWrongGuess={() => {
                  // Optional: Add any logic for wrong guesses
                }}
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
        </>
      )}
    </div>
  );
};

export default InGamePage;