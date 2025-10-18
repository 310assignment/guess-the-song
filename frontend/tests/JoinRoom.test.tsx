import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock react-router hooks used by JoinRoom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: {} }),
  };
});

import JoinRoom from '../src/pages/JoinRoom';

// Tests for JoinRoom component
describe('JoinRoom', () => {
    // Basic test to ensure JoinRoom component renders
  it('renders input and buttons', () => {
    render(<JoinRoom /> as any);
    expect(screen.getByPlaceholderText(/ENTER CODE/i)).toBeTruthy();
    expect(screen.getByText(/JOIN/i)).toBeTruthy();
    expect(screen.getByText(/CREATE ROOM/i)).toBeTruthy();
  });

  // Test to ensure input is converted to uppercase and restricted characters
  it('converts input to uppercase and restricts chars', () => {
    render(<JoinRoom /> as any);
    const input = screen.getByPlaceholderText(/ENTER CODE/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ab!12' } });
    expect(input.value).toMatch(/AB12/);
  });
});
