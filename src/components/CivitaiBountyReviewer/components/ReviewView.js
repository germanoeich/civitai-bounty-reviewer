import React, { useState, useRef } from 'react';
import BucketSelector from './BucketSelector';
import FullscreenViewer from './FullscreenViewer';
import ExtractorScript from '../../ExtractorScript';


const ReviewView = ({
  fileUploaded,
  loading,
  allImages,
  currentImageIndex,
  currentImage,
  buckets,
  stats,
  bucketAssignments,
  bountyId,
  handleUrlLoad,
  handleFileUpload,
  handleAssignToBucket,
  handlePrevious,
  handleSkip,
  togglePause,
  finishReview,
  resetReview,
  setConfigMode,
  handleSaveImage,
  handleSaveAppState, // Add new function prop
}) => {
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const imageContainerRef = useRef(null);

  const isBucketFull = (bucketId) => {
    const bucket = buckets.find(b => b.id === bucketId);
    if (!bucket || bucket.limit === null) return false;

    const imagesInBucket = allImages.filter(img => bucketAssignments[img.id] === bucketId).length;
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
          onBucketSelect={handleAssignToBucket}
          onClose={(nextImage) => setFullscreenImage(nextImage || null)}
          isBucketFull={isBucketFull}
        />
      )}

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-50 p-8 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold">Civitai Bounty Reviewer</h1>

          {!fileUploaded ? (
            <div className="flex flex-col space-y-2">
              <label className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-center cursor-pointer">
                Upload JSON File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => { handleUrlLoad('/bounty_7091_entries.json') }}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Use sample (NSFW)
                </button>
              </div>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setConfigMode(true)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Configure Buckets
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2 items-center">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                Bounty #{bountyId} • {allImages.length} images
              </div>
              {/* Add Save button */}
              <button
                onClick={handleSaveAppState}
                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Save Review
              </button>
              <button
                onClick={() => setConfigMode(true)}
                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Buckets
              </button>
              <button
                onClick={togglePause}
                className="bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 text-sm"
              >
                Pause
              </button>
              <button
                onClick={resetReview}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {!fileUploaded && !loading ? (
          <div className="mt-8 bg-blue-50 dark:bg-gray-300 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-2">How to use this app:</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>First, configure your sorting buckets by clicking on "Configure Buckets"</li>
              <li>Run the extractor script in your browser console on the Civitai website</li>
              <li>Save the generated JSON file to your computer</li>
              <li>Upload the JSON file using the button above</li>
              <li>Assign each image to a bucket using the bucket buttons</li>
              <li>You can pause your review at any time to see current results</li>
              <li>When finished, download your sorted images and JSON data</li>
            </ol>
            <div className="mt-4 p-4">
              <ExtractorScript />
            </div>
          </div>
        ) : (
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="text-gray-600">
              {allImages.length > 0 ? `Image ${currentImageIndex + 1} of ${allImages.length}` : 'No images loaded'}
            </div>

            <div className="flex flex-wrap gap-2">
              {buckets.map(bucket => {
                const count = stats.buckets[bucket.id] || 0;
                const limit = bucket.limit || '∞';
                return (
                  <div key={bucket.id} className="text-sm">
                    <span className={`${bucket.color.replace('bg-', 'text-')} font-semibold`}>
                      {bucket.name}: {count}/{limit === '∞' ? '∞' : limit}
                    </span>
                  </div>
                );
              })}
              <div className="text-gray-600 text-sm">
                <span className="font-semibold">Pending: {stats.pending}</span>
              </div>
            </div>
          </div>
        )}

        {loading && allImages.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Loading images...</div>
          </div>
        )}

        {allImages.length === 0 && !loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">No images found</div>
          </div>
        )}

        {currentImage && (
          <div className="flex flex-col">
            {/* Progress bar */}
            <div className="h-2 w-full bg-gray-200 rounded-full mb-4">
              <div
                className="h-2 bg-blue-600 rounded-full"
                style={{ width: `${(currentImageIndex / (allImages.length - 1)) * 100}%` }}
              ></div>
            </div>

            {/* Image and entry header */}
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">
                    Image #{currentImage.id}
                    {' '}
                    <a href={`https://civitai.com/bounties/${bountyId}/entries/${currentImage.entryId}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      (Entry #{currentImage.entryId})
                    </a>
                  </h2>
                  <div className="text-gray-600">
                    By:{' '}
                    <a href={`https://civitai.com/user/${currentImage.entryData.user.username}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {currentImage.entryData.user.username}
                    </a>
                    {' '}• {new Date(currentImage.entryData.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${currentImage.nsfwLevel > 2 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      NSFW Level: {currentImage.nsfwLevel}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${currentImage.type === 'video' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {currentImage.type}
                    </span>
                    {currentImage.metadata.audio && 
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800'`}>
                      audio
                    </span>
}
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                      {currentImage.width}×{currentImage.height}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BucketSelector
                    imageId={currentImage.id}
                    currentBucketId={bucketAssignments[currentImage.id]}
                    buckets={buckets}
                    onBucketSelect={handleAssignToBucket}
                    isBucketFull={isBucketFull}
                    bucketAssignments={bucketAssignments}
                  />
                </div>
              </div>
            </div>

            {/* Fixed height container for the image */}
            <div className="flex justify-center items-center" style={{ minHeight: "400px" }}>
              <div
                ref={imageContainerRef}
                className="w-full h-full flex items-center justify-center"
                style={{minHeight: "660px"}}
                onClick={() => setFullscreenImage(currentImage)}
              >
                {currentImage.type === "video" &&
                  <video
                  autoPlay
                  loop
                  muted
                  disablepictureinpicture
                  preload="none"
                  poster={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${currentImage.url}/anim=false,transcode=true,original=true/${currentImage.url}.jpeg`}
                  src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${currentImage.url}/transcode=true,original=true,quality=90/${currentImage.name.split('.')[0]}.webm`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '660px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  key={currentImage.url}
                    >
                    <source src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${currentImage.url}/transcode=true,original=true,quality=90/${currentImage.name.split('.')[0]}.webm`}
                      type="video/webm" />
                    <source src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${currentImage.url}/transcode=true,original=true,quality=90/${currentImage.name.split('.')[0]}.mp4`}
                      type="video/mp4" />

                  </video>
                }
                {currentImage.type === "image" && <img
                  src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${currentImage.url}/width=450/${currentImage.name}`}
                  alt={`Image ${currentImage.id}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '660px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  key={currentImage.url}
                  className="rounded border cursor-pointer"
                />}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="p-2 rounded bg-gray-50 dark:bg-gray-50 flex justify-between">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={handlePrevious}
                disabled={currentImageIndex === 0}
              >
                Previous
              </button>

              <div className="flex gap-2">
                <button
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  onClick={togglePause}
                >
                  Pause Review
                </button>

                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={finishReview}
                >
                  Finish
                </button>
              </div>

              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={handleSkip}
              >
                Skip
              </button>
            </div>

            {/* Bucket assignment buttons */}
            <div className="sticky bottom-0 bg-white pt-2 pb-2 border-t">
              <div className="flex flex-wrap gap-2 justify-center">
                {buckets.map((bucket) => {
                  const isCurrentlyAssigned = bucketAssignments[currentImage.id] === bucket.id;
                  const isOver = isBucketFull(bucket.id) && !isCurrentlyAssigned;

                  return (
                    <button
                      key={bucket.id}
                      className={`${bucket.color} text-white px-4 py-2 rounded 
                        ${isOver ? 'opacity-75' : `hover:${bucket.color.replace('bg-', 'bg-')}-700`}
                        ${isCurrentlyAssigned ? 'ring-2 ring-offset-2 ring-white' : ''}`}
                      onClick={() => handleAssignToBucket(currentImage.id, bucket.id)}
                      title={isOver ? `${bucket.name} bucket is over limit (${stats.buckets[bucket.id]}/${bucket.limit})` : bucket.name}
                    >
                      {bucket.name}
                      {bucket.limit && (
                        <span className="ml-1 text-xs">
                          ({(stats.buckets[bucket.id] || 0)}/{bucket.limit})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewView; 