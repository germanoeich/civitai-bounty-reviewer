import { useCallback, useRef } from 'react';

export const useAppState = ({ 
  bountyData, 
  imageManagement, 
  buckets, 
  setBuckets, 
  isPaused,
  setIsPaused,
  storageKey,
  setActiveBucketTab,
  setStorageLoadTime,
  setLoadedFromStorage
}) => {
  // Use refs to track previous values
  const prevEntriesRef = useRef(bountyData.entries);
  const prevJsonDataRef = useRef(bountyData.jsonData);
  const prevBucketAssignmentsRef = useRef(imageManagement.bucketAssignments);
  const prevBucketPositionsRef = useRef(imageManagement.bucketPositions);

  // Get the complete app state
  const getFullState = useCallback(() => {
    return {
      version: '1.0',
      appName: 'Civitai Bounty Reviewer',
      bountyId: bountyData.bountyId,
      fileUploaded: bountyData.fileUploaded,
      exportedAt: new Date().toISOString(),
      buckets: buckets,
      currentImageIndex: imageManagement.currentImageIndex,
      isPaused: isPaused,
      bucketAssignments: imageManagement.bucketAssignments,
      bucketPositions: imageManagement.bucketPositions,
      entries: bountyData.entries,
      allImages: imageManagement.allImages,
      totalImages: imageManagement.allImages.length
    };
  }, [
    bountyData.bountyId,
    bountyData.fileUploaded,
    bountyData.entries,
    buckets,
    imageManagement.allImages,
    imageManagement.bucketAssignments,
    imageManagement.bucketPositions,
    imageManagement.currentImageIndex,
    isPaused
  ]);

  // Handle saving the app state to a file
  const handleSaveAppState = useCallback(() => {
    try {
      const state = getFullState();
      
      // Convert to JSON
      const jsonContent = JSON.stringify(state, null, 2);
      
      // Create a blob
      const blob = new Blob([jsonContent], { type: 'application/json' });
      
      // Download the file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `civitai_bounty_reviewer_state.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error saving app state:', error);
      alert('Error saving app state: ' + error.message);
    }
  }, [getFullState]);

  // Handle loading app state
  const handleLoadAppState = useCallback((state, isInitialLoad = false) => {
    if (!state) return;

    try {
      // Don't load state if we're loading a different bounty (only if we have a current bounty)
      if (state.bountyId && bountyData.bountyId && state.bountyId !== bountyData.bountyId) {
        console.log('Skipping state load - different bounty');
        return false;
      }

      // Set fileUploaded first to ensure proper view state
      if (state.fileUploaded !== undefined) {
        bountyData.setFileUploaded(state.fileUploaded);
      }

      // Set up jsonData with the saved state first
      if (state.allImages && Array.isArray(state.allImages)) {
        const jsonData = {
          bountyId: state.bountyId,
          entries: state.entries,
          images: state.allImages.map(img => ({
            id: img.id,
            bucket: state.bucketAssignments[img.id]
          }))
        };
        bountyData.setJsonData(jsonData);
      }

      // Check if the state has actually changed
      const entriesChanged = JSON.stringify(state.entries) !== JSON.stringify(prevEntriesRef.current);
      const assignmentsChanged = JSON.stringify(state.bucketAssignments) !== JSON.stringify(prevBucketAssignmentsRef.current);
      const positionsChanged = JSON.stringify(state.bucketPositions) !== JSON.stringify(prevBucketPositionsRef.current);

      // Only update if there are actual changes
      if (state.bountyId) {
        bountyData.setBountyId(state.bountyId);
      }
      if (entriesChanged && state.entries && Array.isArray(state.entries)) {
        bountyData.setEntries(state.entries);
        prevEntriesRef.current = state.entries;
      }

      if (state.allImages && Array.isArray(state.allImages)) {
        imageManagement.setAllImages(state.allImages);
      }
      if (state.currentImageIndex !== undefined) {
        imageManagement.setCurrentImageIndex(state.currentImageIndex);
      }
      if (assignmentsChanged && state.bucketAssignments) {
        imageManagement.setBucketAssignments(state.bucketAssignments);
        prevBucketAssignmentsRef.current = state.bucketAssignments;
      }
      if (positionsChanged && state.bucketPositions) {
        imageManagement.setBucketPositions(state.bucketPositions);
        prevBucketPositionsRef.current = state.bucketPositions;
      }

      if (state.buckets && Array.isArray(state.buckets)) {
        setBuckets(state.buckets);
      }
      if (state.isPaused !== undefined) {
        setIsPaused(state.isPaused);
      }
      if (state.activeBucketTab) {
        setActiveBucketTab(state.activeBucketTab);
      }

      // Record storage load time if this is the initial load and the function exists
      if (isInitialLoad && state.exportedAt && typeof setStorageLoadTime === 'function') {
        setStorageLoadTime(state.exportedAt);
        if (typeof setLoadedFromStorage === 'function') {
          setLoadedFromStorage(true);
        }
      }

      return true;
    } catch (error) {
      console.error('Error loading app state:', error);
      return false;
    }
  }, [
    bountyData, 
    imageManagement, 
    setBuckets, 
    setIsPaused, 
    setActiveBucketTab,
    setStorageLoadTime,
    setLoadedFromStorage
  ]);

  // Get the ordinal representation of a number
  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return {
    getFullState,
    handleSaveAppState,
    handleLoadAppState,
    getOrdinal
  };
}; 