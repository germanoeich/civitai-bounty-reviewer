import React, { useState } from 'react';
import { colorOptions } from '../utils/constants';

const ConfigView = ({ buckets, setConfigMode, defaultBuckets, onAddBucket, onEditBucket, onRemoveBucket, onResetBuckets }) => {
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketLimit, setNewBucketLimit] = useState(10);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);

  const addNewBucket = () => {
    if (!newBucketName) return;
    
    const bucketId = newBucketName.trim().toLowerCase().replace(/\s+/g, '_');
    
    const newBucket = {
      id: bucketId,
      name: newBucketName.trim(),
      limit: newBucketLimit || null,
      color: selectedColor
    };
    
    if (editingIndex !== null) {
      // Update existing bucket
      onEditBucket(editingIndex, newBucket);
      setEditingIndex(null);
    } else {
      // Add new bucket
      onAddBucket(newBucket);
    }
    
    // Reset form
    setNewBucketName('');
    setNewBucketLimit(10);
    setSelectedColor(colorOptions[0].value);
  };

  const editBucket = (index) => {
    const bucket = buckets[index];
    setNewBucketName(bucket.name);
    setNewBucketLimit(bucket.limit || 0);
    setSelectedColor(bucket.color || colorOptions[0].value);
    setEditingIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bucket Configuration</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setConfigMode(false)}
          >
            Done
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Configure the buckets you want to use for sorting images. Each bucket can have an optional limit.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <h3 className="font-semibold mb-3">{editingIndex !== null ? 'Edit Bucket' : 'Add New Bucket'}</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Name:</label>
                <input
                  type="text"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Top 10, Honorable Mentions"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Limit:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newBucketLimit}
                    onChange={(e) => setNewBucketLimit(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Maximum number of images (leave empty for unlimited)"
                  />
                  <span className="text-sm text-gray-500">(0 = unlimited)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Color:</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {colorOptions.map(color => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                {editingIndex !== null && (
                  <button
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                    onClick={() => {
                      setNewBucketName('');
                      setNewBucketLimit(10);
                      setSelectedColor(colorOptions[0].value);
                      setEditingIndex(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  onClick={addNewBucket}
                  disabled={!newBucketName.trim()}
                >
                  {editingIndex !== null ? 'Update Bucket' : 'Add Bucket'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Current Buckets</h3>
              <button
                className="text-sm text-gray-600 hover:text-gray-800"
                onClick={onResetBuckets}
              >
                Reset to Defaults
              </button>
            </div>
            
            {buckets.length === 0 ? (
              <p className="text-gray-500 text-sm">No buckets configured yet. Add some above.</p>
            ) : (
              <div className="space-y-2">
                {buckets.map((bucket, index) => (
                  <div key={bucket.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${bucket.color}`}></div>
                      <span className="font-medium">{bucket.name}</span>
                      {bucket.limit && (
                        <span className="text-sm text-gray-500">
                          (Limit: {bucket.limit})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => editBucket(index)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => onRemoveBucket(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigView; 