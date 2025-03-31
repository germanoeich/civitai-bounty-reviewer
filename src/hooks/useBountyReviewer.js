const getStats = () => {
  const result = {
    totalImages: allImages.length,
    totalReviewed: Object.keys(bucketAssignments).length,
    percentComplete: 0,
    remaining: 0
  };
  
  // Calculate percentage and remaining
  if (result.totalImages > 0) {
    result.percentComplete = Math.round((result.totalReviewed / result.totalImages) * 100);
    result.remaining = result.totalImages - result.totalReviewed;
  }
  
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
  
  return result;
}; 