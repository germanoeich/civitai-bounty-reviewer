import { useEffect, useMemo, useCallback, useRef } from 'react';

export const useDataProcessing = ({ entries, setAllImages, setBucketAssignments, jsonData, isLoadingRatings }) => {
  // Refs to track previous values
  const prevEntriesRef = useRef(entries);
  const prevJsonDataRef = useRef(jsonData);
  const prevIsLoadingRatingsRef = useRef(isLoadingRatings);

  // Memoize the image processing function to avoid recreating on every render
  const processImages = useCallback((entryList) => {
    if (!entryList || entryList.length === 0) return [];
    
    const images = [];
    entryList.forEach(entry => {
      if (entry.images && Array.isArray(entry.images)) {
        entry.images.forEach(image => {
          // Make sure we have a valid URL
          let imageUrl = null;
          
          // Try to extract URL in various possible ways
          if (image.url) {
            imageUrl = image.url;
          } else if (image.hash) {
            // If image has a hash but no direct URL, construct it
            imageUrl = image.hash;
          } else if (entry.url) {
            // Use entry URL as fallback
            imageUrl = entry.url;
          } else if (entry.images && Array.isArray(entry.images)) {
            // Look for matching image in entry's images array
            const matchingImage = entry.images.find(img => img.id === image.id);
            if (matchingImage && matchingImage.url) {
              imageUrl = matchingImage.url;
            } else if (matchingImage && matchingImage.hash) {
              imageUrl = matchingImage.hash;
            }
          }

          const processedImage = {
            ...image,
            entryId: entry.id,
            entryData: entry,
            url: imageUrl,
            // Additional name field for display
            name: image.name || entry.name || `Image ${image.id}`
          };
          images.push(processedImage);
        });
      }
    });
    
    return images;
  }, []);

  // Memoize the ratings processing function
  const processRatings = useCallback((data) => {
    if (!data || !data.images || !Array.isArray(data.images)) return {};
    
    const assignments = {};
    data.images.forEach(img => {
      if (img.bucket) {
        assignments[img.id] = img.bucket;
      }
    });
    
    return assignments;
  }, []);

  // Use memo to avoid recalculating processed images unless entries change
  const processedImages = useMemo(() => {
    if (entries.length > 0) {
      const images = processImages(entries);
      return images;
    }
    return [];
  }, [entries, processImages]);

  // Use memo to avoid recalculating bucket assignments unless jsonData changes
  const bucketAssignments = useMemo(() => {
    
    if (jsonData && jsonData.images) {
      const assignments = processRatings(jsonData);
      return assignments;
    }
    return {};
  }, [jsonData, processRatings]);

  // Set processed images only when they actually change
  useEffect(() => {    
    if (processedImages.length > 0 && 
        JSON.stringify(processedImages) !== JSON.stringify(prevEntriesRef.current)) {
      setAllImages(processedImages);
      prevEntriesRef.current = processedImages;
    }
  }, [processedImages, setAllImages]);

  // Set bucket assignments only when they actually change
  useEffect(() => {  
    if ((isLoadingRatings || (jsonData && jsonData.images)) && 
        Object.keys(bucketAssignments).length > 0 && 
        (JSON.stringify(bucketAssignments) !== JSON.stringify(prevJsonDataRef.current) ||
         isLoadingRatings !== prevIsLoadingRatingsRef.current)) {
      setBucketAssignments(bucketAssignments);
      prevJsonDataRef.current = bucketAssignments;
      prevIsLoadingRatingsRef.current = isLoadingRatings;
    }
  }, [bucketAssignments, isLoadingRatings, setBucketAssignments, jsonData]);

  return null;
}; 