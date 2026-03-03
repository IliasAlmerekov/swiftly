import { describe, expect, it } from 'vitest';

import { render, screen } from '@/test/test-utils';

import { LoadingState } from './LoadingState';

describe('LoadingState', () => {
  it('renders with explicit message', () => {
    render(<LoadingState message="Loading tickets..." />);

    expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
  });

  it('renders with default message', () => {
    render(<LoadingState />);

    const text = screen.getByText('Loading...');
    expect(text).toBeInTheDocument();
    expect(text.textContent).toBeTruthy();
  });

  it('renders a loading indicator', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });
});
