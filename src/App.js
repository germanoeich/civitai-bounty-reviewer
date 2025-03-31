import React, { useEffect } from 'react';
import { BountyReviewerProvider, useBountyReviewer } from './contexts/BountyReviewerContext';
import ReviewView from './components/review/ReviewView';
import ConfigView from './components/review/ConfigView';
import PausedView from './components/paused/PausedView';
import LocalStorageNotification from './components/shared/LocalStorageNotification';
import { useTheme } from './hooks/useTheme';
import ThemeToggle from './components/shared/ThemeToggle';

const AppContent = () => {
  const { 
    configMode, 
    isPaused,
    loadedFromStorage, 
    storageLoadTime, 
    dismissStorageNotification,
    handleFileUpload,
    fileUploaded
  } = useBountyReviewer();

  const { isDarkMode, toggleTheme } = useTheme();

  // Apply dark mode class to body
  useEffect(() => {
    // Check system preference
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply dark mode class
    if (prefersDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-darkBg p-4 transition-colors duration-300">
      {loadedFromStorage && (
        <LocalStorageNotification 
          timestamp={storageLoadTime} 
          onDismiss={dismissStorageNotification} 
        />
      )}
      
      {configMode ? (
        <ConfigView />
      ) : isPaused ? (
        <PausedView />
      ) : (
        <ReviewView handleFileUpload={handleFileUpload} />
      )}
      <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
    </div>
  );
};

const App = () => {
  return (
    <BountyReviewerProvider>
      <AppContent />
    </BountyReviewerProvider>
  );
};

export default App;