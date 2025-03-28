import React from 'react';

const AppStateLoadDialog = ({ onClose, onConfirm, stateInfo }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Load Saved Review State?</h2>
        
        <div className="mb-4">
          <p className="mb-2">You've uploaded a saved application state file. This will restore:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Bounty #{stateInfo.bountyId}</li>
            <li>{stateInfo.allImages?.length || 0} images</li>
            <li>{stateInfo.buckets?.length || 0} bucket categories</li>
            <li>{Object.keys(stateInfo.bucketAssignments || {}).length} categorized images</li>
            <li>Last paused at image #{stateInfo.currentImageIndex + 1}</li>
          </ul>
          <p className="mt-2 text-sm text-gray-600">
            State was saved on: {new Date(stateInfo.exportedAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onConfirm}
          >
            Load State
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppStateLoadDialog;