import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickGuessMultipleChoice from '../src/components/QuickGuessMultipleChoice';

// Basic tests for QuickGuessMultipleChoice component
describe('QuickGuessMultipleChoice', () => {
  it('disables options until snippet played', () => {
    const onSelect = vi.fn();
    render(<QuickGuessMultipleChoice options={["A","B","C"]} onSelect={onSelect} selectedIndex={null} correctAnswer={'A'} showCorrectAnswer={false} hasPlayedSnippet={false} /> as any);
  // Buttons should be disabled
  expect((screen.getByText(/1. A/) as HTMLButtonElement).disabled).toBe(true);
  });

  it('allows selection once snippet played and calls onSelect', () => {
    const onSelect = vi.fn();
    render(<QuickGuessMultipleChoice options={["A","B","C"]} onSelect={onSelect} selectedIndex={null} correctAnswer={'A'} showCorrectAnswer={false} hasPlayedSnippet={true} isHost={true} onSkip={() => {}} /> as any);
    const button = screen.getByText(/1. A/);
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it('shows skip button only for host', () => {
    const onSelect = vi.fn();
    const onSkip = vi.fn();
    render(<QuickGuessMultipleChoice options={["A","B","C"]} onSelect={onSelect} selectedIndex={null} correctAnswer={'A'} showCorrectAnswer={false} hasPlayedSnippet={true} isHost={true} onSkip={onSkip} /> as any);
    expect(screen.getByText(/Skip/i)).toBeTruthy();
  });
});
