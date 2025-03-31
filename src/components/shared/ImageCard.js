import React, { useState } from 'react';
import { Maximize2, Download, Info } from 'lucide-react';
import FullscreenViewer from './FullscreenViewer';
import { saveAs } from 'file-saver';

const ImageCard = ({ image, onSaveImage }) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!image) return null;

  const handleDownload = () => {
    if (image.url) {
      try {
        const filename = image.name || image.url.split('/').pop() || `image_${image.id}.jpg`;

        if (typeof onSaveImage === 'function') {
          onSaveImage(image.url, filename);
        } else {
          saveAs(image.url, filename);
        }
      } catch (error) {
        console.error('Error downloading image:', error);
        alert('Failed to download image. Please try again.');
      }
    }
  };

  const toggleFullscreen = () => {
    setShowFullscreen(prev => !prev);
  };

  const toggleInfo = () => {
    setShowInfo(prev => !prev);
  };

  const handleImageError = () => {
    console.log("Image failed to load:", image);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const imageInfo = [
    ...(image.entryData?.name ? [{ label: 'Entry Name', value: image.entryData.name }] : []),
    ...(image.entryData?.username ? [{ label: 'Creator', value: image.entryData.username }] : []),
    ...(image.prompt ? [{ label: 'Prompt', value: image.prompt }] : []),
    { label: 'Image ID', value: image.id }
  ];

  return (
    <>
      <div className="bg-white dark:bg-darkContainerBg rounded-lg shadow-md overflow-hidden">
        {/* Image header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white truncate">
            {image.name || image.entryData?.name || `Image #${image.id}`}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={toggleInfo}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Show Image Info"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Download Image"
              disabled={!image.url}
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="View Fullscreen"
              disabled={!image.url || imageError}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div className="image-container">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-darkBg">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {image.url && !imageError ? (
            <>
              {image.type === 'video' ? (
                <video
                  autoPlay
                  loop
                  muted
                  disablePictureInPicture
                  preload="none"
                  className="w-full h-full object-contain"
                  poster={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/anim=false,transcode=true,original=true/${image.url}.jpeg`}
                  key={image.url}
                  onLoadedData={handleImageLoad}
                  onError={handleImageError}
                >
                  <source
                    src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/transcode=true,original=true,quality=90/${image.url}.webm`}
                    type="video/webm"
                  />
                  <source
                    src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/transcode=true,original=true,quality=90/${image.url}.mp4`}
                    type="video/mp4"
                  />
                </video>
              ) : (
                <img
                  key={`img-${image.id}`}
                  src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/width=600`}
                  alt={image.name || image.entryData?.name || `Image ${image.id}`}
                  className={`fade-in ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  onClick={toggleFullscreen}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="eager"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex justify-center items-center bg-gray-100 dark:bg-darkBg">
              <p className="text-gray-500 dark:text-gray-400">
                {imageError ? "Failed to load image" : "Image not available"}
              </p>
            </div>
          )}
        </div>

        {/* Image info (collapsible) */}
        {showInfo && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-3 dark:text-white">Image Information</h3>
            <div className="space-y-2">
              {imageInfo.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <div className="font-medium text-gray-600 dark:text-gray-400">{item.label}:</div>
                  <div className="col-span-2 text-gray-800 dark:text-gray-300 break-words">{item.value}</div>
                </div>
              ))}
              {imageInfo.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">No additional information available</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen viewer */}
      {showFullscreen && image.url && !imageError && (
        <FullscreenViewer
          image={image}
          src={image.url}
          onClose={toggleFullscreen}
          onDownload={handleDownload}
        />
      )}
    </>
  );
};

ImageCard.displayName = 'ImageCard';

export default ImageCard; 