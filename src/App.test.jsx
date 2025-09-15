import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock de react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => element,
  Navigate: () => null
}));

// Mock de AuthContext
vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
}));

// Mock de AppNavigator
vi.mock('./navigation/AppNavigator', () => ({
  default: () => <h1>UADE - ArreglaYA Analytics</h1>
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('contains the main heading', () => {
    render(<App />);
    const heading = screen.getByText('UADE - ArreglaYA Analytics');
    expect(heading).toBeInTheDocument();
  });
});
