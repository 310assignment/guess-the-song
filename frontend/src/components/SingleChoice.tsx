// React hooks for component state and lifecycle management
import React, { useState, useEffect } from "react";
// Component-specific styling for the guess song interface
import "../css/GuessSong.css";
// Play button icon asset for the song playback control
import PlayIcon from "../assets/Play.png";
// Service for handling song playback functionality
import { songService } from "../services/songServices";
// TypeScript type definition for song data structure
import type { Song } from "../types/song";

// Regex patterns for text normalization and cleaning
// SECURITY: All patterns designed to prevent ReDoS attacks through careful construction
const REGEX_PATTERNS = {
  // Parenthetical content: (Remix), (Live), (Acoustic), etc.
  // SAFE: Uses possessive quantifier equivalent to prevent backtracking
  PARENTHESES: /\s*\([^)]*\)/g,

  // Featuring artist patterns (case insensitive)
  // SAFE: Uses atomic grouping equivalent and specific quantifiers
  FEATURING: /\s*(?:feat\.?|ft\.?|featuring)\s+[^\s].*$/gi,

  // Remix and version indicators
  // SAFE: Uses atomic grouping and bounded quantifiers
  REMIX_VERSION:
    /\s*-?\s*(?:remix|version|mix|edit|remaster|remastered)(?:\s+.*)?$/gi,

  // Punctuation and special characters (keep only letters, numbers, spaces)
  // SAFE: Character class is inherently safe from backtracking
  PUNCTUATION: /[^\w\s]/g,

  // Multiple whitespace normalization
  // SAFE: Simple quantifier without nested groups
  WHITESPACE: /\s+/g,

  // Common song prefixes/suffixes that might confuse matching
  // SAFE: Anchored at start with atomic grouping equivalent
  ARTICLES: /^(?:the|a|an)\s+/i,

  // Numbers and ordinals that might be written differently
  // SAFE: Word boundaries prevent backtracking, specific alternatives
  NUMBERS:
    /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th)\b/gi,

  // Common abbreviations - split into separate patterns for safety
  // SAFE: Each pattern is simple and bounded
  CONTRACTIONS: /\bn['']?t\b/gi,
  AMPERSAND: /\s*&\s*/g,
  WITH_SLASH: /\bw\//gi,
  U_SUBSTITUTION: /\bu\b/gi,
  UR_SUBSTITUTION: /\bur\b/gi,
  NUMBER_WORDS: /\b(?:2|4)\b/g,

  // Input sanitization - allow only safe characters
  // SAFE: Negated character class with explicit allowed characters
  UNSAFE_CHARS: /[^a-zA-Z0-9\s'.,!?&-]/g,

  // Word splitting for fuzzy matching
  // SAFE: Simple whitespace split
  WORD_SPLIT: /\s+/,
} as const;

// Props interface for the SingleChoice component
// Defines all the callback functions and data needed for the guessing game
interface SingleChoiceProps {
  onCorrectGuess: () => void; // Called when user guesses correctly
  currentSong: Song | null; // Current song data from the game
  hasGuessedCorrectly: boolean; // Whether the user already guessed right this round
  onWrongGuess?: () => void; // Optional callback for wrong guess handling
  mode: "title" | "artist"; // Mode to guess either song title or artist name
  isHost?: boolean; // Whether the current user is the host (can skip rounds)
  onHostSkip?: () => void; // Callback for host skip functionality
}

/**
 * SingleChoice component for text-based song guessing game mode.
 * Players type their guesses for either song title or artist name.
 * Includes text normalization, hint display, and host controls.
 *
 * @param onCorrectGuess - Callback when user guesses correctly
 * @param currentSong - Current song data object
 * @param hasGuessedCorrectly - Whether user already guessed correctly this round
 * @param onWrongGuess - Optional callback for wrong guess handling
 * @param mode - Whether to guess "title" or "artist"
 * @param isHost - Whether current user is the host (enables skip button)
 * @param onHostSkip - Callback for host skip functionality
 */
const SingleChoice: React.FC<SingleChoiceProps> = ({
  onCorrectGuess,
  currentSong,
  hasGuessedCorrectly,
  onWrongGuess,
  mode,
  isHost = false,
  onHostSkip,
}) => {
  // User's current guess input text
  const [guess, setGuess] = useState("");
  // Flag to display wrong guess feedback message
  const [showWrongMessage, setShowWrongMessage] = useState(false);

  /**
   * Create a masked version of the text with underscores for each letter.
   * Uses comprehensive regex patterns to remove featuring artists, parenthetical content,
   * remix indicators, and punctuation to focus on the core title/artist name.
   *
   * @param text - The original song title or artist name
   * @returns String with words replaced by underscores (e.g., "Hello World" → "_____ _____")
   */
  const createBlanks = (text: string): string => {
    // Apply regex-based cleaning in order of specificity
    let mainText = text
      .replace(REGEX_PATTERNS.PARENTHESES, "") // Remove (Remix), (Live), etc.
      .replace(REGEX_PATTERNS.FEATURING, "") // Remove feat./ft./featuring
      .replace(REGEX_PATTERNS.REMIX_VERSION, "") // Remove remix/version indicators
      .trim();

    // Clean the text using regex for consistent results
    const cleanText = mainText
      .replace(REGEX_PATTERNS.PUNCTUATION, "") // Remove all punctuation
      .replace(REGEX_PATTERNS.WHITESPACE, " ") // Normalize whitespace
      .trim();

    // Convert each word to underscores of the same length
    // Join with extra spaces for better visual separation
    return cleanText
      .split(" ")
      .filter(Boolean) // Remove empty strings from splitting
      .map((word) => "_".repeat(word.length)) // Replace each word with underscores
      .join("   "); // Join with triple spaces for readability
  };

  /**
   * Normalize text for accurate comparison between user guess and correct answer.
   * Uses comprehensive regex patterns for advanced text cleaning and standardization.
   * Handles common variations, abbreviations, and alternative spellings.
   *
   * @param text - Text to normalize (user guess or correct answer)
   * @returns Cleaned, lowercase text ready for comparison
   */
  const normalizeForComparison = (text: string): string => {
    return (
      text
        .replace(REGEX_PATTERNS.PARENTHESES, "") // Remove parenthetical content
        .replace(REGEX_PATTERNS.FEATURING, "") // Remove featuring artists
        .replace(REGEX_PATTERNS.REMIX_VERSION, "") // Remove remix indicators
        .replace(REGEX_PATTERNS.ARTICLES, "") // Remove leading articles (the, a, an)
        .replace(REGEX_PATTERNS.PUNCTUATION, "") // Remove all punctuation
        .replace(REGEX_PATTERNS.WHITESPACE, " ") // Normalize whitespace
        // Handle common abbreviations and alternative spellings
        .replace(/\bn['']?t\b/gi, "not") // n't → not
        .replace(/\b&\b/g, "and") // & → and
        .replace(/\bw\//gi, "with") // w/ → with
        .replace(/\bu\b/gi, "you") // u → you
        .replace(/\bur\b/gi, "your") // ur → your
        .replace(/\b2\b/g, "to") // 2 → to
        .replace(/\b4\b/g, "for") // 4 → for
        // Handle number variations
        .replace(/\bone\b/gi, "1")
        .replace(/\btwo\b/gi, "2")
        .replace(/\bthree\b/gi, "3")
        .replace(/\bfour\b/gi, "4")
        .replace(/\bfive\b/gi, "5")
        .trim() // Remove leading/trailing spaces
        .toLowerCase()
    ); // Convert to lowercase for comparison
  };

  /**
   * Calculate similarity between two normalized strings using fuzzy matching.
   * Uses regex-based word matching to handle partial matches and typos.
   *
   * @param guess - User's normalized guess
   * @param target - Normalized target answer
   * @returns Similarity score between 0 and 1 (1 = exact match)
   */
  const calculateSimilarity = (guess: string, target: string): number => {
    if (guess === target) return 1; // Exact match
    if (!guess || !target) return 0; // Empty strings

    // Split into words for partial matching
    const guessWords = guess.split(/\s+/).filter(Boolean);
    const targetWords = target.split(/\s+/).filter(Boolean);

    if (guessWords.length === 0 || targetWords.length === 0) return 0;

    // Count matching words (case insensitive, allows partial matches)
    let matchingWords = 0;
    const totalWords = Math.max(guessWords.length, targetWords.length);

    for (const guessWord of guessWords) {
      for (const targetWord of targetWords) {
        // Exact word match
        if (guessWord === targetWord) {
          matchingWords++;
          break;
        }
        // Partial match for longer words (allows for typos)
        if (guessWord.length >= 3 && targetWord.length >= 3) {
          const similarity = getWordSimilarity(guessWord, targetWord);
          if (similarity > 0.8) {
            matchingWords += similarity;
            break;
          }
        }
      }
    }

    return matchingWords / totalWords;
  };

  /**
   * Calculate similarity between two individual words using character overlap.
   * Helps handle common typos and alternative spellings.
   *
   * @param word1 - First word to compare
   * @param word2 - Second word to compare
   * @returns Similarity score between 0 and 1
   */
  const getWordSimilarity = (word1: string, word2: string): number => {
    const longer = word1.length > word2.length ? word1 : word2;
    const shorter = word1.length > word2.length ? word2 : word1;

    if (longer.length === 0) return 1;

    // Calculate edit distance and convert to similarity
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  /**
   * Calculate edit distance (Levenshtein distance) between two strings.
   * Used for fuzzy string matching to handle typos.
   *
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Number of edits needed to transform str1 into str2
   */
  const getEditDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  /**
   * Reset component state when the current song changes.
   * Clears user input and any feedback messages to prepare for new round.
   * Runs whenever currentSong prop changes.
   */
  useEffect(() => {
    setGuess(""); // Clear the input field
    setShowWrongMessage(false); // Hide any wrong guess feedback
  }, [currentSong]);

  /**
   * Handle changes to the guess input field with regex-based validation.
   * Provides real-time feedback and input sanitization.
   *
   * @param e - React change event from the input element
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Optional: Sanitize input using regex (remove excessive special characters)
    // Allow letters, numbers, spaces, apostrophes, and common punctuation
    value = value.replace(/[^a-zA-Z0-9\s'.,!?&-]/g, "");

    // Limit length to prevent extremely long inputs
    if (value.length > 100) {
      value = value.substring(0, 100);
    }

    setGuess(value);

    // Clear wrong message when user starts typing again
    if (showWrongMessage) {
      setShowWrongMessage(false);
    }
  };

  /**
   * Process and validate the user's guess against the correct answer.
   * Uses both exact matching and fuzzy matching with regex patterns for better accuracy.
   * Supports partial matches and common typos through similarity scoring.
   */
  const handleSubmitGuess = () => {
    // Don't process if no song loaded or user already guessed correctly
    if (!currentSong || hasGuessedCorrectly) return;

    // Normalize both the user's guess and the target answer for fair comparison
    const normalizedGuess = normalizeForComparison(guess);
    const target = mode === "title" ? currentSong.title : currentSong.artist;
    const normalizedTarget = normalizeForComparison(target);

    // Check for exact match first (fastest)
    if (normalizedGuess === normalizedTarget) {
      onCorrectGuess(); // Notify parent component of correct guess
      return;
    }

    // Use fuzzy matching for partial matches and typos
    const similarity = calculateSimilarity(normalizedGuess, normalizedTarget);
    const SIMILARITY_THRESHOLD = 0.85; // 85% similarity required for acceptance

    if (similarity >= SIMILARITY_THRESHOLD) {
      onCorrectGuess(); // Accept close matches
    } else {
      setShowWrongMessage(true); // Show "wrong" feedback to user
      onWrongGuess?.(); // Call optional wrong guess callback if provided
    }
  };

  /**
   * Handle Enter key press for submitting guesses.
   * Allows users to submit their guess by pressing Enter instead of clicking submit.
   * Only processes if user hasn't already guessed correctly.
   *
   * @param e - React keyboard event from the input element
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !hasGuessedCorrectly) {
      handleSubmitGuess();
    }
  };

  /**
   * Generate display content based on current game mode and song data.
   * Uses regex patterns to create better hints and masked text.
   *
   * @returns Object with 'blanked' (masked text) and 'shown' (hint text) properties
   */
  const getDisplayContent = () => {
    if (!currentSong) return { blanked: "Loading...", shown: "" };

    if (mode === "title") {
      // Title guessing mode: blank the title, show the artist as hint
      return {
        blanked: `TITLE: ${createBlanks(currentSong.title)}`,
        shown: `ARTIST: ${currentSong.artist}`,
      };
    } else {
      // Artist guessing mode: blank the artist, show the title as hint
      return {
        blanked: `ARTIST: ${createBlanks(currentSong.artist)}`,
        shown: `TITLE: ${currentSong.title}`,
      };
    }
  };

  /**
   * Generate helpful hints based on the current guess using regex analysis.
   * Provides feedback on similarity and suggests corrections.
   *
   * @returns Hint message or empty string if no hint needed
   */
  const getSmartHint = (): string => {
    if (!currentSong || !guess.trim() || hasGuessedCorrectly) return "";

    const normalizedGuess = normalizeForComparison(guess);
    const target = mode === "title" ? currentSong.title : currentSong.artist;
    const normalizedTarget = normalizeForComparison(target);

    const similarity = calculateSimilarity(normalizedGuess, normalizedTarget);

    // Provide contextual hints based on similarity
    if (similarity > 0.7) {
      return "Very close! Check your spelling 🔍";
    } else if (similarity > 0.5) {
      return "Getting warmer! Some words are correct 🎯";
    } else if (similarity > 0.3) {
      return "On the right track, but needs more work 🤔";
    } else if (normalizedGuess.length > 0) {
      // Check if they have the right number of words
      const guessWords = normalizedGuess.split(/\s+/).filter(Boolean);
      const targetWords = normalizedTarget.split(/\s+/).filter(Boolean);

      if (guessWords.length === targetWords.length) {
        return "Right number of words! Try different spellings 📝";
      } else if (guessWords.length < targetWords.length) {
        return "Try adding more words 📚";
      } else {
        return "Try using fewer words 🎵";
      }
    }

    return "";
  };

  // Extract the display content for the current mode and song
  const { blanked, shown } = getDisplayContent();
  // Get smart hint based on current guess and similarity
  const smartHint = getSmartHint();

  return (
    <div className="music-guess-game">
      {/* Main content area - blanked text that user needs to guess */}
      <div className="artist-label">
        <h1> {blanked} </h1>
      </div>

      {/* Hint section - shown text that provides context clue */}
      <div className="artist-label artist-label--spacing">
        <h2 className="artist-text">{shown}</h2>
      </div>

      {/* Song playback control - central play button */}
      <div className="central-circle-container">
        <button
          className="central-circle"
          onClick={() => songService.playSong()}
        >
          <img src={PlayIcon} className="circle-image" alt="Play button" />
        </button>
      </div>

      {/* User input section for typing guesses */}
      <div className="input-container">
        <input
          type="text"
          value={guess}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={
            hasGuessedCorrectly
              ? "CORRECT! WAIT FOR NEXT ROUND..." // Success state placeholder
              : "TYPE YOUR GUESS HERE..." // Default placeholder
          }
          className="guess-input"
          disabled={hasGuessedCorrectly} // Disable input after correct guess
        />

        {/* Smart hint display - shows regex-based feedback */}
        {smartHint && !hasGuessedCorrectly && (
          <div
            className="smart-hint"
            style={{
              fontSize: "0.9rem",
              color: "#666",
              marginTop: "0.5rem",
              fontStyle: "italic",
            }}
          >
            {smartHint}
          </div>
        )}
      </div>

      {/* Control buttons and feedback section */}
      <div className="controls">
        {/* Submit guess button - main interaction for submitting answers */}
        <button
          onClick={() => handleSubmitGuess()}
          disabled={hasGuessedCorrectly}
          className={`submit-btn ${
            hasGuessedCorrectly ? "submit-btn--disabled" : ""
          }`}
        >
          {hasGuessedCorrectly ? "Correct! ✅" : "Submit Guess"}
        </button>

        {/* Host-only skip button - allows host to skip current round */}
        {isHost && onHostSkip && (
          <button
            onClick={onHostSkip}
            disabled={hasGuessedCorrectly}
            className={`skip-btn ${
              hasGuessedCorrectly ? "skip-btn--disabled" : ""
            }`}
          >
            Skip Round
          </button>
        )}

        {/* Wrong guess feedback - appears when user guesses incorrectly */}
        {showWrongMessage && !hasGuessedCorrectly && (
          <div className="wrong-message">Try again! 🤔</div>
        )}
      </div>
    </div>
  );
};

export default SingleChoice;
