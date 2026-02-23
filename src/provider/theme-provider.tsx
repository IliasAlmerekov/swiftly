import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { createStrictContext } from '@/shared/lib/createStrictContext';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const [ThemeProviderContext, useThemeContext] = createStrictContext<ThemeProviderState>({
  contextName: 'ThemeProviderContext',
  errorMessage: 'useTheme must be used within a ThemeProvider',
});

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useLayoutEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const handleThemeChange = useCallback(
    (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme);
      setTheme(nextTheme);
    },
    [storageKey],
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme: handleThemeChange,
    }),
    [theme, handleThemeChange],
  );

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  return useThemeContext();
};
