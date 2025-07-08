'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/constants';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = STORAGE_KEYS.theme,
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from storage
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setThemeState(stored as Theme);
    }
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Disable transitions during theme change
    if (disableTransitionOnChange) {
      root.classList.add('no-transitions');
    }

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    let resolvedTheme: 'light' | 'dark' = 'light';

    if (theme === 'system' && enableSystem) {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      resolvedTheme = theme === 'dark' ? 'dark' : 'light';
    }

    // Apply theme
    if (attribute === 'class') {
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute(attribute, resolvedTheme);
    }

    setActualTheme(resolvedTheme);

    // Re-enable transitions
    if (disableTransitionOnChange) {
      setTimeout(() => {
        root.classList.remove('no-transitions');
      }, 0);
    }
  }, [theme, attribute, enableSystem, disableTransitionOnChange]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      setActualTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(actualTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
