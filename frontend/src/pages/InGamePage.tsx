import React, { useState, useEffect, useRef } from "react";
import "../css/InGamePage.css";
import Scoreboard from "../components/Scoreboard";
import GameHeader from "../components/GameHeader";
import MultipleChoice from "../components/MultipleChoice";
import QuickGuessMultipleChoice from "../components/QuickGuessMultipleChoice";
import SingleChoice from "../components/SingleChoice";
import AudioControls from "../components/AudioControls";
import RoundScoreDisplay from "../components/RoundScoreDisplay";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { songService } from "../services/songServices";
import type { Song } from "../types/song";
import { socket } from "../socket";
import {
  generateMultipleChoiceOptions,
  selectRandomSong,
  getRandomSongs,
  generateMixedSongsOptions,
} from "../utils/gameLogic";
import { safeSetTimeoutAsync } from "../utils/safeTimers";

interface Player {
  name: string;
  points: number;
  previousPoints: number;
  correctAnswers: number;
}

const getTimeAsNumber = (time?: string | number | null): number => {
  // Accept string like "30 sec", "30", a number, or undefined/null.
  if (typeof time === "number") return Math.max(1, Math.floor(time));
  if (!time || typeof time !== "string") return 30; // default 30s
  const m = time.match(/\d+/);
  return m ? parseInt(m[0], 10) : 30;
};

type Genre = "kpop" | "pop" | "hiphop" | "edm";

interface GuessifyProps {}

const InGamePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { code } = useParams(); // room code from URL

  // --- Extract settings safely ---
  // location.state can be undefined when navigating directly — default to empty object
  const state = (location.state || {}) as any;
  const {
    playerName,
    isHost,
    rounds: totalRounds,
    guessTime: roundTime,
    gameMode,
    genre: Genre,
  } = state;

  // --- Player State ---
  const [players, setPlayers] = useState<Player[]>([]);
  const [player, setPlayer] = useState<Player>({
    name: playerName,
    points: 0,
    previousPoints: 0,
    correctAnswers: 0,
  });

  // --- Game Settings ---
  //const roundTime = parseInt(state?guessTime || "30");
  //const totalRounds = parseInt(state?.rounds || "10");
  const isSingleSong = state?.gameMode === "Single Song";
  const isMixedSongs = state?.gameMode === "Mixed Songs";
  const isGuessArtist = state?.gameMode === "Guess the Artist";
  const isQuickGuess1Sec = state?.gameMode === "Quick Guess - 1s";
  const isQuickGuess3Sec = state?.gameMode === "Quick Guess - 3s";
  const isQuickGuess5Sec = state?.gameMode === "Quick Guess - 5s";
  const isQuickGuess = isQuickGuess1Sec || isQuickGuess3Sec || isQuickGuess5Sec;

  // Detect single-player sessions (used to hide invite/code UI)
  const isSinglePlayer = state?.amountOfPlayers === 1;

  // Get the snipper duration for quick guess modes
  const getSnippetDuration = () => {
    if (isQuickGuess1Sec) return 1;
    if (isQuickGuess3Sec) return 3;
    if (isQuickGuess5Sec) return 5;
    return 3; // default
  };

  // --- Round State ---
  // Initialize current round from navigation state if provided (handles mid-round joins)
  const initialRound = (state?.currentRound ??
    state?.roundNumber ??
    state?.currentRoundNumber ??
    1) as number;
  const [currentRound, setCurrentRound] = useState<number>(
    Math.max(1, Number(initialRound))
  );
  const [timeLeft, setTimeLeft] = useState(getTimeAsNumber(roundTime));
  const [roundStartTime, setRoundStartTime] = useState<number | null>(null);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [isIntermission, setIsIntermission] = useState(false);
  const [inviteCode] = useState(code || "INVALID");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // track how many players are still yet to finish this round (null = unknown)
  const [playersRemaining, setPlayersRemaining] = useState<number | null>(null);

  // --- Single Song Mode ---
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // --- Multiple Choice Mode ---
  const [hasSelectedCorrectly, setHasSelectedCorrectly] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [isTimeUp, setIsTimeUp] = useState(false);

  // --- Guess Artist Mode ---
  const [hasGuessedArtistCorrectly, setHasGuessedArtistCorrectly] =
    useState(false);

  // --- Quick Guess Mode ---
  const [hasPlayedSnippet, setHasPlayedSnippet] = useState(false);

  // --- Round Control Helpers ---
  const isRoundStarting = useRef(false);

  // apply a round payload (used by "round-start" and "current-round")
  const applyRoundPayload = (payload: any) => {
    if (!payload) return;
    const {
      song,
      choices,
      answer,
      startTime,
      currentRound: serverRound,
    } = payload;

    setCurrentSong(song ?? null);
    setOptions(choices ?? []);
    setCorrectAnswer(answer ?? "");
    const roundStart = startTime || Date.now();
    setRoundStartTime(roundStart);
    setIsRoundActive(true);
    setTimeLeft(getTimeAsNumber(roundTime));
    if (typeof serverRound === "number") setCurrentRound(serverRound);

    // Reset non-host player states and attempt playback if needed
    const isSinglePlayer = state?.amountOfPlayers === 1;
    if (!isSinglePlayer && !isHost) {
      if (song) {
        const allSongs = songService.getCachedSongs();
        const songIndex = allSongs.findIndex(
          (s) => s.title === song.title && s.artist === song.artist
        );

        if (songIndex >= 0) {
          if (isSingleSong || isGuessArtist) {
            songService.playSong(songIndex);
          } else if (isQuickGuess) {
            const duration = getSnippetDuration();
            safeSetTimeoutAsync(async () => {
              try {
                await songService.playQuickSnippet(songIndex, duration);
                setHasPlayedSnippet(true);
              } catch (err) {
                /* ignore playback errors here (AbortError etc) */
              }
            }, 1000);
          }
        }
      }
      setHasGuessedCorrectly(false);
      setHasSelectedCorrectly(false);
      setShowCorrectAnswer(false);
      setIsTimeUp(false);
      setHasGuessedArtistCorrectly(false);
    }
  };

  /* ----------------- SOCKET CONNECTION ----------------- */
  useEffect(() => {
    socket.emit("get-room-players-scores", code);

    // Ask server for current round in case we missed the live "round-start"
    socket.emit("get-current-round", code);

    // Reply handler for missed round-start
    socket.on("current-round", (payload) => {
      if (!payload) return;
      console.log("Recovered current-round from server:", payload);
      applyRoundPayload(payload);
    });

    // Listen for players joined the room
    socket.on("room-players-scores", (playerScores) => {
      setPlayers(playerScores);
      // set playersRemaining to full players count by default when we get scores (server will update on round-start)
      setPlayersRemaining(playerScores?.length ?? null);
    });

    // Listen for player-finished updates (server broadcasts how many remain)
    socket.on("player-finished-updated", (data) => {
      // data: { remaining, finishedCount? }
      if (typeof data === "object" && data !== null) {
        setPlayersRemaining(
          typeof data.remaining === "number" ? data.remaining : null
        );
      }
    });

    // Host starts round → everyone gets the same song
    socket.on("round-start", (roundData) => {
      console.log("Received round-start from host:", {
        song: roundData?.song?.title,
        choices: roundData?.choices,
        answer: roundData?.answer,
      });
      applyRoundPayload(roundData);
      // When a new round starts, assume no-one finished yet until server tells us
      // server will also emit player-finished-updated from host-start-round handler
    });

    // Score update - this will override the initial scores when available
    socket.on("score-update", (updatedPlayers: Player[]) => {
      // Only update if we have valid data
      if (
        updatedPlayers &&
        Array.isArray(updatedPlayers) &&
        updatedPlayers.length > 0
      ) {
        const sortedPlayers = [...updatedPlayers].sort(
          (a, b) => b.points - a.points
        );
        setPlayers(sortedPlayers);
        const currentPlayer = updatedPlayers.find((p) => p.name === playerName);
        if (currentPlayer) setPlayer(currentPlayer);
      } else {
        console.log(
          "⚠️ WARNING: Received invalid score update data, keeping current players"
        );
      }
    });

    // Host continues to next round - all players advance
    socket.on("continue-to-next-round", ({ nextRound }) => {
      console.log(`Host advanced all players to round ${nextRound}`);
      setCurrentRound(nextRound);
      setTimeLeft(getTimeAsNumber(roundTime));
      setIsRoundActive(true);
      setIsIntermission(false);
      setSelectedIndex(null);
      setHasGuessedCorrectly(false);
      setHasSelectedCorrectly(false);
      setShowCorrectAnswer(false);
      setIsTimeUp(false);
    });

    // Host ends game - all players navigate to end game page
    socket.on("navigate-to-end-game", () => {
      console.log(
        "Host ended the game, navigating all players to end game page"
      );
      navigate("/end_game", {
        state: { code },
      });
    });

    socket.on("host-skipped-round", () => {
      console.log("Host skipped the round for everyone");
      songService.stopSong();

      // Set all the necessary states to show leaderboard
      setIsRoundActive(false);
      setIsIntermission(true);
      setIsTimeUp(true);
      setShowCorrectAnswer(true);
      // mark remaining as 0 because host skipped
      setPlayersRemaining(0);

      // Reset guess states to ensure clean leaderboard display
      setHasGuessedCorrectly(false);
      setHasSelectedCorrectly(false);
      setHasGuessedArtistCorrectly(false);
      setSelectedIndex(null);
    });

    return () => {
      socket.off("current-round");
      socket.off("room-players-scores");
      socket.off("round-start");
      socket.off("score-update");
      socket.off("continue-to-next-round");
      socket.off("navigate-to-end-game");
      socket.off("host-skipped-round");
      socket.off("player-finished-updated");
    };
  }, [code, playerName, navigate, roundTime]);

  /* ----------------- ROUND LOGIC ----------------- */
  useEffect(() => {
    if (timeLeft === 0) {
      setIsRoundActive(false);
      socket?.emit("round-end", { code });
    }
  }, [isRoundActive, timeLeft, socket, code]);

  /* ----------------- HELPER FUNCTIONS ----------------- */

  const genre = (location.state?.genre ?? "kpop") as
    | "kpop"
    | "pop"
    | "hiphop"
    | "edm";

  useEffect(() => {
    songService.fetchRandom(genre, 50).catch(console.error);
  }, [genre]);

  // Get a random set of songs for multiple choice rounds
  const getRandomSongsForGame = (num: number): Song[] => {
    const all = songService.getCachedSongs();
    return getRandomSongs(all, num);
  };

  // Setup Quick Guess mode with single song and multiple choice options

  // Generate multiple choice options including correct answer + distractors (using secure utility)

  // Single player round logic (local generation)
  const startSinglePlayerRound = () => {
    if (isSingleSong || isGuessArtist) {
      if (currentRound === 1) songService.playSong();
      else songService.playNextSong();
    } else if (isQuickGuess) {
      // Use secure random utilities for consistency
      const allSongs = songService.getCachedSongs();
      const { song: selectedSong, index: randomIndex } =
        selectRandomSong(allSongs);

      if (selectedSong) {
        // Generate consistent multiple choice options using secure utility
        const choices = generateMultipleChoiceOptions(selectedSong, allSongs);

        setCurrentSong(selectedSong);
        setOptions(choices);
        setCorrectAnswer(selectedSong.title);

        // Play the snippet with a delay
        const snippetDuration = getSnippetDuration();
        safeSetTimeoutAsync(async () => {
          await songService.playQuickSnippet(randomIndex, snippetDuration);
          setHasPlayedSnippet(true);
        }, 1000);
      }
    } else {
      // Mixed songs mode
      const chosen = getRandomSongsForGame(3);
      songService.playMultiSong(chosen);

      const opts = generateMixedSongsOptions(
        chosen,
        songService.getCachedSongs()
      );
      setOptions(opts);
      setCorrectAnswer(chosen.map((s: Song) => s.title).join(", "));
    }
  };

  // Helper function for single song/artist modes
  const setupSingleSongMode = () => {
    const currentSongData =
      currentRound === 1
        ? songService.getCurrentSong()
        : songService.getNextSong();

    if (currentSongData) {
      const roundData = {
        song: currentSongData,
        choices: [],
        answer: isGuessArtist ? currentSongData.artist : currentSongData.title,
      };

      if (currentRound === 1) songService.playSong();
      else songService.playNextSong();

      return roundData;
    }
    return null;
  };

  // Helper function for quick guess mode
  const setupQuickGuessMode = () => {
    const allSongs = songService.getCachedSongs();
    const { song: selectedSong, index: randomIndex } =
      selectRandomSong(allSongs);

    if (selectedSong) {
      // Generate consistent multiple choice options using secure utility
      const choices = generateMultipleChoiceOptions(selectedSong, allSongs);

      // Setup local state
      setCurrentSong(selectedSong);
      setOptions(choices);
      setCorrectAnswer(selectedSong.title);

      // Play the snippet with a delay
      const snippetDuration = getSnippetDuration();
      safeSetTimeoutAsync(async () => {
        await songService.playQuickSnippet(randomIndex, snippetDuration);
        setHasPlayedSnippet(true);
      }, 1000);

      return {
        song: selectedSong,
        choices,
        answer: selectedSong.title,
      };
    }
    return null;
  };

  // Helper function for mixed songs mode
  const setupMixedSongsMode = () => {
    const chosen = getRandomSongsForGame(3);
    songService.playMultiSong(chosen);

    const opts = generateMixedSongsOptions(
      chosen,
      songService.getCachedSongs()
    );
    setOptions(opts);
    setCorrectAnswer(chosen.map((s: Song) => s.title).join(", "));

    return {
      song: null, // Mixed mode doesn't have a single song
      choices: opts,
      answer: chosen.map((s: Song) => s.title).join(", "),
    };
  };

  // Multiplayer host round logic (generate and distribute)
  const startMultiplayerHostRound = () => {
    let roundData: any = {};

    if (isSingleSong || isGuessArtist) {
      roundData = setupSingleSongMode();
    } else if (isQuickGuess) {
      roundData = setupQuickGuessMode();
    } else {
      roundData = setupMixedSongsMode();
    }

    // Send round data to all players via socket
    if (socket && code && roundData) {
      socket.emit("host-start-round", {
        code,
        ...roundData,
        startTime: Date.now(),
      });
    }
  };

  // Calculate points based on how quickly the answer was given (min 100, max 1000)
  const calculatePoints = (): number => {
    if (!roundStartTime) return 500; // fallback if no start time
    const roundTimeAsNumber = getTimeAsNumber(roundTime);

    const maxPoints = 1000;
    const minPoints = 100;
    const elapsedTime = (Date.now() - roundStartTime) / 1000; // seconds
    const timeRatio = Math.max(
      0,
      (roundTimeAsNumber - elapsedTime) / roundTimeAsNumber
    );
    const points = Math.floor(minPoints + (maxPoints - minPoints) * timeRatio);
    return Math.max(points, minPoints);
  };

  // Add points and optionally increment correctAnswers
  const addPointsToPlayer = (points: number, correct: boolean = false) => {
    // Calculate new totals
    const newPoints = player.points + points;
    const newCorrectAnswers = correct
      ? player.correctAnswers + 1
      : player.correctAnswers;

    // Update the current player's state
    setPlayer((prev: Player) => ({
      ...prev,
      points: newPoints,
      correctAnswers: newCorrectAnswers,
    }));

    // Update the players list
    setPlayers((prev: Player[]) =>
      prev.map((p) =>
        p.name === playerName
          ? { ...p, points: newPoints, correctAnswers: newCorrectAnswers }
          : p
      )
    );

    // Emit score update to server with total points
    if (socket) {
      const scoreData = {
        code,
        playerName,
        points: newPoints,
        correctAnswers: newCorrectAnswers,
      };
      socket.emit("update-score", scoreData);
    }
  };

  /* ----------------- HANDLERS ----------------- */

  // Add helper to emit that this player finished the round
  const notifyPlayerFinished = () => {
    if (socket) {
      socket.emit("player-finished-round", { code, playerName });
    }
  };

  // Handle multiple choice selection
  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return;

    setSelectedIndex(index);
    const chosen = options[index];

    if (chosen === correctAnswer) {
      const points = calculatePoints();
      addPointsToPlayer(points, true); // Correct answer count
      setHasSelectedCorrectly(true);
      setShowCorrectAnswer(true);
      // Stop the song and go immediately to round score display
      songService.stopSong();
      setIsRoundActive(false);
      setIsIntermission(true);
      notifyPlayerFinished(); // tell server we finished
    } else {
      setHasSelectedCorrectly(false);
      setShowCorrectAnswer(true);
      // For MCQ, wrong answer ends the round immediately (not time up)
      setIsTimeUp(false);
      songService.stopSong();
      setIsRoundActive(false);
      setIsIntermission(true);
      notifyPlayerFinished(); // tell server we finished even if wrong
    }
  };

  // Handle skip in single song mode
  const handleSkip = () => {
    if (!hasGuessedCorrectly) {
      const isSinglePlayer = state?.amountOfPlayers === 1;

      if (isSinglePlayer) {
        // Single player: skip locally
        songService.stopSong();
        setIsRoundActive(false);
        setIsIntermission(true);
        notifyPlayerFinished();
      } else if (isHost) {
        // Multiplayer host: skip for everyone
        socket?.emit("host-skip-round", { code });
        // Also skip locally for the host
        songService.stopSong();
        setIsRoundActive(false);
        setIsIntermission(true);
        // host will be treated as finished; server will mark all finished in host-skip handler
      } else {
        // Non-host skip (maybe allowed) - notify server
        songService.stopSong();
        setIsRoundActive(false);
        setIsIntermission(true);
        notifyPlayerFinished();
      }
    }
  };

  // Handle correct guess in single song mode
  const handleCorrectGuess = () => {
    let alreadyGuessed = false;

    if (isSingleSong) {
      alreadyGuessed = hasGuessedCorrectly;
    } else if (isGuessArtist) {
      alreadyGuessed = hasGuessedArtistCorrectly;
    }

    if (!alreadyGuessed) {
      const points = calculatePoints();
      addPointsToPlayer(points, true); // correct answer count

      if (isSingleSong) {
        setHasGuessedCorrectly(true);
      } else if (isGuessArtist) {
        setHasGuessedArtistCorrectly(true);
      }
      // Stop the song and go immediately to round score display
      songService.stopSong();
      setIsRoundActive(false);
      setIsIntermission(true);
      notifyPlayerFinished(); // tell server we finished
    }
  };

  // End round when time runs out
  function handleRoundEnd() {
    songService.stopSong();

    // Time ran out - will show correct answer in round score display
    setIsTimeUp(true);
    setIsRoundActive(false);
    setIsIntermission(true);
    // notify server we finished due to time end (server will likely treat this as everyone finished)
    notifyPlayerFinished();
  }

  // Continue to next round or navigate to end game screen
  const handleContinueToNextRound = () => {
    // Only the host should emit the continue event
    if (isHost && socket) {
      if (currentRound < totalRounds) {
        // Emit event to advance all players to next round
        socket.emit("host-continue-round", {
          code,
          nextRound: currentRound + 1,
          totalRounds,
        });
      } else {
        // Emit event to navigate all players to end game
        socket.emit("host-end-game", { code });
      }
    }

    // Local state update (will be overridden by socket event for consistency)
    if (currentRound < totalRounds) {
      setCurrentRound((r) => r + 1);
      setTimeLeft(getTimeAsNumber(roundTime));
      setIsRoundActive(true);
      setIsIntermission(false);
      setSelectedIndex(null);
    } else {
      // Navigate to end game page
      navigate("/end_game", {
        state: { ...location.state, code },
      });
    }
  };

  /* ----------------- EFFECTS ----------------- */

  // Subscribe to song changes
  useEffect(() => {
    songService.setOnTrackChange((song) => {
      setCurrentSong(song);
    });

    return () => {
      songService.stopSong();
      isRoundStarting.current = false;
    };
  }, []);

  // Start a new round whenever `currentRound` changes
  useEffect(() => {
    if (isRoundStarting.current) return;

    isRoundStarting.current = true;
    songService.stopSong();

    // Update previous points before starting new round (except for first round)
    if (currentRound > 1) {
      setPlayer((prev: Player) => ({
        ...prev,
        previousPoints: prev.points,
      }));

      setPlayers((prev: Player[]) =>
        prev.map((p) => ({ ...p, previousPoints: p.points }))
      );
    }

    // Reset round state
    setIsRoundActive(true);
    setTimeLeft(getTimeAsNumber(roundTime));
    setRoundStartTime(Date.now());
    setHasGuessedCorrectly(false);
    setHasSelectedCorrectly(false);
    setShowCorrectAnswer(false);
    setIsTimeUp(false);
    setHasPlayedSnippet(false);
    setHasGuessedArtistCorrectly(false);
    -setPlayersRemaining((prev) => prev ?? players.length); // ensure some value until server updates
    +setPlayersRemaining((prev: number | null) => prev ?? players.length); // ensure some value until server updates

    // Check if this is single player or multiplayer
    const isSinglePlayer = state?.amountOfPlayers === 1;

    if (isSinglePlayer) {
      // Single player: generate songs locally as before
      startSinglePlayerRound();
    } else if (isHost) {
      // Multiplayer host: generate and distribute round data
      startMultiplayerHostRound();
    }
    // Multiplayer non-host players will receive round data via socket event

    // Release "starting lock" after 1s
    safeSetTimeoutAsync(async () => {
      isRoundStarting.current = false;
    }, 1000);
  }, [currentRound, isSingleSong, isGuessArtist, isQuickGuess, roundTime]);

  // Countdown timer logic
  useEffect(() => {
    // Don't run timer during intermission or when round is not active
    if (!isRoundActive || isIntermission) return;

    if (timeLeft <= 0) {
      // Time ran out - handle round end
      handleRoundEnd();
      setIsRoundActive(false);
      socket?.emit("round-end", { code });
      return;
    }

    // Single timer that decrements every second
    const timer = safeSetTimeoutAsync(
      async () => setTimeLeft((t: number) => t - 1),
      1000
    );

    return () => clearTimeout(timer);
  }, [timeLeft, isRoundActive, isIntermission, socket, code]);

  /* ----------------- RENDER ----------------- */

  // Helper function to render the appropriate game mode component
  const renderGameModeComponent = () => {
    if (isSingleSong) {
      return (
        <SingleChoice
          mode="title"
          onCorrectGuess={handleCorrectGuess}
          currentSong={currentSong}
          hasGuessedCorrectly={hasGuessedCorrectly}
          onSkip={handleSkip}
          isHost={isHost} // Add this line
          onWrongGuess={() => {
            // Optional: Add any logic for wrong guesses
          }}
        />
      );
    }

    if (isMixedSongs) {
      return (
        <MultipleChoice
          options={options}
          onSelect={handleSelect}
          selectedIndex={selectedIndex}
          correctAnswer={correctAnswer}
          showCorrectAnswer={showCorrectAnswer}
          onSkip={handleSkip}
        />
      );
    }

    if (isGuessArtist) {
      return (
        <SingleChoice
          mode="artist"
          onCorrectGuess={handleCorrectGuess}
          currentSong={currentSong}
          hasGuessedCorrectly={hasGuessedArtistCorrectly}
          onSkip={handleSkip}
          isHost={isHost}
        />
      );
    }

    if (isQuickGuess) {
      return (
        <QuickGuessMultipleChoice
          options={options}
          onSelect={handleSelect}
          selectedIndex={selectedIndex}
          correctAnswer={correctAnswer}
          showCorrectAnswer={showCorrectAnswer}
          hasPlayedSnippet={hasPlayedSnippet}
          snippetDuration={getSnippetDuration()}
          onSkip={handleSkip}
          isHost={isHost}
        />
      );
    }
    return null;
  };

  // Helper function to get the correct answer for round score display
  const getCorrectAnswerForDisplay = () => {
    if (isSingleSong) return currentSong?.title;
    if (isGuessArtist) return currentSong?.artist;
    if (isQuickGuess) return currentSong?.title;
    return correctAnswer; // For Mixed Songs mode
  };

  // Helper function to get whether player got the correct answer
  const getPlayerCorrectStatus = () => {
    if (isSingleSong) return hasGuessedCorrectly;
    if (isGuessArtist) return hasGuessedArtistCorrectly;
    return hasSelectedCorrectly; // For Quick Guess and Mixed Songs modes
  };

  // Early return for debugging
  if (!code) {
    return <div>No room code found in URL</div>;
  }

  return (
    <div className="game-2-container">
      <AudioControls />
      {isIntermission ? (
        <RoundScoreDisplay
          players={players}
          roundNumber={currentRound}
          totalRounds={totalRounds}
          onContinue={handleContinueToNextRound}
          isFinalRound={currentRound === totalRounds}
          correctAnswer={getCorrectAnswerForDisplay()}
          playerGotCorrect={getPlayerCorrectStatus()}
          isTimeUp={isTimeUp}
          isHost={isHost}
          // pass authoritative start time + duration so RoundScoreDisplay can compute a live countdown
          roundStartTime={roundStartTime}
          roundDuration={getTimeAsNumber(roundTime)}
          playersRemaining={playersRemaining}
        />
      ) : (
        <>
          <GameHeader
            roundNumber={`${currentRound}/${totalRounds}`}
            timer={`${timeLeft}`}
            inviteCode={inviteCode}
            showInvite={!isSinglePlayer}
          />
          <div className="game-2-body">
            <Scoreboard players={players} />
            {renderGameModeComponent()}
          </div>
        </>
      )}
    </div>
  );
};

export default InGamePage;
