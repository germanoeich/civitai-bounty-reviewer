import React, { useState } from 'react';

const ExtractorScript = () => {
  const [copied, setCopied] = useState(false);
  
  const scriptContent = `/**
 * Civitai Bounty Data Extractor
 * 
 * Instructions:
 * 1. Navigate to the Civitai website in your browser
 * 2. Open Developer Tools (F12 or Ctrl+Shift+I)
 * 3. Paste this entire script into the Console tab
 * 4. Call the function with: extractBountyEntries(7091) - replace 7091 with your desired bounty ID
 * 5. Wait for the script to finish - it will automatically download a JSON file
 */

async function extractBountyEntries(bountyId) {
  const allEntries = [];
  let cursor = 0;
  let hasMore = true;
  let batchNumber = 1;
  
  console.log(\`Starting extraction for Bounty #\${bountyId}...\`);
  
  try {
    while (hasMore) {
      console.log(\`Fetching batch \${batchNumber} (cursor: \${cursor})...\`);
      
      const response = await fetch(
        \`https://civitai.com/api/trpc/bounty.getEntries?input=\${encodeURIComponent(
          JSON.stringify({
            json: {
              id: parseInt(bountyId),
              cursor: cursor,
              authed: false
            }
          })
        )}\`
      );
      
      if (!response.ok) {
        throw new Error(\`API request failed with status \${response.status}\`);
      }
      
      const data = await response.json();
      
      if (!data.result?.data?.json) {
        throw new Error('Unexpected API response format');
      }
      
      const newEntries = data.result.data.json.items || [];
      allEntries.push(...newEntries);
      
      console.log(\`Batch \${batchNumber}: Got \${newEntries.length} entries\`);
      
      if (data.result.data.json.nextCursor) {
        cursor = data.result.data.json.nextCursor;
        batchNumber++;
      } else {
        hasMore = false;
      }
      
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(\`Extraction complete! Total entries: \${allEntries.length}\`);
    
    // Save the data as a JSON file
    const dataStr = JSON.stringify({ 
      bountyId: bountyId,
      extractedAt: new Date().toISOString(),
      entries: allEntries 
    }, null, 2);
    const dataUri = \`data:application/json;charset=utf-8,\${encodeURIComponent(dataStr)}\`;
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = \`bounty_\${bountyId}_entries.json\`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(\`JSON file downloaded: bounty_\${bountyId}_entries.json\`);
    return allEntries;
  } catch (error) {
    console.error("Error extracting bounty entries:", error);
    throw error;
  }
}

// Optional: Add auto-completion status indicator
function checkExtractionStatus(startTime, entryCount) {
  const elapsed = (Date.now() - startTime) / 1000;
  console.log(\`Extraction in progress: \${entryCount} entries (\${elapsed.toFixed(2)}s elapsed)\`);
}

// Example usage: extractBountyEntries(7091)
console.log("Civitai Bounty Data Extractor loaded. Call extractBountyEntries(bountyId) to begin extraction.");`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Civitai Bounty Data Extractor Script</h2>
        <button 
          onClick={handleCopy}
          className={`px-4 py-2 rounded ${copied ? 'bg-green-600' : 'bg-blue-600'} text-white`}
        >
          {copied ? 'Copied!' : 'Copy Script'}
        </button>
      </div>
      <div className="text-sm mb-4">
        <p>Copy this script and run it in your browser console while on the Civitai website.</p>
        <p>Call it with: <code className="bg-gray-100 px-1 py-0.5 rounded">extractBountyEntries(7091)</code> (replace 7091 with your bounty ID)</p>
      </div>
      <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-auto text-xs h-64">
        {scriptContent}
      </pre>
    </div>
  );
};

export default ExtractorScript;