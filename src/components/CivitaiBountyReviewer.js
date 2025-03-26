import React, { useState } from 'react';
import _ from 'lodash';

const CivitaiBountyReviewer = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [bountyId, setBountyId] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [jsonData, setJsonData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Check if this is a valid bounty entries JSON
        if (!jsonData.entries || !Array.isArray(jsonData.entries)) {
          throw new Error('Invalid JSON format: Expected "entries" array');
        }
        
        setBountyId(jsonData.bountyId || 'Unknown');
        setEntries(jsonData.entries);
        setJsonData(jsonData);
        setFileUploaded(true);
        setHasMore(false);
        setLoading(false);
        
        console.log(`Loaded ${jsonData.entries.length} entries from JSON file`);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        setError(`Failed to parse JSON file: ${error.message}`);
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read the file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  const handleLoadMore = () => {
    // This is now a placeholder since we're not fetching data incrementally
    // but it's kept for compatibility with the rest of the code
  };

  const resetReview = () => {
    setEntries([]);
    setRatings({});
    setCurrentIndex(0);
    setIsComplete(false);
    setHasMore(false);
    setFileUploaded(false);
    setJsonData(null);
    setBountyId(null);
  };

  const handleRate = (entryId, isApproved) => {
    setRatings(prev => ({
      ...prev,
      [entryId]: isApproved
    }));

    if (currentIndex < entries.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (hasMore) {
      handleLoadMore();
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < entries.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (hasMore) {
      handleLoadMore();
    }
  };

  const getCurrentEntry = () => {
    return entries[currentIndex];
  };

  const getApprovedEntries = () => {
    return entries.filter(entry => ratings[entry.id] === true);
  };

  const getStats = () => {
    const approved = Object.values(ratings).filter(r => r === true).length;
    const rejected = Object.values(ratings).filter(r => r === false).length;
    const pending = entries.length - approved - rejected;
    
    return {
      approved,
      rejected,
      pending
    };
  };

  const handleSaveImage = (imageUrl, filename) => {
    const link = document.createElement('a');
    link.href = `https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${imageUrl}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveJson = () => {
    const approvedEntries = getApprovedEntries();
    const dataStr = JSON.stringify(approvedEntries, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `approved_entries_bounty_${bountyId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleSaveAllImages = () => {
    const approvedEntries = getApprovedEntries();
    alert(`This will download ${approvedEntries.reduce((sum, entry) => sum + entry.images.length, 0)} images one by one.`);
    
    approvedEntries.forEach((entry, entryIndex) => {
      entry.images.forEach((image, imageIndex) => {
        // Add a small delay between downloads to prevent browser issues
        setTimeout(() => {
          handleSaveImage(
            image.url, 
            `bounty_${bountyId}_entry_${entry.id}_image_${imageIndex}.jpg`
          );
        }, (entryIndex * entry.images.length + imageIndex) * 1000);
      });
    });
  };

  const stats = getStats();

  if (error && entries.length === 0) {
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

  if (isComplete) {
    const approvedEntries = getApprovedEntries();
    
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Review Complete!</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <div className="flex space-x-4">
              <div className="bg-green-100 p-4 rounded flex-1">
                <div className="text-green-800 font-bold text-xl">{stats.approved}</div>
                <div className="text-green-600">Approved</div>
              </div>
              <div className="bg-red-100 p-4 rounded flex-1">
                <div className="text-red-800 font-bold text-xl">{stats.rejected}</div>
                <div className="text-red-600">Rejected</div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Actions</h2>
            <div className="flex space-x-4">
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleToggleSaveAllImages}
                disabled={approvedEntries.length === 0}
              >
                Save All Approved Images
              </button>
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleSaveJson}
                disabled={approvedEntries.length === 0}
              >
                Save JSON Data
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Approved Entries ({approvedEntries.length})</h2>
            {approvedEntries.length === 0 ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                No entries were approved.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedEntries.map(entry => (
                  <div key={entry.id} className="border rounded p-4">
                    <div className="font-semibold mb-2">#{entry.id} by {entry.user.username}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {entry.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/width=200`} 
                            alt={`Thumbnail ${index}`}
                            className="w-full h-auto rounded" 
                          />
                          <button 
                            className="absolute top-1 right-1 bg-blue-600 text-white p-1 rounded-full text-xs"
                            onClick={() => handleSaveImage(
                              image.url, 
                              `bounty_${bountyId}_entry_${entry.id}_image_${index}.jpg`
                            )}
                          >
                            ⬇️
                          </button>
                        </div>
                      ))}
                    </div>
                    {entry.images.length > 4 && (
                      <div className="text-gray-500 text-sm mt-1">
                        +{entry.images.length - 4} more images
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <button 
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              onClick={resetReview}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentEntry = getCurrentEntry();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
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
              <div className="text-xs text-gray-500 text-center">
                Upload the JSON file generated by the extractor script
              </div>
            </div>
          ) : (
            <div className="flex space-x-2 items-center">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                Bounty #{bountyId} • {entries.length} entries
              </div>
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
          <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-2">How to use this app:</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>First, run the extractor script in your browser console on the Civitai website</li>
              <li>Save the generated JSON file to your computer</li>
              <li>Upload the JSON file using the button above</li>
              <li>Review each entry by approving or rejecting it</li>
              <li>When finished, download your approved entries and images</li>
            </ol>
            <div className="mt-4 bg-yellow-50 p-4 rounded border border-yellow-200">
              <h3 className="font-semibold">Need the extractor script?</h3>
              <p className="text-sm mt-1">
                Scroll down to find the "Civitai Bounty Data Extractor Script" section.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="text-gray-600">
              {entries.length > 0 ? `Entry ${currentIndex + 1} of ${entries.length}${hasMore ? '+' : ''}` : 'No entries loaded'}
            </div>
            
            <div className="flex space-x-4">
              <div className="text-green-600 font-semibold">
                Approved: {stats.approved}
              </div>
              <div className="text-red-600 font-semibold">
                Rejected: {stats.rejected}
              </div>
              <div className="text-gray-600 font-semibold">
                Pending: {stats.pending}
              </div>
            </div>
          </div>
        )}
        
        {loading && entries.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Loading entries...</div>
          </div>
        )}
        
        {entries.length === 0 && !loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">No entries found</div>
          </div>
        )}
        
        {currentEntry && (
          <div>
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">Entry #{currentEntry.id}</h2>
                  <div className="text-gray-600">
                    By: {currentEntry.user.username} • {new Date(currentEntry.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      currentEntry.nsfwLevel > 2 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      NSFW Level: {currentEntry.nsfwLevel}
                    </span>
                  </div>
                </div>
                {ratings[currentEntry.id] !== undefined && (
                  <div className={`px-3 py-1 rounded font-semibold ${
                    ratings[currentEntry.id] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {ratings[currentEntry.id] ? 'Approved' : 'Rejected'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              {currentEntry.images.map((image, index) => (
                <div key={index} className="mb-4">
                  <div className="flex flex-col md:flex-row justify-between text-sm text-gray-600 mb-1 gap-1">
                    <div>Image {index + 1} of {currentEntry.images.length}</div>
                    <div>
                      Dimensions: {image.width}×{image.height} • 
                      NSFW Level: {image.nsfwLevel}
                    </div>
                  </div>
                  <img
                    src={`https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/width=800`}
                    alt={`Entry ${currentEntry.id} Image ${index}`}
                    className="w-full h-auto rounded border"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              
              <div className="flex space-x-4">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  onClick={handleSkip}
                >
                  Skip
                </button>
                <button
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                  onClick={() => handleRate(currentEntry.id, false)}
                >
                  Reject
                </button>
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  onClick={() => handleRate(currentEntry.id, true)}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Removed the Load More button since we load all entries at once */}
      </div>
    </div>
  );
};

export default CivitaiBountyReviewer;