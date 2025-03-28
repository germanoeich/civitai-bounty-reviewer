import React, { useEffect, useState, useRef } from 'react';
import { XIcon, ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import BucketSelector from './BucketSelector';

const FullscreenViewer = ({
  fullscreenImage,
  allImages,
  buckets,
  bucketAssignments,
  onBucketSelect,
  onClose,
  isBucketFull
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Find the index of the current fullscreen image
  const currentIndex = fullscreenImage ? allImages.findIndex(img => img.id === fullscreenImage.id) : -1;

  // Get next and previous images
  const hasNext = currentIndex < allImages.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext && fullscreenImage) {
      const nextImage = allImages[currentIndex + 1];
      onClose(nextImage);
    }
  };

  const handlePrev = () => {
    if (hasPrev && fullscreenImage) {
      const prevImage = allImages[currentIndex - 1];
      onClose(prevImage);
    }
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  const handleImageLoad = (e) => {
    if (!imageRef.current) return;

    const img = e.target;
    const containerRect = imageRef.current.getBoundingClientRect();
    const scaleX = img.naturalWidth / containerRect.width;
    const scaleY = img.naturalHeight / containerRect.height;
    setScale(Math.max(scaleX, scaleY));
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!fullscreenImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'z' || e.key === 'Z') setIsZoomed(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage, hasNext, hasPrev, isZoomed]);

  if (!fullscreenImage) return null;

  // Get current bucket if any
  const currentBucket = buckets.find(b => b.id === bucketAssignments[fullscreenImage.id]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col nightwind-prevent nightwind-prevent-block"
      onClick={(e) => {
        onClose();
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black bg-opacity-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onClose(null)}
            className="text-white hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-white text-lg font-semibold">
            Image #{fullscreenImage.id} (Entry #{fullscreenImage.entryId})
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <BucketSelector
            imageId={fullscreenImage.id}
            currentBucketId={bucketAssignments[fullscreenImage.id]}
            buckets={buckets}
            onBucketSelect={onBucketSelect}
            isBucketFull={isBucketFull}
            bucketAssignments={bucketAssignments}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="relative w-full h-full flex items-center justify-center"
          onMouseMove={handleMouseMove}
        >
          <div
            ref={imageRef}
            className="transition-transform duration-200"
            style={{
              transform: isZoomed ? `scale(${scale})` : 'scale(1)',
              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
            }}
          >
            {fullscreenImage.type === 'image' &&
              <img
                src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${fullscreenImage.url}/original=true/${fullscreenImage.name}`}
                key={fullscreenImage.url}
                alt={`Image ${fullscreenImage.id}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 200px)',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                className="rounded-lg cursor-pointer"
                onLoad={handleImageLoad}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(!isZoomed);
                }}
              />
            }
            {fullscreenImage.type === "video" &&
              <video
                playsinline
                autoPlay
                loop
                controls
                disablepictureinpicture
                poster={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${fullscreenImage.url}/anim=false,transcode=true,original=true/${fullscreenImage.url}.jpeg`}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 200px)',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                key={fullscreenImage.url}
              >
                <source src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${fullscreenImage.url}/transcode=true,original=true,quality=90/${fullscreenImage.name.split('.')[0]}.webm`}
                  type="video/webm" />
                <source src={"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${fullscreenImage.url}/transcode=true,original=true,quality=90/${fullscreenImage.name.split('.')[0]}.mp4"}
                  type="video/mp4" />

              </video>
            }
          </div>
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full">
            {isZoomed ? (
              <ZoomOutIcon className="w-6 h-6 text-white" />
            ) : (
              <ZoomInIcon className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-black bg-opacity-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrev}
              className="text-white hover:text-gray-300"
              disabled={!hasPrev}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-white">
              {allImages.findIndex(img => img.id === fullscreenImage.id) + 1} of {allImages.length}
            </span>
            <button
              onClick={handleNext}
              className="text-white hover:text-gray-300"
              disabled={!hasNext}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="text-white hover:text-gray-300"
              disabled={!hasPrev}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="text-white hover:text-gray-300"
              disabled={!hasNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenViewer; 