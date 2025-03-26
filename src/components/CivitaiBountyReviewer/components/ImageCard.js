import React, { useState } from 'react';
import BucketSelector from './BucketSelector';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const ImageCard = ({ 
  image, 
  showControls = true, 
  buckets, 
  bucketAssignments, 
  onBucketSelect, 
  onSaveImage, 
  onImageClick,
  onMoveLeft,
  onMoveRight,
  onMoveToPosition,
  isFirst,
  isLast,
  position,
  bountyId,
  isBucketFull 
}) => {
  const [targetPosition, setTargetPosition] = useState('');
  const currentBucket = buckets.find(b => b.id === bucketAssignments[image.id]);
  
  const handleImageClick = (e) => {
    if (e.target.tagName === 'BUTTON' || 
        e.target.closest('button') || 
        e.target.closest('.bucket-selector') ||
        e.target.tagName === 'INPUT' ||
        e.target.tagName !== 'IMG') {
      return;
    }
    
    onImageClick(image);
  };

  const handleApplyPosition = (e) => {
    e.stopPropagation();
    const newPos = parseInt(targetPosition, 10);
    if (!isNaN(newPos) && newPos > 0 && onMoveToPosition) {
      onMoveToPosition(newPos);
      setTargetPosition('');
    }
  };
  console.log(image)
  return (
    <div 
      key={image.id} 
      className="border rounded p-2 flex flex-col h-full" 
      onClick={handleImageClick}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex gap-2">
          <a 
            href={`https://civitai.com/bounties/${bountyId}/entries/${image.entryId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Entry #{image.entryId}
          </a>
          <span className="text-xs text-gray-500">by</span>
          <a 
            href={`https://civitai.com/user/${image.entryData.user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {image.entryData.user.username}
          </a>
        </div>
      </div>
      <div className="relative flex-grow min-h-[200px]">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
          <img 
            src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/width=200`} 
            alt={`Image #${image.id}`}
            className="max-w-full max-h-[200px] w-auto h-auto object-contain rounded cursor-pointer" 
          />
        </div>
      </div>
      {showControls && (
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <BucketSelector 
              imageId={image.id}
              currentBucketId={bucketAssignments[image.id]}
              buckets={buckets}
              onBucketSelect={onBucketSelect}
              isBucketFull={isBucketFull}
              bucketAssignments={bucketAssignments}
            />
          </div>
          {onMoveLeft && onMoveRight && (
            <div className="flex justify-between items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveLeft();
                }}
                disabled={isFirst}
                className={`p-1 rounded-full ${isFirst ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                title="Move left"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">pos</span>
                <input
                  type="text"
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  placeholder={`${position}`}
                  className="w-12 px-1 py-0.5 border rounded text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={handleApplyPosition}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded text-sm"
                >
                  set
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveRight();
                }}
                disabled={isLast}
                className={`p-1 rounded-full ${isLast ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                title="Move right"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageCard; 