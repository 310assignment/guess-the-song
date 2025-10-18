import { describe, it, expect } from 'vitest';
import { generateMultipleChoiceOptions, selectRandomSong, getRandomSongs, generateMixedSongsOptions } from '../src/utils/gameLogic';

const sampleSongs = [
  { id: '1', title: 'A', artist: 'X', previewUrl: '' },
  { id: '2', title: 'B', artist: 'Y', previewUrl: '' },
  { id: '3', title: 'C', artist: 'Z', previewUrl: '' },
  { id: '4', title: 'D', artist: 'W', previewUrl: '' },
];

// Tests for gameLogic utilities
describe('gameLogic utilities', () => {
  it('generateMultipleChoiceOptions returns correct size and includes correct answer', () => {
    const options = generateMultipleChoiceOptions(sampleSongs[0] as any, sampleSongs as any, 4);
    expect(options.length).toBe(4);
    expect(options).toContain(sampleSongs[0].title);
  });

  it('selectRandomSong returns a song and valid index', () => {
    const { song, index } = selectRandomSong(sampleSongs as any);
    expect(song).toBeDefined();
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(sampleSongs.length);
  });

  it('getRandomSongs returns requested count', () => {
    const res = getRandomSongs(sampleSongs as any, 2);
    expect(res.length).toBe(2);
  });

  it('generateMixedSongsOptions returns 4 options and includes correct mix', () => {
    const opts = generateMixedSongsOptions([sampleSongs[0] as any], sampleSongs as any);
    expect(opts.length).toBe(4);
    expect(opts).toEqual(expect.arrayContaining([expect.any(String)]));
  });
});
