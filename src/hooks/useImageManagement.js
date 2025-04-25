import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import JSZip, { file } from 'jszip';

export const useImageManagement = ({ buckets }) => {
  const [allImages, setAllImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bucketAssignments, setBucketAssignments] = useState({});
  const [bucketPositions, setBucketPositions] = useState({});
  
  // Refs to prevent stale closures
  const allImagesRef = useRef(allImages);
  const bucketAssignmentsRef = useRef(bucketAssignments);
  const bucketPositionsRef = useRef(bucketPositions);
  const bucketsRef = useRef(buckets);
  
  // Update refs when state changes
  useEffect(() => {
    allImagesRef.current = allImages;
  }, [allImages]);
  
  useEffect(() => {
    bucketAssignmentsRef.current = bucketAssignments;

  }, [bucketAssignments]);
  
  useEffect(() => {
    bucketPositionsRef.current = bucketPositions;
  }, [bucketPositions]);
  
  useEffect(() => {
    bucketsRef.current = buckets;
  }, [buckets]);
  
  // Scroll to top when switching images
  const imageContainerRef = useRef(null);
  
  useEffect(() => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollTop = 0;
    }
  }, [currentImageIndex]);

  // Memoize the current image to prevent unnecessary recalculations
  const getCurrentImage = useCallback(() => {
    return allImagesRef.current[currentImageIndex] || null;
  }, [currentImageIndex]);

  // Memoize the function to get images in a bucket
  const getImagesInBucket = useCallback((bucketId) => {
    const matchingIds = Object.keys(bucketAssignmentsRef.current).filter(id => 
      bucketAssignmentsRef.current[id] === bucketId
    );
    
    // Sort by position if available
    const images = matchingIds
      .map(id => {
        // Convert the string ID to a number for comparison
        const numericId = parseInt(id, 10);
        const img = allImagesRef.current.find(img => img.id === numericId);
        return { image: img, position: bucketPositionsRef.current[id] || Infinity };
      })
      .sort((a, b) => a.position - b.position)
      .map(item => item.image)
      .filter(Boolean); // Remove any undefined entries
      
    return images;
  }, []);

  // Optimize bucket assignment
  const handleAssignToBucket = useCallback((imageId, bucketId) => {
    // Check if the assignment is already the same
    if (bucketAssignmentsRef.current[imageId] === bucketId) return true;
    
    // If we're assigning to a bucket with a limit, check if we'll exceed it
    const bucket = bucketsRef.current.find(b => b.id === bucketId);
    if (bucket && bucket.limit) {
      const currentCount = Object.values(bucketAssignmentsRef.current).filter(b => b === bucketId).length;
      if (currentCount >= bucket.limit) {
        alert(`You've reached the limit of ${bucket.limit} images for the "${bucket.name}" bucket.`);
        return false;
      }
    }
    
    // Batch state updates to prevent flickering
    const updates = {
      assignments: { ...bucketAssignmentsRef.current },
      positions: { ...bucketPositionsRef.current }
    };
    
    // Update bucket assignments
    updates.assignments[imageId] = bucketId;
    
    // If this is a new assignment to a bucket with positions, add position
    if (!updates.positions[imageId]) {
      const imagesInBucket = getImagesInBucket(bucketId);
      updates.positions[imageId] = imagesInBucket.length + 1;
    }
    
    // Apply updates in a single batch
    setBucketAssignments(updates.assignments);
    setBucketPositions(updates.positions);
    
    return true;
  }, [getImagesInBucket]);

  // Optimize move to bucket
  const handleMoveToBucket = useCallback((imageId, bucketId) => {
    // Same as assign, but doesn't advance to next image
    return handleAssignToBucket(imageId, bucketId);
  }, [handleAssignToBucket]);

  // Optimize image position updates
  const handleMoveImagePosition = useCallback((imageId, newPosition) => {
    const bucketId = bucketAssignmentsRef.current[imageId];
    if (!bucketId) return;
    
    const imagesInBucket = getImagesInBucket(bucketId);
    
    // Calculate the current position
    const currentPositionObj = imagesInBucket.findIndex(img => img.id === imageId);
    if (currentPositionObj === -1) return;
    
    // Ensure new position is within bounds
    const newPos = Math.max(0, Math.min(newPosition - 1, imagesInBucket.length - 1));
    
    // Get the current numerical positions
    const oldPos = currentPositionObj;
    
    // Only update if position actually changes
    if (oldPos === newPos) return;
    
    // Batch position updates
    const updatedPositions = { ...bucketPositionsRef.current };
    
    // Update positions for all affected images
    if (oldPos < newPos) {
      // Moving down in the list
      for (let i = 0; i < imagesInBucket.length; i++) {
        const img = imagesInBucket[i];
        const imgPos = bucketPositionsRef.current[img.id] || i + 1;
        
        if (i === oldPos) {
          // This is the image we're moving
          updatedPositions[img.id] = newPos + 1;
        } else if (i > oldPos && i <= newPos) {
          // These images need to shift up
          updatedPositions[img.id] = imgPos - 1;
        } else {
          // Keep positions for other images
          updatedPositions[img.id] = imgPos;
        }
      }
    } else if (oldPos > newPos) {
      // Moving up in the list
      for (let i = 0; i < imagesInBucket.length; i++) {
        const img = imagesInBucket[i];
        const imgPos = bucketPositionsRef.current[img.id] || i + 1;
        
        if (i === oldPos) {
          // This is the image we're moving
          updatedPositions[img.id] = newPos + 1;
        } else if (i >= newPos && i < oldPos) {
          // These images need to shift down
          updatedPositions[img.id] = imgPos + 1;
        } else {
          // Keep positions for other images
          updatedPositions[img.id] = imgPos;
        }
      }
    }
    
    // Apply the batch update
    setBucketPositions(updatedPositions);
  }, [getImagesInBucket]);

  // Navigation functions
  const handlePrevious = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prevIndex => prevIndex - 1);
    }
  }, [currentImageIndex]);

  const handleSkip = useCallback(() => {
    if (currentImageIndex < allImagesRef.current.length - 1) {
      setCurrentImageIndex(prevIndex => prevIndex + 1);
    }
  }, [currentImageIndex]);

  // Add effect to handle currentImageIndex bounds
  useEffect(() => {
    if (allImages.length > 0 && currentImageIndex >= allImages.length) {
      setCurrentImageIndex(Math.max(0, allImages.length - 1));
    }
  }, [allImages.length, currentImageIndex]);

  // Get statistics
  const getStats = useCallback(() => {
    // Count images in each bucket
    const bucketCounts = {};
    bucketsRef.current.forEach(bucket => {
      bucketCounts[bucket.id] = 0;
    });
    
    Object.values(bucketAssignmentsRef.current).forEach(bucketId => {
      if (bucketCounts[bucketId] !== undefined) {
        bucketCounts[bucketId]++;
      }
    });
    
    // Calculate progress
    const totalReviewed = Object.keys(bucketAssignmentsRef.current).length;
    const totalImages = allImagesRef.current.length;
    const percentComplete = totalImages > 0 ? Math.round((totalReviewed / totalImages) * 100) : 0;
    
    return {
      bucketCounts,
      totalReviewed,
      totalImages,
      percentComplete,
      remaining: totalImages - totalReviewed,
      currentImageIndex: Math.min(currentImageIndex, totalImages - 1)
    };
  }, [currentImageIndex]);

  // Save image functionality
  const handleSaveImage = useCallback(async (imageUrl, filename) => {
    if (!imageUrl) return;
    
    try {
      // If the URL is already a full Civitai URL, use it as is
      const formattedUrl = imageUrl.startsWith('https://image.civitai.com/') 
        ? imageUrl 
        : `https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${imageUrl}/original=true`;
      
      // Fetch the image as a blob
      const response = await fetch(formattedUrl);
      const blob = await response.blob();
      
      // Create a download link with the blob
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename || 'image.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL object
      URL.revokeObjectURL(a.href);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  }, []);

  // Save bucket images functionality
  const handleSaveBucketImages = useCallback(async (bucketId) => {
    const imagesInBucket = getImagesInBucket(bucketId);
    if (imagesInBucket.length === 0) {
      alert('No images in this bucket to save.');
      return;
    }
    
    const bucket = bucketsRef.current.find(b => b.id === bucketId);
    const bucketName = bucket ? bucket.name : bucketId;
    
    const zip = new JSZip();
    
    // Keep track of file names to avoid duplicates
    const fileNames = new Set();
    
    // Function to generate unique filenames
    const getUniqueFileName = (img, idx) => {
      // Try to get a name from metadata
      let baseName = '';
      
      // Try to get name from metadata if available
      if (img.entryData && img.entryData.name) {
        baseName = img.entryData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      }
      
      // If no name from metadata, use a simple numbered name
      if (!baseName) {
        baseName = `image_${idx + 1}`;
      }
      
      let fileName = `${baseName}.jpg`;
      let count = 1;
      
      // Ensure filename is unique
      while (fileNames.has(fileName)) {
        fileName = `${baseName}_${count}.jpg`;
        count++;
      }
      
      fileNames.add(fileName);
      return fileName;
    };
    
    try {
      // Add each image to the zip
      const fetchPromises = imagesInBucket.map(async (img, idx) => {
        try {
          // If the URL is already a full Civitai URL, use it as is
          const formattedUrl = img.url.startsWith('https://image.civitai.com/')
            ? img.url
            : `https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${img.url}/original=true`;
            
          const response = await fetch(formattedUrl);
          const blob = await response.blob();
          const fileName = getUniqueFileName(img, idx);
          zip.file(fileName, blob);
          return true;
        } catch (error) {
          console.error(`Failed to fetch image: ${img.url}`, error);
          return false;
        }
      });
      
      await Promise.all(fetchPromises);
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `civitai_bounty_${bucketName.replace(/\s+/g, '_').toLowerCase()}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error creating zip file:', error);
      alert('Error creating zip file: ' + error.message);
    }
  }, [getImagesInBucket]);

  // Export all image management state and functions
  return {
    allImages,
    setAllImages,
    currentImageIndex,
    setCurrentImageIndex,
    bucketAssignments,
    setBucketAssignments,
    bucketPositions,
    setBucketPositions,
    imageContainerRef,
    getCurrentImage,
    getImagesInBucket,
    handleAssignToBucket,
    handleMoveToBucket,
    handleMoveImagePosition,
    handlePrevious,
    handleSkip,
    getStats,
    handleSaveImage,
    handleSaveBucketImages
  };
}; 