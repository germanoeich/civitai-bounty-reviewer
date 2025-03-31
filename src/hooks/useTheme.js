import { useState, useEffect } from 'react';

const THEME_KEY = 'civitai-bounty-reviewer-theme';

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Then check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    
    // Update document class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return { isDarkMode, toggleTheme };
}; 