import React, { memo } from 'react';

const BucketSelector = memo(({ buckets, onSelect, stats }) => {
  return (
    <div className="space-y-3">
      {buckets.map(bucket => {
        const count = stats?.bucketCounts?.[bucket.id] || 0;
        const isFull = bucket.limit !== null && count >= bucket.limit;
        
        return (
          <button
            key={bucket.id}
            onClick={() => onSelect(bucket.id)}
            disabled={isFull}
            className={`w-full py-3 px-4 rounded-md flex justify-between items-center 
                        transition-all duration-150 ${bucket.color} text-white 
                        ${isFull ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:brightness-110'}`}
          >
            <span className="font-medium">{bucket.name}</span>
            <span className="text-sm bg-black bg-opacity-20 py-1 px-2 rounded-full">
              {count} {bucket.limit ? `/ ${bucket.limit}` : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
});

BucketSelector.displayName = 'BucketSelector';

export default BucketSelector; 