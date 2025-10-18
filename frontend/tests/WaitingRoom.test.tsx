import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock socket to avoid network
vi.mock('../src/socket', () => ({ socket: { connected: true, on: () => {}, off: () => {}, emit: () => {} } }));
// Mock react-router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ code: 'ABC123' }),
    useLocation: () => ({ state: { playerName: 'Test', isHost: false } }),
    useNavigate: () => vi.fn(),
  };
});

import WaitingRoom from '../src/pages/WaitingRoom';

// Basic test to ensure WaitingRoom component renders
describe('WaitingRoom', () => {
  it('renders room code and leave button', () => {
    render(<WaitingRoom /> as any);
    expect(screen.getByText(/Room Code: ABC123/i)).toBeTruthy();
    expect(screen.getByText(/Leave Room/i)).toBeTruthy();
  });
});
