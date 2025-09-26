/**
 * Tests for App component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  it('should render the main heading', () => {
    render(<App />);

    const heading = screen.getByRole('heading', { name: /intelligent todo/i });
    expect(heading).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    render(<App />);

    const welcomeText = screen.getByText(/welcome to your intelligent todo application/i);
    expect(welcomeText).toBeInTheDocument();
  });

  it('should show setup complete message', () => {
    render(<App />);

    const setupMessage = screen.getByText(/setup complete/i);
    expect(setupMessage).toBeInTheDocument();
  });
});