import React, { useState, useEffect } from 'react';

const BucketSelector = ({ imageId, currentBucketId, buckets, onBucketSelect, isBucketFull, bucketAssignments }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Close selector when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.bucket-selector')) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  const currentBucket = buckets.find(b => b.id === currentBucketId);
  
  const toggleSelector = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };
  
  const handleBucketSelect = (e, bucketId) => {
    e.stopPropagation();
    onBucketSelect(imageId, bucketId);
    setIsOpen(false);
  };
  
  const getBucketCount = (bucketId) => {
    return Object.values(bucketAssignments).filter(id => id === bucketId).length;
  };

  const isOverLimit = (bucket) => {
    const count = getBucketCount(bucket.id);
    return count > bucket.limit;
  };
  
  return (
    <div className="relative bucket-selector" onClick={e => e.stopPropagation()}>
      {/* Clickable pill */}
      <button
        onClick={toggleSelector}
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
          currentBucket 
            ? `${currentBucket.color} text-white` 
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        {currentBucket ? currentBucket.name : 'Categorize'}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Bucket options popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-10 w-48 rounded shadow-lg bg-white border overflow-hidden">
          <div className="py-1 max-h-60 overflow-y-auto">
            {buckets.map(bucket => {
              const count = getBucketCount(bucket.id);
              const isOver = count > bucket.limit && bucket.limit > 0;
              
              return (
                <div key={bucket.id}>
                  <button
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                      bucket.id === currentBucketId 
                        ? 'bg-gray-100' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={(e) => handleBucketSelect(e, bucket.id)}
                  >
                    <span className={`w-3 h-3 rounded-full ${bucket.color}`}></span>
                    <span className="flex-1 truncate">{bucket.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {count}/{bucket.limit}
                      </span>
                      {isOver && (
                        <span className="text-xs text-red-500 font-medium">
                          Over limit
                        </span>
                      )}
                      {count === bucket.limit && bucket.limit > 0 && (
                        <span className="text-xs text-yellow-500 font-medium">
                          Full
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BucketSelector; 