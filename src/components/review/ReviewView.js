import React, { useState, useMemo, useCallback, memo } from 'react';
import { useBountyReviewer } from '../../contexts/BountyReviewerContext';
import BucketSelector from './BucketSelector';
import ImageCard from '../shared/ImageCard';
import { Upload, Link, Settings } from 'lucide-react';

// Memoize the file upload form to prevent re-renders
const FileUploadForm = memo(({ handleFileInputChange, handleUrlSubmit, handleUrlInputChange, urlInput, loading, handleUrlLoad }) => (
  <div className="max-w-4xl mx-auto bg-white dark:bg-darkContainerBg p-8 rounded-lg shadow-md">
    <h1 className="text-2xl font-bold mb-4 dark:text-white">Civitai Bounty Reviewer</h1>
    <p className="mb-6 dark:text-gray-300">
      Upload a bounty JSON file to start reviewing images, or enter a URL to a JSON file.
    </p>
    
    <div className="space-y-8">
      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
          <span className="text-lg mb-2 dark:text-gray-300">Upload JSON File</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop or click to browse
          </span>
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={loading}
          />
          <button
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => document.querySelector('input[type="file"]').click()}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Select File'}
          </button>
        </label>
      </div>

      {/* URL Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-lg font-medium mb-4 dark:text-white">Or load from URL</h2>
        <form onSubmit={handleUrlSubmit} className="flex items-center">
          <div className="relative flex-grow mr-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                         dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/bounty.json"
              value={urlInput}
              onChange={handleUrlInputChange}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading || !urlInput}
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </form>

        {/* Sample file button */}
        <div className="mt-4">
          <button
            onClick={() => handleUrlLoad(`${process.env.PUBLIC_URL}/bounty_7091_entries.json`)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            disabled={loading}
          >
            Load sample file (bounty_7091_entries.json)
          </button>
        </div>
      </div>
    </div>
  </div>
));

FileUploadForm.displayName = 'FileUploadForm';

// Memoize the header component to prevent re-renders
const ReviewHeader = memo(({ 
  bountyId, 
  stats, 
  onSettingsClick, 
  onResetClick, 
  onSaveProgressClick, 
  onPauseClick, 
  onFinishClick, 
  currentImageIndex, 
  totalImages 
}) => (
  <div className="bg-white dark:bg-darkContainerBg p-6 rounded-lg shadow-md mb-6">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold dark:text-white">
        Civitai Bounty Review {bountyId ? `- Bounty #${bountyId}` : ''}
      </h1>
      <div className="flex space-x-3">
        <button 
          onClick={onSettingsClick}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          title="Configuration"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={onResetClick}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reset
        </button>
        <button
          onClick={onSaveProgressClick}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Progress
        </button>
        {currentImageIndex < totalImages - 1 ? (
          <button
            onClick={onPauseClick}
            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={onFinishClick}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Finish
          </button>
        )}
      </div>
    </div>
    
    {/* Progress bar */}
    <div className="w-full bg-gray-200 dark:bg-darkElementBg rounded-full h-2.5 mb-2">
      <div 
        className="bg-blue-600 h-2.5 rounded-full" 
        style={{ width: `${stats.percentComplete}%` }}
      ></div>
    </div>
    
    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
      <div>
        Progress: {stats.totalReviewed} / {stats.totalImages} images
        ({stats.percentComplete}%)
      </div>
      <div>
        Remaining: {stats.remaining} images
      </div>
    </div>
  </div>
));

ReviewHeader.displayName = 'ReviewHeader';

// Main ReviewView component
const ReviewView = ({ handleFileUpload }) => {
  const [urlInput, setUrlInput] = useState('');
  const {
    fileUploaded,
    loading,
    allImages,
    currentImageIndex,
    buckets,
    bountyId,
    getCurrentImage,
    getStats,
    handleUrlLoad,
    handleAssignToBucket,
    handlePrevious,
    handleSkip,
    togglePause,
    finishReview,
    resetReview,
    setConfigMode,
    handleSaveImage,
    handleSaveAppState
  } = useBountyReviewer();

  // Memoize values to prevent unnecessary recalculations
  const currentImage = useMemo(() => {
    return allImages[currentImageIndex] || null;
  }, [allImages, currentImageIndex]);

  const stats = useMemo(() => {
    // Only calculate stats if we have images
    if (!allImages || allImages.length === 0) {
      return {
        totalImages: 0,
        totalReviewed: 0,
        percentComplete: 0,
        remaining: 0
      };
    }
    return getStats();
  }, [getStats, allImages, currentImageIndex]);

  // Memoize handlers to prevent rerendering children components
  const handleFileInputChange = useCallback((e) => {
    handleFileUpload(e);
  }, [handleFileUpload]);

  const handleUrlSubmit = useCallback((e) => {
    e.preventDefault();
    if (urlInput) {
      handleUrlLoad(urlInput);
      setUrlInput('');
    }
  }, [urlInput, handleUrlLoad]);

  const handleUrlInputChange = useCallback((e) => {
    setUrlInput(e.target.value);
  }, []);

  const handleBucketSelect = useCallback((bucketId) => {
    if (!currentImage) return;
    
    const success = handleAssignToBucket(currentImage.id, bucketId);
    if (success && currentImageIndex < allImages.length - 1) {
      // Use a small delay to prevent flickering
      setTimeout(() => {
        handleSkip();
      }, 50);
    }
  }, [currentImage, handleAssignToBucket, currentImageIndex, allImages.length, handleSkip]);

  // Memoized handlers for header buttons
  const handleSettingsClick = useCallback(() => setConfigMode(true), [setConfigMode]);
  const handleSaveProgressClick = useCallback(() => handleSaveAppState(), [handleSaveAppState]);
  const handlePauseClick = useCallback(() => togglePause(), [togglePause]);
  const handleFinishClick = useCallback(() => finishReview(), [finishReview]);
  const handleResetClick = useCallback(() => resetReview(), [resetReview]);

  // Render file upload/URL input if no file uploaded yet
  if (!fileUploaded) {
    return (
      <FileUploadForm
        handleFileInputChange={handleFileInputChange}
        handleUrlSubmit={handleUrlSubmit}
        handleUrlInputChange={handleUrlInputChange}
        urlInput={urlInput}
        loading={loading}
        handleUrlLoad={handleUrlLoad}
      />
    );
  }

  // Main review interface
  return (
    <div className="max-w-7xl mx-auto">
      <ReviewHeader
        bountyId={bountyId}
        stats={stats}
        onSettingsClick={handleSettingsClick}
        onResetClick={handleResetClick}
        onSaveProgressClick={handleSaveProgressClick}
        onPauseClick={handlePauseClick}
        onFinishClick={handleFinishClick}
        currentImageIndex={currentImageIndex}
        totalImages={allImages.length}
      />

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image card */}
        <div className="md:w-2/3">
          {currentImage ? (
            <ImageCard 
              key={`image-card-${currentImage.id}`}
              image={currentImage} 
              onSaveImage={handleSaveImage}
            />
          ) : (
            <div className="bg-white dark:bg-darkContainerBg p-6 rounded-lg shadow-md text-center">
              <p className="text-lg dark:text-white">No image available</p>
            </div>
          )}
        </div>

        {/* Bucket selector and navigation */}
        <div className="md:w-1/3 space-y-6">
          <div className="bg-white dark:bg-darkContainerBg p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Assign to Bucket</h2>
            <BucketSelector 
              buckets={buckets}
              onSelect={handleBucketSelect}
              stats={stats}
            />
          </div>

          <div className="bg-white dark:bg-darkContainerBg p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Navigation</h2>
            <div className="flex space-x-3">
              <button
                onClick={handlePrevious}
                disabled={currentImageIndex === 0}
                className={`flex-1 px-4 py-2 bg-gray-200 dark:bg-darkElementBg text-gray-800 dark:text-white rounded-md 
                            ${currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                Previous
              </button>
              <button
                onClick={handleSkip}
                disabled={currentImageIndex >= allImages.length - 1}
                className={`flex-1 px-4 py-2 bg-gray-200 dark:bg-darkElementBg text-gray-800 dark:text-white rounded-md
                            ${currentImageIndex >= allImages.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                Skip
              </button>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Image {currentImageIndex + 1} of {allImages.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewView; 