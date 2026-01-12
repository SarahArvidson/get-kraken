/**
 * Get Kraken v2 - Theme Hook
 * 
 * Manages light/dark mode theme with persistence
 */

import { useState, useEffect, useCallback } from "react";

export type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    // Default to system
    return 'system';
  });

  // Apply theme to document
  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = document.documentElement;
    
    if (mode === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Update theme mode
  const updateThemeMode = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('theme-mode', mode);
    applyTheme(mode);
  }, [applyTheme]);

  // Toggle between light and dark (skips system)
  const toggleTheme = useCallback(() => {
    const current = themeMode === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : themeMode;
    const next = current === 'light' ? 'dark' : 'light';
    updateThemeMode(next);
  }, [themeMode, updateThemeMode]);

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, applyTheme]);

  // Apply theme on mount and when themeMode changes
  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode, applyTheme]);

  return {
    themeMode,
    updateThemeMode,
    toggleTheme,
  };
}
