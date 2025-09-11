import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // This test will pass if the App component renders without throwing
    expect(true).toBe(true);
  });

  it('contains the main heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('UADE - ArreglaYA Analytics');
  });
});
