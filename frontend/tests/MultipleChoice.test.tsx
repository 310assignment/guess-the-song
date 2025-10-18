import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MultipleChoice from '../src/components/MultipleChoice';

const options = ['A', 'B', 'C', 'D'];

// Basic test to ensure MultipleChoice component renders and functions
describe('MultipleChoice component', () => {
  it('renders options and allows selection', () => {
    const onSelect = vi.fn();
    render(<MultipleChoice options={options} onSelect={onSelect} selectedIndex={null} correctAnswer={options[2]} showCorrectAnswer={false} /> as any);

    const button = screen.getByText(/1. A/);
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});
