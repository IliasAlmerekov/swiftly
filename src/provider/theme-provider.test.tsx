import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { memo, useState } from 'react';

import { ThemeProvider, useTheme } from './theme-provider';

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    const Consumer = () => {
      useTheme();
      return null;
    };

    expect(() => render(<Consumer />)).toThrowError('useTheme must be used within a ThemeProvider');
  });

  it('does not rerender consumer when provider value dependencies do not change', () => {
    let renderCount = 0;

    const Consumer = memo(function Consumer() {
      renderCount += 1;
      const { setTheme } = useTheme();

      return (
        <button type="button" onClick={() => setTheme('light')}>
          use-theme
        </button>
      );
    });

    const Harness = () => {
      const [counter, setCounter] = useState(0);

      return (
        <>
          <button type="button" onClick={() => setCounter((value) => value + 1)}>
            rerender-parent
          </button>
          <span>{counter}</span>
          <ThemeProvider defaultTheme="light" storageKey="theme-provider-test-key">
            <Consumer />
          </ThemeProvider>
        </>
      );
    };

    render(<Harness />);

    expect(renderCount).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: 'rerender-parent' }));

    expect(renderCount).toBe(1);
  });
});
