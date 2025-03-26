import { useState, useEffect, useRef } from 'react';
import { defaultBuckets } from '../utils/constants';

export const useBountyReviewer = () => {
  // State for data
  const [entries, setEntries] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bucketAssignments, setBucketAssignments] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [bountyId, setBountyId] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  
  // State for review controls
  const [isPaused, setIsPaused] = useState(false);
  const [activeBucketTab, setActiveBucketTab] = useState(null);
  const [configMode, setConfigMode] = useState(false);
  const [buckets, setBuckets] = useState(defaultBuckets);
  
  // Scroll to top when switching images
  const imageContainerRef = useRef(null);
  
  useEffect(() => {
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollTop = 0;
    }
  }, [currentImageIndex]);

  // Flatten all images into a single array with references back to their entries
  useEffect(() => {
    if (entries.length > 0) {
      const images = [];
      entries.forEach(entry => {
        entry.images.forEach(image => {
          images.push({
            ...image,
            entryId: entry.id,
            entryData: entry
          });
        });
      });
      setAllImages(images);
    }
  }, [entries]);

  // Set initial active bucket tab when data is loaded
  useEffect(() => {
    if (buckets.length > 0 && !activeBucketTab) {
      setActiveBucketTab(buckets[0].id);
    }
  }, [buckets, activeBucketTab]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Check if this is a standard bounty entries JSON
        if (jsonData.entries && Array.isArray(jsonData.entries)) {
          setBountyId(jsonData.bountyId || 'Unknown');
          setEntries(jsonData.entries);
          setJsonData(jsonData);
          setFileUploaded(true);
          setLoading(false);
          console.log(`Loaded ${jsonData.entries.length} entries with multiple images from JSON file`);
        } 
        // Check if this is a ratings JSON from our app
        else if (jsonData.images && Array.isArray(jsonData.images)) {
          setBountyId(jsonData.bountyId || 'Unknown');
          
          // Set the image bucket assignments
          setIsLoadingRatings(true);
          const assignments = {};
          jsonData.images.forEach(img => {
            if (img.bucket) {
              assignments[img.imageId] = img.bucket;
            }
          });
          setBucketAssignments(assignments);
          
          // If we have bucket configurations, load those
          if (jsonData.buckets && Array.isArray(jsonData.buckets)) {
            setBuckets(jsonData.buckets);
          }
          
          // If we have full entries data, load that too
          if (jsonData.entries && Array.isArray(jsonData.entries)) {
            setEntries(jsonData.entries);
          }
          
          setJsonData(jsonData);
          setFileUploaded(true);
          setLoading(false);
          setIsLoadingRatings(false);
          console.log(`Loaded ratings for ${jsonData.images.length} images from JSON file`);
        } else {
          throw new Error('Invalid JSON format: Expected either "entries" or "images" array');
        }
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        setError(`Failed to parse JSON file: ${error.message}`);
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read the file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  const resetReview = () => {
    setEntries([]);
    setAllImages([]);
    setBucketAssignments({});
    setCurrentImageIndex(0);
    setIsComplete(false);
    setFileUploaded(false);
    setJsonData(null);
    setBountyId(null);
    setActiveBucketTab(null);
    setIsPaused(false);
  };

  const handleAssignToBucket = (imageId, bucketId) => {
    setBucketAssignments(prev => ({
      ...prev,
      [imageId]: bucketId
    }));

    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleMoveToBucket = (imageId, bucketId) => {
    setBucketAssignments(prev => ({
      ...prev,
      [imageId]: bucketId
    }));
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const finishReview = () => {
    setIsComplete(true);
  };

  const resumeReview = () => {
    setIsComplete(false);
    setIsPaused(false);
  };

  const getCurrentImage = () => {
    return allImages[currentImageIndex];
  };

  const getImagesInBucket = (bucketId) => {
    return allImages.filter(image => bucketAssignments[image.id] === bucketId);
  };

  const getStats = () => {
    const result = {
      total: allImages.length,
      pending: 0,
      buckets: {}
    };
    
    // Initialize counts for each bucket
    buckets.forEach(bucket => {
      result.buckets[bucket.id] = 0;
    });
    
    // Count images in each bucket
    Object.entries(bucketAssignments).forEach(([imageId, bucketId]) => {
      if (bucketId && result.buckets[bucketId] !== undefined) {
        result.buckets[bucketId]++;
      }
    });
    
    // Count pending images
    result.pending = result.total - Object.keys(bucketAssignments).length;
    
    return result;
  };

  const handleSaveImage = (imageUrl, filename) => {
    const link = document.createElement('a');
    link.href = `https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${imageUrl}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveRatingsJson = () => {
    const ratedImages = allImages.filter(image => bucketAssignments[image.id] !== undefined);
    
    const outputData = {
      bountyId: bountyId,
      exportedAt: new Date().toISOString(),
      buckets: buckets,
      images: ratedImages.map(image => ({
        imageId: image.id,
        entryId: image.entryId,
        url: image.url,
        bucket: bucketAssignments[image.id]
      })),
      entries: entries
    };
    
    const dataStr = JSON.stringify(outputData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `image_buckets_bounty_${bountyId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveBucketImages = (bucketId) => {
    const bucketImages = getImagesInBucket(bucketId);
    const bucket = buckets.find(b => b.id === bucketId);
    const bucketName = bucket ? bucket.name.replace(/\s+/g, '_').toLowerCase() : bucketId;
    
    alert(`This will download ${bucketImages.length} images from the "${bucket ? bucket.name : bucketId}" bucket one by one.`);
    
    bucketImages.forEach((image, imageIndex) => {
      setTimeout(() => {
        handleSaveImage(
          image.url, 
          `bounty_${bountyId}_${bucketName}_${imageIndex+1}_image_${image.id}.jpg`
        );
      }, imageIndex * 1000);
    });
  };

  const handleAddBucket = (newBucket) => {
    setBuckets(prev => [...prev, newBucket]);
  };

  const handleEditBucket = (index, updatedBucket) => {
    setBuckets(prev => {
      const newBuckets = [...prev];
      newBuckets[index] = updatedBucket;
      return newBuckets;
    });

    // Update bucket assignments to use the new bucket ID
    setBucketAssignments(prev => {
      const oldBucketId = buckets[index].id;
      const newBucketId = updatedBucket.id;
      
      // If the bucket ID hasn't changed, no need to update assignments
      if (oldBucketId === newBucketId) {
        return prev;
      }

      // Create new assignments object with updated bucket IDs
      const newAssignments = {};
      Object.entries(prev).forEach(([imageId, bucketId]) => {
        newAssignments[imageId] = bucketId === oldBucketId ? newBucketId : bucketId;
      });
      
      return newAssignments;
    });
  };

  const handleRemoveBucket = (index) => {
    setBuckets(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetBuckets = () => {
    setBuckets(defaultBuckets);
  };

  const stats = getStats();

  return {
    entries,
    allImages,
    loading,
    error,
    currentImageIndex,
    bucketAssignments,
    isComplete,
    bountyId,
    fileUploaded,
    jsonData,
    isLoadingRatings,
    isPaused,
    activeBucketTab,
    configMode,
    buckets,
    stats,
    handleFileUpload,
    handleAssignToBucket,
    handleMoveToBucket,
    handlePrevious,
    handleSkip,
    togglePause,
    finishReview,
    resumeReview,
    resetReview,
    setConfigMode,
    setActiveBucketTab,
    getCurrentImage,
    getImagesInBucket,
    handleSaveImage,
    handleSaveRatingsJson,
    handleSaveBucketImages,
    handleAddBucket,
    handleEditBucket,
    handleRemoveBucket,
    handleResetBuckets,
  };
}; 