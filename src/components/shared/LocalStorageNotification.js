import React, { memo, useState, useEffect } from 'react';
import { X, InfoIcon } from 'lucide-react';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown time';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  
  // Format relative time
  if (diffMs < 60000) {
    return 'just now';
  } else if (diffMs < 3600000) {
    const minutes = Math.floor(diffMs / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffMs < 86400000) {
    const hours = Math.floor(diffMs / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleString();
  }
};

const LocalStorageNotification = memo(({ timestamp, onDismiss }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDismissed(true);
      if (typeof onDismiss === 'function') {
        onDismiss();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  // If dismissed, don't render
  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-blue-50 dark:bg-blue-900 p-3 rounded-lg shadow-lg border border-blue-200 dark:border-blue-700 transition-opacity duration-300 max-w-xs">
      <div className="flex items-start">
        <InfoIcon className="w-4 h-4 text-blue-500 dark:text-blue-300 mr-2 mt-0.5 flex-shrink-0" />
        <div className="flex-grow">
          <div className="font-medium text-sm text-blue-700 dark:text-blue-200">
            Restored previous session
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            Your previous review session from {formatTimestamp(timestamp)} has been restored.
          </p>
        </div>
        <button 
          onClick={handleDismiss}
          className="ml-2 p-1 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

LocalStorageNotification.displayName = 'LocalStorageNotification';

export default LocalStorageNotification; 