import { useState } from 'react';

export const useBountyData = () => {
  // State for data
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bountyId, setBountyId] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);

  const handleFileUpload = (event, handleLoadAppState) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Check if this is a complete app state JSON (contains version field)
        if (jsonData.version && jsonData.appName === 'Civitai Bounty Reviewer') {
          // This is a saved app state
          if (handleLoadAppState) {
            handleLoadAppState(jsonData);
          }
        }
        // Check if this is a standard bounty entries JSON
        else if (jsonData.entries && Array.isArray(jsonData.entries)) {
          setBountyId(jsonData.bountyId || 'Unknown');
          setEntries(jsonData.entries);
          setJsonData(jsonData);
          setFileUploaded(true);
          setLoading(false);
        } 
        // Check if this is a ratings JSON from our app
        else if (jsonData.images && Array.isArray(jsonData.images)) {
          setBountyId(jsonData.bountyId || 'Unknown');
          
          // If we have full entries data, load that too
          if (jsonData.entries && Array.isArray(jsonData.entries)) {
            setEntries(jsonData.entries);
          }
          
          setJsonData(jsonData);
          setFileUploaded(true);
          setLoading(false);
        } else {
          throw new Error('Invalid JSON format: Expected either "entries", "images" array, or a saved application state');
        }
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

  const handleUrlLoad = (url) => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.entries && Array.isArray(data.entries)) {
          setBountyId(data.bountyId || 'Unknown');
          setEntries(data.entries);
          setJsonData(data);
          setFileUploaded(true);
          setLoading(false);
        } else {
          throw new Error('Invalid JSON format: Expected "entries" array');
        }
      })
      .catch(error => {
        console.error("Error fetching JSON data:", error);
        setError(`Failed to fetch JSON data: ${error.message}`);
        setLoading(false);
      });
  };

  const resetReview = () => {
    setEntries([]);
    setLoading(false);
    setError(null);
    setBountyId(null);
    setFileUploaded(false);
    setJsonData(null);
  };

  return {
    entries,
    setEntries,
    loading,
    setLoading,
    error,
    setError,
    bountyId,
    setBountyId,
    fileUploaded,
    setFileUploaded,
    jsonData,
    setJsonData,
    isLoadingRatings,
    setIsLoadingRatings,
    handleFileUpload,
    handleUrlLoad,
    resetReview
  };
}; 