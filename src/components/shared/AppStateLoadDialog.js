import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AppStateLoadDialog = ({ onClose, onConfirm, stateInfo }) => {
  // Format time nicely
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (e) {
      return 'unknown time';
    }
  };

  // Get info about the state being loaded
  const bountyId = stateInfo?.bountyId || 'Unknown';
  const imageCount = stateInfo?.allImages?.length || 0;
  const reviewedCount = stateInfo?.bucketAssignments ? Object.keys(stateInfo.bucketAssignments).length : 0;
  const timeCreated = formatTime(stateInfo?.exportedAt);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-darkContainerBg rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="mr-4 bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
          </div>
          <h3 className="text-lg font-medium dark:text-white">Load Saved Review Session?</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You are about to load a previously saved review session. This will replace your current data.
          </p>
          
          <div className="bg-gray-50 dark:bg-darkElementBg p-3 rounded-md text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-500 dark:text-gray-400">Bounty ID:</div>
              <div className="font-medium dark:text-gray-200">{bountyId}</div>
              
              <div className="text-gray-500 dark:text-gray-400">Images:</div>
              <div className="font-medium dark:text-gray-200">{imageCount}</div>
              
              <div className="text-gray-500 dark:text-gray-400">Reviewed:</div>
              <div className="font-medium dark:text-gray-200">{reviewedCount} images</div>
              
              <div className="text-gray-500 dark:text-gray-400">Created:</div>
              <div className="font-medium dark:text-gray-200">{timeCreated}</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-darkElementBg rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Load Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppStateLoadDialog; 