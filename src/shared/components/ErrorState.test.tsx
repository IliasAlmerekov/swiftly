import { describe, expect, it, vi } from 'vitest';

import { render, screen, userEvent } from '@/test/test-utils';

import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders close button when onClose is provided', () => {
    render(<ErrorState message="err" onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState message="err" onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose is absent', () => {
    render(<ErrorState message="err" />);

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });
});
