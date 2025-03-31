import React, { useState } from 'react';
import { useBountyReviewer } from '../../contexts/BountyReviewerContext';
import ImageCard from '../shared/ImageCard';
import { Play, Download, Save, Settings, RefreshCw, PlusCircle, MinusCircle } from 'lucide-react';

const PausedView = () => {
  const {
    buckets,
    bountyId,
    allImages,
    bucketAssignments,
    getImagesInBucket,
    getStats,
    handleSaveBucketImages,
    handleSaveAllImages,
    handleSaveImage,
    handleSaveAppState,
    resumeReview,
    resetReview,
    setConfigMode,
    handleMoveToBucket,
    handleMoveImagePosition
  } = useBountyReviewer();

  const stats = getStats();
  const [activeBucketId, setActiveBucketId] = useState(buckets[0]?.id || null);

  const handleBucketTabClick = (bucketId) => {
    setActiveBucketId(bucketId);
  };

  const handleMovePosition = (imageId, currentPosition, direction) => {
    const newPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1;
    handleMoveImagePosition(imageId, newPosition);
  };

  const handleMoveToOtherBucket = (imageId, currentBucketId) => {
    // Find the next bucket in the list or the first one if at the end
    const currentIndex = buckets.findIndex(b => b.id === currentBucketId);
    const nextIndex = (currentIndex + 1) % buckets.length;
    handleMoveToBucket(imageId, buckets[nextIndex].id);
  };

  const activeBucketImages = activeBucketId ? getImagesInBucket(activeBucketId) : [];
  const activeBucket = buckets.find(b => b.id === activeBucketId);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-darkContainerBg p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold dark:text-white">
            Civitai Bounty Review {bountyId ? `- Bounty #${bountyId}` : ''}
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setConfigMode(true)}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Configuration"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={resetReview}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reset
            </button>
            <button
              onClick={handleSaveAppState}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-1 inline-block" /> Save Progress
            </button>
            <button
              onClick={resumeReview}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <Play className="w-4 h-4 mr-1" /> Resume Review
            </button>
          </div>
        </div>

        {/* Progress summary */}
        <div className="bg-gray-50 dark:bg-darkElementBg p-4 rounded-md mb-4">
          <h2 className="text-lg font-medium mb-2 dark:text-white">Review Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Total Images:</span> {stats.totalImages}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Images Reviewed:</span> {stats.totalReviewed} ({stats.percentComplete}%)
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Images Remaining:</span> {stats.remaining}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Bucket Counts:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                {buckets.map(bucket => (
                  <p key={bucket.id} className="text-gray-600 dark:text-gray-300 text-sm">
                    <span className={`inline-block w-3 h-3 ${bucket.color} rounded-full mr-2`}></span>
                    {bucket.name}: {stats.bucketCounts[bucket.id] || 0}
                    {bucket.limit ? ` / ${bucket.limit}` : ''}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleSaveAllImages}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Ratings JSON
          </button>
          <button
            onClick={() => activeBucketId && handleSaveBucketImages(activeBucketId)}
            disabled={!activeBucketId}
            className={`flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 ${
              !activeBucketId ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            Download {activeBucket?.name || 'Bucket'} Images
          </button>
          <button
            onClick={handleSaveAppState}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Review Session
          </button>
        </div>
      </div>

      {/* Bucket tabs */}
      <div className="flex overflow-x-auto mb-4 bg-white dark:bg-darkContainerBg rounded-lg shadow-md p-2">
        {buckets.map(bucket => (
          <button
            key={bucket.id}
            onClick={() => handleBucketTabClick(bucket.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap mr-2 last:mr-0 
                        ${activeBucketId === bucket.id
                          ? `${bucket.color} text-white`
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
          >
            {bucket.name} ({stats.bucketCounts[bucket.id] || 0})
          </button>
        ))}
      </div>

      {/* Image grid for selected bucket */}
      {activeBucketImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBucketImages.map((image, index) => (
            <div key={image.id} className="relative">
              <div className="absolute -top-3 -left-3 bg-white dark:bg-darkContainerBg rounded-full shadow-md z-10 flex">
                <button
                  onClick={() => handleMovePosition(image.id, index + 1, 'up')}
                  disabled={index === 0}
                  className={`p-1 ${
                    index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 hover:text-blue-800'
                  }`}
                  title="Move up"
                >
                  <MinusCircle className="w-6 h-6" />
                </button>
                <div className="flex items-center justify-center px-2 font-medium">
                  {index + 1}
                </div>
                <button
                  onClick={() => handleMovePosition(image.id, index + 1, 'down')}
                  disabled={index === activeBucketImages.length - 1}
                  className={`p-1 ${
                    index === activeBucketImages.length - 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 dark:text-blue-400 hover:text-blue-800'
                  }`}
                  title="Move down"
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="absolute -top-3 -right-3 bg-white dark:bg-darkContainerBg rounded-full shadow-md z-10">
                <button
                  onClick={() => handleMoveToOtherBucket(image.id, activeBucketId)}
                  className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-800"
                  title={`Move to another bucket`}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <ImageCard image={image} onSaveImage={handleSaveImage} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-darkContainerBg p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            No images in {activeBucket?.name || 'this bucket'}.
          </p>
        </div>
      )}
    </div>
  );
};

export default PausedView; 