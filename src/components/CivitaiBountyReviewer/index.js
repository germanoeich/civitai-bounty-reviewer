import React, { useState, useEffect } from 'react';
import { useBountyReviewer } from './hooks/useBountyReviewer';
import ReviewView from './components/ReviewView';
import ConfigView from './components/ConfigView';
import PausedView from './components/PausedView';
import AppStateLoadDialog from './components/AppStateLoadDialog';
import { defaultBuckets } from './utils/constants';

const CivitaiBountyReviewer = () => {
  // State for the app state loading dialog
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [pendingAppState, setPendingAppState] = useState(null);
  
  const {
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
    handleFileUpload: originalHandleFileUpload,
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
  } = useBountyReviewer();

  // Wrap the file upload handler to check for app state files
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Check if this is a saved app state
        if (jsonData.version && jsonData.appName === 'Civitai Bounty Reviewer') {
          // Show confirmation dialog before loading
          setPendingAppState(jsonData);
          setShowLoadDialog(true);
        } else {
          // Let the original handler process it
          originalHandleFileUpload(event);
        }
      } catch (error) {
        // If there's an error parsing, let the original handler handle it
        originalHandleFileUpload(event);
      }
    };
    
    reader.readAsText(file);
  };
  
  // Handlers for the app state loading dialog
  const handleConfirmLoad = () => {
    if (pendingAppState) {
      handleLoadAppState(pendingAppState);
      setPendingAppState(null);
      setShowLoadDialog(false);
    }
  };
  
  const handleCancelLoad = () => {
    setPendingAppState(null);
    setShowLoadDialog(false);
  };

  // Error handling component
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

  // Config mode view
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

  // Paused or complete review view
  if (isPaused) {
    return (
      <>
        {showLoadDialog && pendingAppState && (
          <AppStateLoadDialog 
            onClose={handleCancelLoad}
            onConfirm={handleConfirmLoad}
            stateInfo={pendingAppState}
          />
        )}
        <PausedView
          isPaused={isPaused}
          stats={stats}
          buckets={buckets}
          allImages={allImages}
          bucketAssignments={bucketAssignments}
          bucketPositions={bucketPositions}
          bountyId={bountyId}
          getImagesInBucket={getImagesInBucket}
          handleSaveBucketImages={handleSaveBucketImages}
          handleSaveAllImages={handleSaveAllImages}
          handleSaveAppState={handleSaveAppState}
          resumeReview={resumeReview}
          finishReview={finishReview}
          resetReview={resetReview}
          handleMoveToBucket={handleMoveToBucket}
          handleMoveImagePosition={handleMoveImagePosition}
          handleSaveImage={handleSaveImage}
          setConfigMode={setConfigMode}
        />
      </>
    );
  }

  console.log(getCurrentImage())

  // Active review view
  return (
    <>
      {showLoadDialog && pendingAppState && (
        <AppStateLoadDialog 
          onClose={handleCancelLoad}
          onConfirm={handleConfirmLoad}
          stateInfo={pendingAppState}
        />
      )}
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
        handleSaveAppState={handleSaveAppState}
      />
    </>
  );
};

export default CivitaiBountyReviewer;