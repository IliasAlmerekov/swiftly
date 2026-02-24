import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ErrorBoundary from './ErrorBoundary';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders fallback UI when child throws', () => {
    const Bomb = () => {
      throw new Error('boom');
    };

    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary showDetails={false}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('calls onError callback when child throws', () => {
    const onError = vi.fn();
    const Bomb = () => {
      throw new Error('boom');
    };

    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary onError={onError} showDetails={false}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });

  it('renders custom fallback when provided', () => {
    const Bomb = () => {
      throw new Error('boom');
    };

    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>} showDetails={false}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });
});
