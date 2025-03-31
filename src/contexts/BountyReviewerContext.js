import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { defaultBuckets, STORAGE_KEY } from '../utils/constants';
import { useBountyData } from '../hooks/useBountyData';
import { useImageManagement } from '../hooks/useImageManagement';
import { useAppState } from '../hooks/useAppState';
import { useDataProcessing } from '../hooks/useDataProcessing';

const BountyReviewerContext = createContext(null);

export const BountyReviewerProvider = ({ children }) => {
  // Core state
  const [configMode, setConfigMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeBucketTab, setActiveBucketTab] = useState(null);
  const [buckets, setBuckets] = useState(defaultBuckets);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const [storageLoadTime, setStorageLoadTime] = useState(null);
  const [config, setConfig] = useState({
    skipEmptyBucket: false,
    darkMode: false,
    skipAssignedImages: false
  });

  // Use specialized hooks for different aspects of the app
  const bountyData = useBountyData();
  const imageManagement = useImageManagement({ buckets });
  const appState = useAppState({ 
    bountyData, 
    imageManagement, 
    buckets, 
    setBuckets, 
    isPaused, 
    setIsPaused,
    storageKey: STORAGE_KEY,
    setActiveBucketTab,
    setStorageLoadTime,
    setLoadedFromStorage
  });

  // Connect data from bountyData to imageManagement
  useDataProcessing({
    entries: bountyData.entries,
    setAllImages: imageManagement.setAllImages,
    setBucketAssignments: imageManagement.setBucketAssignments,
    jsonData: bountyData.jsonData,
    isLoadingRatings: bountyData.isLoadingRatings
  });

  // Only set initial active bucket tab if there's actual data and a bucket is selected
  useEffect(() => {
    if (buckets.length > 0 && activeBucketTab === null && bountyData.fileUploaded) {
      // Check if we have any images in buckets before setting a default
      const hasAssignedImages = imageManagement.bucketAssignments 
        && Object.keys(imageManagement.bucketAssignments).length > 0;
        
      if (hasAssignedImages) {
        setActiveBucketTab(buckets[0].id);
      }
    }
  }, [buckets, activeBucketTab, bountyData.fileUploaded, imageManagement.bucketAssignments]);

  // Track if we've already loaded from storage
  const hasLoadedFromStorage = useRef(false);

  // Load state from localStorage on initial mount
  useEffect(() => {
    const loadFromLocalStorage = () => {
      // Skip if we've already loaded from storage
      if (hasLoadedFromStorage.current) return;

      try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // Load the state first
          appState.handleLoadAppState(parsedState, true);
          // Then set flags after successful load
          setStorageLoadTime(parsedState.exportedAt || new Date().toISOString());
          hasLoadedFromStorage.current = true;
          setLoadedFromStorage(true);
        }
      } catch (error) {
        console.error("Error loading state from localStorage:", error);
      }
    };
    
    loadFromLocalStorage();
  }, []);

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    // Save if we have data loaded
    if (bountyData.fileUploaded && imageManagement.allImages.length > 0) {
      const state = appState.getFullState();
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
        // Handle potential quota exceeded errors
        if (error.name === 'QuotaExceededError' || error.code === 22) {
          console.warn("LocalStorage quota exceeded. Some data may be too large to store.");
        }
      }
    }
  }, [
    bountyData.fileUploaded,
    bountyData.bountyId, 
    buckets, 
    imageManagement.currentImageIndex, 
    isPaused, 
    imageManagement.bucketAssignments, 
    imageManagement.bucketPositions,
    activeBucketTab, 
    bountyData.entries,
    imageManagement.allImages,
    appState.getFullState
  ]);

  // Memoize simple functions to prevent unnecessary re-renders
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    // If we're pausing, set the active bucket tab to the first bucket
    if (!isPaused && buckets.length > 0) {
      setActiveBucketTab(buckets[0].id);
    }
  }, [isPaused, buckets]);

  const finishReview = useCallback(() => {
    setIsPaused(true);
    // When finishing, set the active bucket tab to the first bucket
    if (buckets.length > 0) {
      setActiveBucketTab(buckets[0].id);
    }
  }, [buckets]);

  const resumeReview = useCallback(() => {
    setIsPaused(false);
    // Ensure fileUploaded state is maintained
    if (bountyData.entries.length > 0) {
      bountyData.setFileUploaded(true);
    }
  }, [bountyData]);

  const dismissStorageNotification = useCallback(() => setLoadedFromStorage(false), []);

  // Handle bucket management
  const handleAddBucket = useCallback((newBucket) => {
    setBuckets(prevBuckets => [...prevBuckets, newBucket]);
  }, []);

  const handleEditBucket = useCallback((index, updatedBucket) => {
    setBuckets(prevBuckets => {
      const newBuckets = [...prevBuckets];
      newBuckets[index] = updatedBucket;
      return newBuckets;
    });
    
    // If we're editing the active bucket, update the tab as well
    if (activeBucketTab === buckets[index].id) {
      setActiveBucketTab(updatedBucket.id);
    }
    
    // Update bucket assignments if bucket ID changed
    if (buckets[index].id !== updatedBucket.id) {
      imageManagement.setBucketAssignments(prevAssignments => {
        const newAssignments = { ...prevAssignments };
        Object.keys(newAssignments).forEach(imageId => {
          if (newAssignments[imageId] === buckets[index].id) {
            newAssignments[imageId] = updatedBucket.id;
          }
        });
        return newAssignments;
      });
    }
  }, [activeBucketTab, buckets, imageManagement]);

  const handleRemoveBucket = useCallback((index) => {
    setBuckets(prevBuckets => prevBuckets.filter((_, i) => i !== index));
  }, []);

  const handleResetBuckets = useCallback(() => {
    setBuckets(defaultBuckets);
    setActiveBucketTab(defaultBuckets[0].id);
  }, []);

  // Handle configuration updates
  const updateConfig = useCallback((newConfig) => {
    setConfig(prevConfig => ({ ...prevConfig, ...newConfig }));
  }, []);

  const saveConfig = useCallback(() => {
    // Save config to localStorage
    try {
      localStorage.setItem(`${STORAGE_KEY}-config`, JSON.stringify(config));
    } catch (error) {
      console.error("Error saving config to localStorage:", error);
    }
  }, [config]);

  // Load config from localStorage on initial mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(`${STORAGE_KEY}-config`);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prevConfig => ({ ...prevConfig, ...parsedConfig }));
      }
    } catch (error) {
      console.error("Error loading config from localStorage:", error);
    }
  }, []);

  const resetReview = useCallback(() => {
    // Clear all state
    bountyData.setFileUploaded(false);
    bountyData.setBountyId(null);
    bountyData.setEntries([]);
    bountyData.setJsonData(null);
    imageManagement.setAllImages([]);
    imageManagement.setCurrentImageIndex(0);
    imageManagement.setBucketAssignments({});
    imageManagement.setBucketPositions({});
    setBuckets(defaultBuckets);
    setActiveBucketTab(null);
    setIsPaused(false);
    
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}-config`);
      hasLoadedFromStorage.current = false;
      setLoadedFromStorage(false);
      setStorageLoadTime(null);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }, [bountyData, imageManagement, setBuckets, setActiveBucketTab, setIsPaused, setLoadedFromStorage, setStorageLoadTime]);

  const handleUrlLoad = useCallback(async (url) => {
    try {
      // Reset state before loading new bounty
      resetReview();
      
      // Add a small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Process the images first to ensure we have them before setting other state
      const processedImages = data.entries.flatMap(entry => {
        // Handle both single images and arrays of images
        const images = Array.isArray(entry.images) ? entry.images : [entry];
        return images.map(img => ({
          id: img.id,
          url: img.url,
          type: img.type || 'image', // Ensure type is set
          metadata: img.metadata || entry.metadata,
          entryId: entry.id, // Keep reference to parent entry
          entryData: entry // Keep full entry data
        }));
      });

      // Only proceed if we have images
      if (processedImages.length === 0) {
        throw new Error('No images found in the bounty data');
      }
      
      // Set up the new bounty data
      bountyData.setFileUploaded(true);
      bountyData.setBountyId(data.bountyId);
      bountyData.setEntries(data.entries);
      bountyData.setJsonData(data);
      
      // Set up image management
      imageManagement.setAllImages(processedImages);
      imageManagement.setCurrentImageIndex(0);
      imageManagement.setBucketAssignments({});
      imageManagement.setBucketPositions({});
      
      // Reset UI state
      setBuckets(defaultBuckets);
      setActiveBucketTab(null);
      setIsPaused(false);
      
      // Clear any existing state from localStorage
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}-config`);
        hasLoadedFromStorage.current = false;
        setLoadedFromStorage(false);
        setStorageLoadTime(null);
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
      
      return true;
    } catch (error) {
      console.error('Error loading bounty:', error);
      alert('Error loading bounty: ' + error.message);
      // Ensure state is reset on error
      resetReview();
      return false;
    }
  }, [bountyData, imageManagement, setBuckets, setActiveBucketTab, setIsPaused, resetReview, setLoadedFromStorage, setStorageLoadTime]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Core app state
    configMode,
    setConfigMode,
    isPaused,
    activeBucketTab,
    setActiveBucketTab,
    buckets,
    loadedFromStorage,
    storageLoadTime,
    
    // Configuration
    config,
    updateConfig,
    saveConfig,
    
    // Bounty data functions and state
    ...bountyData,
    
    // Image management functions and state
    ...imageManagement,
    
    // App state functions
    ...appState,
    
    // Pause/resume functions
    togglePause,
    finishReview,
    resumeReview,
    dismissStorageNotification,
    
    // Bucket management
    handleAddBucket,
    handleEditBucket,
    handleRemoveBucket,
    handleResetBuckets,
    resetReview,
    handleUrlLoad
  }), [
    configMode, isPaused, activeBucketTab, buckets, loadedFromStorage, storageLoadTime,
    config, updateConfig, saveConfig,
    bountyData, imageManagement, appState, 
    togglePause, finishReview, resumeReview, dismissStorageNotification,
    handleAddBucket, handleEditBucket, handleRemoveBucket, handleResetBuckets, resetReview, handleUrlLoad
  ]);

  return (
    <BountyReviewerContext.Provider value={contextValue}>
      {children}
    </BountyReviewerContext.Provider>
  );
};

export const useBountyReviewer = () => {
  const context = useContext(BountyReviewerContext);
  if (context === null) {
    throw new Error('useBountyReviewer must be used within a BountyReviewerProvider');
  }
  return context;
}; 