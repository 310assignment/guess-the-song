import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock react-use useWindowSize to provide deterministic width/height
vi.mock('react-use', () => ({ useWindowSize: () => ({ width: 800, height: 600 }) }));
// Mock socket to avoid real socket connections
vi.mock('../src/socket', () => ({ socket: { connected: false, on: () => {}, off: () => {}, emit: () => {} } }));
// Mock react-confetti to avoid canvas usage in jsdom
vi.mock('react-confetti', () => ({ default: () => React.createElement('div', { 'data-testid': 'confetti' }) }));
// Mock react-router hooks used by EndGamePage
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ state: { code: 'ABC123', playerName: 'Tester' } }),
    useNavigate: () => vi.fn(),
  };
});

import EndGamePage from '../src/pages/EndGamePage';

// Basic test to ensure EndGamePage component renders
describe('EndGamePage', () => {
  it('renders leaderboard container and Back button', () => {
    const { container } = render(<EndGamePage /> as any);
    expect(container.querySelector('.end-game-container')).toBeTruthy();
    expect(screen.getByText(/Back to Lobby/i)).toBeTruthy();
  });
});
