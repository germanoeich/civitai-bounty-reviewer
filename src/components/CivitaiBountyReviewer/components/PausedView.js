import React, { useState } from 'react';
import ImageCard from './ImageCard';
import FullscreenViewer from './FullscreenViewer';

const PausedView = ({
  isComplete,
  isPaused,
  stats,
  buckets,
  allImages,
  bucketAssignments,
  bountyId,
  getImagesInBucket,
  handleSaveBucketImages,
  handleSaveRatingsJson,
  resumeReview,
  finishReview,
  resetReview,
  handleMoveToBucket,
  handleSaveImage,
  setConfigMode,
}) => {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const isBucketFull = (bucketId) => {
    const bucket = buckets.find(b => b.id === bucketId);
    if (!bucket || bucket.limit === null) return false;
    
    const imagesInBucket = getImagesInBucket(bucketId).length;
    return imagesInBucket >= bucket.limit;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {fullscreenImage && (
        <FullscreenViewer
          fullscreenImage={fullscreenImage}
          allImages={allImages}
          buckets={buckets}
          bucketAssignments={bucketAssignments}
          onBucketSelect={handleMoveToBucket}
          onClose={(nextImage) => setFullscreenImage(nextImage || null)}
          isBucketFull={isBucketFull}
        />
      )}
      
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">
          {isComplete ? "Review Complete!" : "Review Paused"}
        </h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {buckets.map(bucket => {
              const count = stats.buckets[bucket.id] || 0;
              return (
                <div 
                  key={bucket.id} 
                  className={`p-4 rounded flex-1 ${bucket.color} bg-opacity-20 border border-opacity-30 ${bucket.color.replace('bg-', 'border-')}`}
                >
                  <div className={`${bucket.color.replace('bg-', 'text-')} font-bold text-xl`}>{count}</div>
                  <div className={`${bucket.color.replace('bg-', 'text-')} text-opacity-80`}>{bucket.name}</div>
                </div>
              );
            })}
            <div className="bg-gray-100 p-4 rounded flex-1">
              <div className="text-gray-800 font-bold text-xl">{stats.pending}</div>
              <div className="text-gray-600">Unrated</div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {!isComplete && (
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={resumeReview}
              >
                Resume Review
              </button>
            )}
            
            {isPaused && (
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={finishReview}
              >
                Complete Review
              </button>
            )}
            
            {isComplete && (
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={resumeReview}
              >
                Continue Review
              </button>
            )}
            
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={handleSaveRatingsJson}
            >
              Save Complete JSON
            </button>
            
            <button 
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              onClick={resetReview}
            >
              Start Over
            </button>

            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setConfigMode(true)}
            >
              Configure Buckets
            </button>
          </div>
        </div>
        
        {/* Display all buckets as sections rather than tabs */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Images by Bucket</h2>
          
          {buckets.map(bucket => {
            const imagesInBucket = getImagesInBucket(bucket.id);
            
            return (
              <div key={bucket.id} className="mb-8">
                <div className={`flex items-center justify-between gap-2 mb-2 p-2 rounded-t-lg ${bucket.color} bg-opacity-10`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${bucket.color}`}></div>
                    <h3 className={`text-lg font-semibold ${bucket.color.replace('bg-', 'text-')}`}>
                      {bucket.name} ({imagesInBucket.length})
                      {bucket.limit && ` - Limit: ${bucket.limit}`}
                      {imagesInBucket.length > bucket.limit && (
                        <span className="ml-2 text-yellow-600 text-sm bg-yellow-200 px-2 py-0.5 rounded">
                          Over limit
                        </span>
                      )}
                    </h3>
                  </div>
                  {imagesInBucket.length > 0 && (
                    <button 
                      className={`${bucket.color} text-white px-3 py-1 rounded text-sm hover:${bucket.color.replace('bg-', 'bg-')}-700`}
                      onClick={() => handleSaveBucketImages(bucket.id)}
                    >
                      Download Images
                    </button>
                  )}
                </div>
                
                {imagesInBucket.length === 0 ? (
                  <div className="bg-gray-50 p-4 rounded-b-lg border border-t-0 text-gray-500">
                    No images in this bucket.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-b-lg border border-t-0">
                    {imagesInBucket.map((image) => (
                      <ImageCard 
                        key={image.id} 
                        image={image} 
                        showControls={true}
                        buckets={buckets}
                        bucketAssignments={bucketAssignments}
                        onBucketSelect={handleMoveToBucket}
                        onSaveImage={handleSaveImage}
                        onImageClick={() => setFullscreenImage(image)}
                        bountyId={bountyId}
                        isBucketFull={isBucketFull}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Display unrated images if there are any */}
          {stats.pending > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2 p-2 rounded-t-lg bg-gray-200">
                <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Unrated Images ({stats.pending})
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-b-lg border border-t-0">
                {allImages
                  .filter(image => !bucketAssignments[image.id])
                  .map((image) => (
                    <ImageCard 
                      key={image.id} 
                      image={image} 
                      showControls={true}
                      buckets={buckets}
                      bucketAssignments={bucketAssignments}
                      onBucketSelect={handleMoveToBucket}
                      onSaveImage={handleSaveImage}
                      onImageClick={() => setFullscreenImage(image)}
                      bountyId={bountyId}
                      isBucketFull={isBucketFull}
                    />
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PausedView; 