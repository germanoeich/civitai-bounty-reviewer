import React from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-4 right-4 p-3 rounded-full bg-white dark:bg-darkContainerBg shadow-lg hover:shadow-xl transition-all duration-200 z-50"
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Sun className="w-6 h-6 text-yellow-500" />
      ) : (
        <Moon className="w-6 h-6 text-gray-700" />
      )}
    </button>
  );
};

export default ThemeToggle; 