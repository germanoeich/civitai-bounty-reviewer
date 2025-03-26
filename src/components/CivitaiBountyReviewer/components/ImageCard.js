import React from 'react';
import BucketSelector from './BucketSelector';

const ImageCard = ({ 
  image, 
  showControls = true, 
  buckets, 
  bucketAssignments, 
  onBucketSelect, 
  onSaveImage, 
  onImageClick,
  bountyId,
  isBucketFull 
}) => {
  const currentBucket = buckets.find(b => b.id === bucketAssignments[image.id]);
  
  const handleImageClick = (e) => {
    if (e.target.tagName === 'BUTTON' || 
        e.target.closest('button') || 
        e.target.closest('.bucket-selector')) {
      return;
    }
    
    onImageClick(image);
  };
  
  return (
    <div 
      key={image.id} 
      className="border rounded p-2 cursor-pointer" 
      onClick={handleImageClick}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="text-xs text-gray-500">
          Entry #{image.entryId}
        </div>
      </div>
      <div className="relative">
        <img 
          src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/width=200`} 
          alt={`Image #${image.id}`}
          className="w-full h-auto rounded" 
        />
        <div className="absolute top-1 right-1 flex gap-1">
          <button 
            className="bg-blue-600 text-white p-1 rounded-full text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSaveImage(
                image.url, 
                `bounty_${bountyId}_image_${image.id}.jpg`
              );
            }}
          >
            ⬇️
          </button>
        </div>
      </div>
      {showControls && (
        <div className="mt-2 flex justify-center">
          <BucketSelector 
            imageId={image.id}
            currentBucketId={bucketAssignments[image.id]}
            buckets={buckets}
            onBucketSelect={onBucketSelect}
            isBucketFull={isBucketFull}
            bucketAssignments={bucketAssignments}
          />
        </div>
      )}
    </div>
  );
};

export default ImageCard; 