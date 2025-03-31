import React, { useState } from 'react';
import { useBountyReviewer } from '../../contexts/BountyReviewerContext';
import { colorOptions } from '../../utils/constants';
import { ArrowLeft, Plus, Edit, Trash } from 'lucide-react';

const ConfigView = () => {
  const {
    buckets,
    setConfigMode,
    handleAddBucket,
    handleEditBucket,
    handleRemoveBucket,
    handleResetBuckets
  } = useBountyReviewer();
  
  const [editingBucket, setEditingBucket] = useState(null);
  const [newBucket, setNewBucket] = useState({
    id: '',
    name: '',
    limit: null,
    color: 'bg-blue-500'
  });
  
  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingBucket({
        ...editingBucket,
        [name]: name === 'limit' ? (value === '' ? null : parseInt(value, 10)) : value
      });
    } else {
      setNewBucket({
        ...newBucket,
        [name]: name === 'limit' ? (value === '' ? null : parseInt(value, 10)) : value
      });
    }
  };
  
  const validateBucket = (bucket) => {
    if (!bucket.id) return 'Bucket ID is required';
    if (!bucket.id.match(/^[a-z0-9_]+$/)) return 'Bucket ID can only contain lowercase letters, numbers, and underscores';
    if (!bucket.name) return 'Bucket name is required';
    return null;
  };
  
  const handleSubmitNewBucket = (e) => {
    e.preventDefault();
    const error = validateBucket(newBucket);
    if (error) {
      alert(error);
      return;
    }
    
    // Check for duplicate IDs
    if (buckets.some(b => b.id === newBucket.id)) {
      alert('A bucket with this ID already exists');
      return;
    }
    
    handleAddBucket(newBucket);
    setNewBucket({
      id: '',
      name: '',
      limit: null,
      color: 'bg-blue-500'
    });
  };
  
  const startEditingBucket = (bucket, index) => {
    setEditingBucket({ ...bucket, index });
  };
  
  const cancelEditing = () => {
    setEditingBucket(null);
  };
  
  const handleUpdateBucket = (e) => {
    e.preventDefault();
    const error = validateBucket(editingBucket);
    if (error) {
      alert(error);
      return;
    }
    
    // Check for duplicate IDs, but allow the same ID for the same bucket
    const otherBuckets = buckets.filter((_, i) => i !== editingBucket.index);
    if (otherBuckets.some(b => b.id === editingBucket.id)) {
      alert('Another bucket with this ID already exists');
      return;
    }
    
    const { index, ...bucketData } = editingBucket;
    handleEditBucket(index, bucketData);
    setEditingBucket(null);
  };
  
  const confirmDeleteBucket = (index) => {
    if (window.confirm('Are you sure you want to delete this bucket?')) {
      handleRemoveBucket(index);
    }
  };
  
  const confirmResetBuckets = () => {
    if (window.confirm('Are you sure you want to reset all buckets to default?')) {
      handleResetBuckets();
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-darkContainerBg p-8 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setConfigMode(false)}
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold dark:text-white">Bucket Configuration</h1>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4 dark:text-white">Current Buckets</h2>
        <div className="space-y-3">
          {buckets.map((bucket, index) => (
            <div 
              key={bucket.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-darkElementBg rounded-lg"
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 ${bucket.color} rounded-full mr-3`}></div>
                <div>
                  <h3 className="font-medium dark:text-white">{bucket.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {bucket.id} | Limit: {bucket.limit !== null ? bucket.limit : 'None'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => startEditingBucket(bucket, index)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-600 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => confirmDeleteBucket(index)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-600 rounded"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={confirmResetBuckets}
          className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Reset to Default Buckets
        </button>
      </div>
      
      {/* Editing Form */}
      {editingBucket && (
        <div className="mb-8 p-6 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <h2 className="text-lg font-medium mb-4 dark:text-white">Edit Bucket</h2>
          <form onSubmit={handleUpdateBucket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bucket ID
              </label>
              <input
                type="text"
                name="id"
                value={editingBucket.id}
                onChange={(e) => handleInputChange(e, true)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-darkElementBg dark:text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bucket Name
              </label>
              <input
                type="text"
                name="name"
                value={editingBucket.name}
                onChange={(e) => handleInputChange(e, true)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-darkElementBg dark:text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image Limit (leave empty for no limit)
              </label>
              <input
                type="number"
                name="limit"
                value={editingBucket.limit === null ? '' : editingBucket.limit}
                onChange={(e) => handleInputChange(e, true)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-darkElementBg dark:text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map(color => (
                  <div
                    key={color.value}
                    onClick={() => setEditingBucket({ ...editingBucket, color: color.value })}
                    className={`h-8 ${color.value} rounded cursor-pointer ${
                      editingBucket.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-darkElementBg rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Add New Bucket Form */}
      {!editingBucket && (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h2 className="text-lg font-medium mb-4 dark:text-white">Add New Bucket</h2>
          <form onSubmit={handleSubmitNewBucket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bucket ID
              </label>
              <input
                type="text"
                name="id"
                value={newBucket.id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-darkElementBg dark:text-white rounded-md"
                placeholder="e.g. top10, rejected, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bucket Name
              </label>
              <input
                type="text"
                name="name"
                value={newBucket.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-darkElementBg dark:text-white rounded-md"
                placeholder="e.g. Top 10, Rejected, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image Limit (leave empty for no limit)
              </label>
              <input
                type="number"
                name="limit"
                value={newBucket.limit === null ? '' : newBucket.limit}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-darkElementBg dark:text-white rounded-md"
                placeholder="e.g. 10, 20, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map(color => (
                  <div
                    key={color.value}
                    onClick={() => setNewBucket({ ...newBucket, color: color.value })}
                    className={`h-8 ${color.value} rounded cursor-pointer ${
                      newBucket.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bucket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ConfigView; 