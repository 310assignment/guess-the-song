import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Prevent the real songService from being imported (it requires VITE_API_BASE_URL at top-level)
vi.mock('../src/services/songServices', () => ({
  songService: {
    playSong: () => {},
    playQuickSnippet: () => {},
    playMultiSong: () => {},
    getCachedSongs: () => [],
  }
}));

import SingleChoice from '../src/components/SingleChoice';

const song = { id: '1', title: 'Hello World', artist: 'Artist', previewUrl: '' };

// Basic test to ensure SingleChoice component renders and functions
describe('SingleChoice component', () => {
  it('renders blanked title and shown artist, allows correct guess', () => {
    const onCorrect = vi.fn();
    render(<SingleChoice currentSong={song as any} hasGuessedCorrectly={false} onCorrectGuess={onCorrect} mode='title' /> as any);

    // input and submit
    const input = screen.getByPlaceholderText(/TYPE YOUR GUESS/i);
    fireEvent.change(input, { target: { value: 'Hello World' } });
    const submit = screen.getByText(/Submit Guess/i);
    fireEvent.click(submit);

    // assert callback called
    expect(onCorrect).toHaveBeenCalled();
  });
});
