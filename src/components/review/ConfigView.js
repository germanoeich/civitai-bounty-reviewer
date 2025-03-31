import React, { useCallback, useMemo, memo } from 'react';
import { useBountyReviewer } from '../../contexts/BountyReviewerContext';
import { X, Save, Plus, Trash, AlertTriangle } from 'lucide-react';

// Memoized bucket item component
const BucketItem = memo(({ bucket, onRemove, onUpdateName, onUpdateColor, onUpdateCount, canDelete }) => (
  <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <input
      type="color"
      value={bucket.color}
      onChange={(e) => onUpdateColor(bucket.id, e.target.value)}
      className="w-8 h-8 border-none rounded cursor-pointer"
      title="Bucket color"
    />
    <input
      type="text"
      value={bucket.name}
      onChange={(e) => onUpdateName(bucket.id, e.target.value)}
      className="flex-grow px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
      placeholder="Bucket name"
    />
    <input
      type="number"
      value={bucket.count}
      onChange={(e) => onUpdateCount(bucket.id, parseInt(e.target.value, 10) || 0)}
      className="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
      placeholder="Count"
      min="0"
    />
    {canDelete && (
      <button
        onClick={() => onRemove(bucket.id)}
        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
        title="Remove bucket"
      >
        <Trash className="w-4 h-4" />
      </button>
    )}
  </div>
));

BucketItem.displayName = 'BucketItem';

// Memoized warning component
const ConfigWarning = memo(({ message }) => (
  <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-6 rounded">
    <div className="flex items-start">
      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
      <div className="text-yellow-700 dark:text-yellow-100 text-sm">
        {message}
      </div>
    </div>
  </div>
));

ConfigWarning.displayName = 'ConfigWarning';

const ConfigView = () => {
  const {
    buckets,
    updateBucketName,
    updateBucketColor,
    updateBucketCount,
    removeBucket,
    addBucket,
    saveConfig,
    setConfigMode,
    config,
    updateConfig
  } = useBountyReviewer();

  // Use memoized callbacks to prevent unnecessary re-renders
  const handleSave = useCallback(() => {
    saveConfig();
    setConfigMode(false);
  }, [saveConfig, setConfigMode]);

  const handleCancel = useCallback(() => {
    setConfigMode(false);
  }, [setConfigMode]);

  const handleAddBucket = useCallback(() => {
    addBucket();
  }, [addBucket]);

  const handleUpdateName = useCallback((id, name) => {
    updateBucketName(id, name);
  }, [updateBucketName]);

  const handleUpdateColor = useCallback((id, color) => {
    updateBucketColor(id, color);
  }, [updateBucketColor]);

  const handleUpdateCount = useCallback((id, count) => {
    updateBucketCount(id, count);
  }, [updateBucketCount]);

  const handleRemoveBucket = useCallback((id) => {
    removeBucket(id);
  }, [removeBucket]);

  const handleConfigChange = useCallback((key, value) => {
    updateConfig({ ...config, [key]: value });
  }, [config, updateConfig]);

  // Determine if we're in review mode and have already assigned images
  const anyAssignedImages = useMemo(() => {
    return buckets.some(bucket => bucket.imageIds && bucket.imageIds.length > 0);
  }, [buckets]);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Configuration</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {anyAssignedImages && (
        <ConfigWarning 
          message="Warning: You have already assigned images to buckets. Changing bucket configuration may affect your current assignments." 
        />
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">Application Settings</h2>
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-700 dark:text-gray-300">
              Save progress interval (minutes)
            </label>
            <input
              type="number"
              value={config.autoSaveIntervalMinutes}
              onChange={(e) => handleConfigChange('autoSaveIntervalMinutes', parseInt(e.target.value, 10) || 5)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md"
              min="1"
              max="60"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Set to 0 to disable auto-save
            </p>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="skipEmptyBucket"
              checked={config.skipEmptyBucket}
              onChange={(e) => handleConfigChange('skipEmptyBucket', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="skipEmptyBucket" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Skip to next image if trying to select empty bucket
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="skipAssignedImages"
              checked={config.skipAssignedImages}
              onChange={(e) => handleConfigChange('skipAssignedImages', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="skipAssignedImages" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Skip images that have already been assigned to buckets
            </label>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold dark:text-white">Buckets</h2>
          <button
            onClick={handleAddBucket}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Bucket
          </button>
        </div>
        
        <div className="space-y-1">
          {buckets.map((bucket) => (
            <BucketItem
              key={bucket.id}
              bucket={bucket}
              onRemove={handleRemoveBucket}
              onUpdateName={handleUpdateName}
              onUpdateColor={handleUpdateColor}
              onUpdateCount={handleUpdateCount}
              canDelete={buckets.length > 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(ConfigView); 