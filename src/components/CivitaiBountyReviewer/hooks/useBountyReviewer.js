import { useState, useEffect, useRef } from 'react';
import { defaultBuckets } from '../utils/constants';
import JSZip from 'jszip';

export const useBountyReviewer = () => {
  // State for data
  const [entries, setEntries] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bucketAssignments, setBucketAssignments] = useState({});
  const [bucketPositions, setBucketPositions] = useState({});
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
          const processedImage = {
            ...image,
            entryId: entry.id,
            entryData: entry,
            url: image.url || image.entryData?.url || image.entryData?.images?.find(img => img.id === image.id)?.url // Try multiple possible URL locations
          };
          images.push(processedImage);
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
        
        // Check if this is a complete app state JSON (contains version field)
        if (jsonData.version) {
          // This is a saved app state
          handleLoadAppState(jsonData);
        }
        // Check if this is a standard bounty entries JSON
        else if (jsonData.entries && Array.isArray(jsonData.entries)) {
          setBountyId(jsonData.bountyId || 'Unknown');
          setEntries(jsonData.entries);
          setJsonData(jsonData);
          setFileUploaded(true);
          setLoading(false);
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
        } else {
          throw new Error('Invalid JSON format: Expected either "entries", "images" array, or a saved application state');
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

  const handleUrlLoad = (url) => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(jsonData => {
        // Check if this is a complete app state JSON (contains version field)
        if (jsonData.version) {
          // This is a saved app state
          handleLoadAppState(jsonData);
        }
        // Check if this is a standard bounty entries JSON
        else if (jsonData.entries && Array.isArray(jsonData.entries)) {
          setBountyId(jsonData.bountyId || 'Unknown');
          setEntries(jsonData.entries);
          setJsonData(jsonData);
          setFileUploaded(true);
          setLoading(false);
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
        } else {
          throw new Error('Invalid JSON format: Expected either "entries", "images" array, or a saved application state');
        }
      })
      .catch(error => {
        console.error("Error loading JSON from URL:", error);
        setError(`Failed to load JSON from URL: ${error.message}`);
        setLoading(false);
      });
  };
  const resetReview = () => {
    const goAhead = window.confirm("Are you sure? This will clear all the ratings you've made so far. Make sure you saved your review first.");
    if(!goAhead) return;
    setEntries([]);
    setAllImages([]);
    setBucketAssignments({});
    setBucketPositions({});
    setCurrentImageIndex(0);
    setFileUploaded(false);
    setJsonData(null);
    setBountyId(null);
    setActiveBucketTab(null);
    setIsPaused(false);
  };

  const handleAssignToBucket = (imageId, bucketId) => {
    // Get current bucket's images to determine position
    const currentBucketImages = getImagesInBucket(bucketId);
    const newPosition = currentBucketImages.length + 1;

    setBucketAssignments(prev => ({
      ...prev,
      [imageId]: bucketId
    }));

    setBucketPositions(prev => ({
      ...prev,
      [imageId]: newPosition
    }));

    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setIsPaused(true);
    }
  };

  const handleMoveToBucket = (imageId, bucketId) => {
    // Get current bucket's images to determine position
    const currentBucketImages = getImagesInBucket(bucketId);
    const newPosition = currentBucketImages.length + 1;

    setBucketAssignments(prev => ({
      ...prev,
      [imageId]: bucketId
    }));

    setBucketPositions(prev => ({
      ...prev,
      [imageId]: newPosition
    }));
  };

  const handleMoveImagePosition = (imageId, newPosition) => {
    const bucketId = bucketAssignments[imageId];
    if (!bucketId) return;

    // Get all images in the bucket with their positions
    const bucketImages = getImagesInBucket(bucketId)
      .map(img => ({
        ...img,
        position: bucketPositions[img.id] || 0
      }))
      .sort((a, b) => a.position - b.position);

    // Update positions of affected images
    const updatedPositions = { ...bucketPositions };
    
    if (newPosition > bucketPositions[imageId]) {
      // Moving down - shift images in between down
      bucketImages.forEach(img => {
        if (img.id !== imageId && 
            img.position > bucketPositions[imageId] && 
            img.position <= newPosition) {
          updatedPositions[img.id] = img.position - 1;
        }
      });
    } else {
      // Moving up - shift images in between up
      bucketImages.forEach(img => {
        if (img.id !== imageId && 
            img.position >= newPosition && 
            img.position < bucketPositions[imageId]) {
          updatedPositions[img.id] = img.position + 1;
        }
      });
    }

    // Update the target image's position
    updatedPositions[imageId] = newPosition;
    setBucketPositions(updatedPositions);
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
    setIsPaused(true);
  };

  const resumeReview = () => {
    setIsPaused(false);
  };

  const getCurrentImage = () => {
    return allImages[currentImageIndex];
  };

  const getImagesInBucket = (bucketId) => {
    return allImages
      .filter(image => bucketAssignments[image.id] === bucketId)
      .map(image => ({
        ...image,
        position: bucketPositions[image.id] || 0
      }))
      .sort((a, b) => a.position - b.position);
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

  const handleSaveBucketImages = async (bucketId) => {
    const bucketImages = getImagesInBucket(bucketId);
    const bucket = buckets.find(b => b.id === bucketId);
    const bucketName = bucket ? bucket.name.replace(/\s+/g, '_').toLowerCase() : bucketId;
    
    try {
      // Create a new ZIP file
      const zip = new JSZip();
      const folder = zip.folder(`bounty_${bountyId}_${bucketName}`);

      // Download all images in parallel with a concurrency limit
      const concurrencyLimit = 5; // Download 5 images at a time
      const chunks = [];
      for (let i = 0; i < bucketImages.length; i += concurrencyLimit) {
        chunks.push(bucketImages.slice(i, i + concurrencyLimit));
      }

      let downloadedCount = 0;
      for (const chunk of chunks) {
        await Promise.all(chunk.map(async (image) => {
          try {
            // Construct the full image URL with the Civitai CDN base URL
            const imageUrl = `https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url || image.entryData?.url}/width=1024`;

            // Fetch the image
            const response = await fetch(imageUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();

            // Add the image to the ZIP file with position-based filename
            const position = image.position || 0;
            const ordinal = getOrdinal(position);
            folder.file(`${ordinal}_${image.type}_${image.id}_${image.name}`, blob);
            downloadedCount++;
          } catch (error) {
            console.error(`Failed to download image ${image.id}:`, error);
          }
        }));
      }

      // Generate the ZIP file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link for the ZIP file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `bounty_${bountyId}_${bucketName}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      // Show success message
      alert(`Successfully downloaded ${downloadedCount} images as a ZIP file!`);
    } catch (error) {
      console.error('Error downloading images:', error);
      alert('Failed to download images. Please try again.');
    }
  };

  const handleSaveAllImages = async () => {
    try {
      // Create a new ZIP file
      const zip = new JSZip();
      const rootFolder = zip.folder(`bounty_${bountyId}_all_images`);

      // Get all images that have been assigned to buckets
      const allImagesWithBuckets = allImages
        // .filter(image => bucketAssignments[image.id]) // Only include images that have been assigned to buckets
        .map(image => ({
          ...image,
          bucketId: bucketAssignments[image.id] || "unrated",
          position: bucketPositions[image.id] || 0
        }));

      if (allImagesWithBuckets.length === 0) {
        alert('No images have been assigned to buckets yet.');
        return;
      }

      // Download all images in parallel with a concurrency limit
      const concurrencyLimit = 5; // Download 5 images at a time
      const chunks = [];
      for (let i = 0; i < allImagesWithBuckets.length; i += concurrencyLimit) {
        chunks.push(allImagesWithBuckets.slice(i, i + concurrencyLimit));
      }

      let downloadedCount = 0;
      for (const chunk of chunks) {
        await Promise.all(chunk.map(async (image) => {
          try {
            const bucket = buckets.find(b => b.id === image.bucketId);
            const bucketName = bucket ? bucket.name.replace(/\s+/g, '_').toLowerCase() : image.bucketId;
            
            // Create bucket folder if it doesn't exist
            const bucketFolder = rootFolder.folder(bucketName);

            // Get the image URL
            const imageUrl = image.url;

            if (!imageUrl) {
              return;
            }

            // Construct the full image URL with the Civitai CDN base URL
            const fullImageUrl = `https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${imageUrl}/original=true`;

            // Fetch the image
            const response = await fetch(fullImageUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();

            // Add the image to the ZIP file with position-based filename
            const ordinal = getOrdinal(image.position);
            bucketFolder.file(`${ordinal}_${image.type}_${image.id}_${image.name}`, blob);
            downloadedCount++;
          } catch (error) {
            console.error(`Failed to download image ${image.id}:`, error);
          }
        }));
      }

      // Generate the ZIP file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link for the ZIP file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `bounty_${bountyId}_all_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      // Show success message
      alert(`Successfully downloaded ${downloadedCount} images as a ZIP file!`);
    } catch (error) {
      console.error('Error downloading images:', error);
      alert('Failed to download images. Please try again.');
    }
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

  // Helper function to get ordinal numbers
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const handleSaveAppState = () => {
    const outputData = {
      version: '1.0',
      bountyId: bountyId,
      exportedAt: new Date().toISOString(),
      buckets: buckets,
      currentImageIndex: currentImageIndex,
      isPaused: isPaused,
      bucketAssignments: bucketAssignments,
      bucketPositions: bucketPositions,
      activeBucketTab: activeBucketTab,
      stats: getStats(),
      // Include entries data
      entries: entries,
      // Include all image data
      allImages: allImages
    };
    
    const dataStr = JSON.stringify(outputData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `bounty_${bountyId}_state.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add function to load a saved state
  const handleLoadAppState = (savedState) => {
    if (!savedState) return;
    
    setBountyId(savedState.bountyId || null);
    setBuckets(savedState.buckets || defaultBuckets);
    setCurrentImageIndex(savedState.currentImageIndex || 0);
    setIsPaused(savedState.isPaused || false);
    setBucketAssignments(savedState.bucketAssignments || {});
    setBucketPositions(savedState.bucketPositions || {});
    setActiveBucketTab(savedState.activeBucketTab || null);
    setEntries(savedState.entries || []);
    setAllImages(savedState.allImages || []);
    setFileUploaded(true);
  };

  return {
    entries,
    allImages,
    loading,
    error,
    currentImageIndex,
    bucketAssignments,
    bucketPositions,
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
    handleUrlLoad,
    handleAssignToBucket,
    handleMoveToBucket,
    handleMoveImagePosition,
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
    handleSaveBucketImages,
    handleSaveAllImages,
    handleAddBucket,
    handleEditBucket,
    handleRemoveBucket,
    handleResetBuckets,
    handleSaveAppState,
    handleLoadAppState,
  };
}; 
