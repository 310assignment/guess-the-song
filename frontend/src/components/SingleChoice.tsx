import React, { useState, useEffect } from 'react';
import '../css/GuessSong.css';
import PlayIcon from '../assets/Play.png';

interface Song {
    title: string;
    artist: string;
}

const GuessSong: React.FC = () => {
    // Pre-cached array of songs
    const songs: Song[] = [
        { title: "Uptown Funk", artist: "Bruno Mars" },
        { title: "Shape of You", artist: "Ed Sheeran" },
        { title: "Blinding Lights", artist: "The Weeknd" },
        { title: "Bad Guy", artist: "Billie Eilish" },
        { title: "Rolling in the Deep", artist: "Adele" },
        { title: "Watermelon Sugar", artist: "Harry Styles" },
        { title: "Bohemian Rhapsody", artist: "Queen" },
        { title: "Someone Like You", artist: "Adele" },
        { title: "Thinking Out Loud", artist: "Ed Sheeran" },
        { title: "Shallow", artist: "Lady Gaga" }
    ];

    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [guess, setGuess] = useState<string>('');

    // Function to convert text to blanks format
    const createBlanks = (text: string): string => {
        return text.split(' ').map(word =>
            '_'.repeat(word.length)
        ).join('   ');
    };

    // Function to get a random song
    const getRandomSong = (): Song => {
        const randomIndex = Math.floor(Math.random() * songs.length);
        return songs[randomIndex];
    };

    // Initialize with a random song when component mounts
    useEffect(() => {
        setCurrentSong(getRandomSong());
    }, []);

    // Function to load a new song
    const loadNewSong = () => {
        setCurrentSong(getRandomSong());
        setGuess('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGuess(e.target.value);
    };

    const handleSubmitGuess = () => {
        if (guess.toLowerCase().trim() === currentSong?.title.toLowerCase()) {
            alert('Correct! 🎉');
            loadNewSong(); // Load a new song after correct guess
        } else {
            alert('Try again! 🤔');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmitGuess();
        }
    };

    return (
        <div className="music-guess-game">
            {/* Title Label */}
            <div className="artist-label">
                <h1>
                    {currentSong ? `TITLE: ${createBlanks(currentSong.title)}` : 'Loading...'}
                </h1>
            </div>

            {/* Artist Label */}
            <div className="artist-label" style={{ marginBottom: '2rem', marginTop: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#e5e7eb' }}>
                    {currentSong ? `ARTIST: ${currentSong.artist}` : ''}
                </h2>
            </div>

            {/* Central Circle */}
            <div className="central-circle-container">
                <div className="central-circle">
                    <img
                        src={PlayIcon}
                        className="circle-image"
                        alt="Play button"
                    />
                </div>
            </div>

            {/* Input Field */}
            <div className="input-container">
                <input
                    type="text"
                    value={guess}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="TYPE YOUR GUESS HERE..."
                    className="guess-input"
                />
            </div>

            {/* Controls */}
            <div className="controls" style={{ marginTop: '1rem' }}>
                <button
                    onClick={handleSubmitGuess}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#4ade80',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Submit Guess
                </button>
            </div>
        </div>
    );
};

export default GuessSong;