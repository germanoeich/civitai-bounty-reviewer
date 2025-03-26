import React, { useState, useEffect } from 'react';
import { useBountyReviewer } from './hooks/useBountyReviewer';
import ReviewView from './components/ReviewView';
import ConfigView from './components/ConfigView';
import PausedView from './components/PausedView';
import { defaultBuckets } from './utils/constants';

const CivitaiBountyReviewer = () => {
  const {
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
  } = useBountyReviewer();

  if (error && allImages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Civitai Bounty Reviewer</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={resetReview}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (configMode) {
    return (
      <ConfigView
        buckets={buckets}
        setConfigMode={setConfigMode}
        defaultBuckets={defaultBuckets}
        onAddBucket={handleAddBucket}
        onEditBucket={handleEditBucket}
        onRemoveBucket={handleRemoveBucket}
        onResetBuckets={handleResetBuckets}
      />
    );
  }

  if (isPaused || isComplete) {
    return (
      <PausedView
        isComplete={isComplete}
        isPaused={isPaused}
        stats={stats}
        buckets={buckets}
        allImages={allImages}
        bucketAssignments={bucketAssignments}
        bountyId={bountyId}
        getImagesInBucket={getImagesInBucket}
        handleSaveBucketImages={handleSaveBucketImages}
        handleSaveRatingsJson={handleSaveRatingsJson}
        resumeReview={resumeReview}
        finishReview={finishReview}
        resetReview={resetReview}
        handleMoveToBucket={handleMoveToBucket}
        handleSaveImage={handleSaveImage}
        setConfigMode={setConfigMode}
      />
    );
  }

  return (
    <ReviewView
      fileUploaded={fileUploaded}
      loading={loading}
      allImages={allImages}
      currentImageIndex={currentImageIndex}
      currentImage={getCurrentImage()}
      buckets={buckets}
      stats={stats}
      bucketAssignments={bucketAssignments}
      bountyId={bountyId}
      handleFileUpload={handleFileUpload}
      handleAssignToBucket={handleAssignToBucket}
      handlePrevious={handlePrevious}
      handleSkip={handleSkip}
      togglePause={togglePause}
      finishReview={finishReview}
      resetReview={resetReview}
      setConfigMode={setConfigMode}
      handleSaveImage={handleSaveImage}
    />
  );
};

export default CivitaiBountyReviewer; 