import React, { useState, useEffect } from 'react';
import { X, RotateCcw, RotateCw, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

const FullscreenViewer = ({ image, src, alt, onClose, onDownload, fileName }) => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle ESC key to close viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent scrolling of body while viewer is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Reset state when image changes
  useEffect(() => {
    setRotation(0);
    setZoom(1);
    setLoading(true);
    setError(false);
  }, [image, src]);

  // Handle both the legacy image prop and the new src prop, ensuring we get the original size
  const imageUrl = src ? 
    `https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${src}/original=true` : 
    (image && image.url ? `https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/original=true` : null);

  // Handle image alt text
  const imageAlt = alt || (image && (image.name || image.entryData?.name || `Image ${image.id}`)) || 'Fullscreen image';

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    // Handle both onDownload callback and direct download
    if (onDownload) {
      onDownload();
    } else if (imageUrl) {
      // Use the file name if provided, otherwise extract from URL or use default
      const downloadName = fileName || (image && image.name) || imageUrl.split('/').pop() || 'image.jpg';
      saveAs(imageUrl, downloadName);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = (e, i, b) => {
    console.log("Image error:", e, i, b);
    setLoading(false);
    setError(true);
  };

  // Prevent event propagation to avoid closing on image click
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const transformStyle = {
    transform: `rotate(${rotation}deg) scale(${zoom})`,
    transition: 'transform 0.2s ease-out'
  };

  // Don't render if no image
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
        aria-label="Close fullscreen viewer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image container with loading and error states */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-8"
        onClick={handleContentClick}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error ? (
          <div className="text-white text-center">
            <p className="text-xl mb-2">Error loading image</p>
            <p className="text-gray-400">The image could not be loaded</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={imageAlt}
            className={`max-h-[90vh] max-w-full object-contain ${loading ? 'opacity-0' : 'opacity-100'}`}
            style={transformStyle}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>

      {/* Controls */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-80 rounded-lg px-4 py-2 flex items-center space-x-4"
        onClick={handleContentClick}
      >
        <button
          onClick={handleRotateLeft}
          className="text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Rotate left"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={handleRotateRight}
          className="text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Rotate right"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Zoom out"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <div className="text-white min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={handleZoomIn}
          className="text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Zoom in"
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetZoom}
          className="text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors text-sm"
        >
          Reset
        </button>
        <button
          onClick={handleDownload}
          className="text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Download image"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Display image name if available */}
      {image && (image.name || image.entryData?.name) && (
        <div className="absolute bottom-24 left-0 right-0 text-center">
          <p className="text-white text-xl">{image.name || image.entryData?.name}</p>
          {image.entryData?.username && (
            <p className="text-gray-300">by {image.entryData.username}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FullscreenViewer; 