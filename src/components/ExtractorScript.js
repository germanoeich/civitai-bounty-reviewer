import React, { useState } from 'react';

const ExtractorScript = () => {
  const [copied, setCopied] = useState(false);
  
  const scriptContent = `/**
 * Civitai Bounty Data Extractor
 * 
 * Instructions:
 * 1. Navigate to the Civitai bounty page in your browser
 * 2. Open Developer Tools (F12 or Ctrl+Shift+I)
 * 3. Paste this entire script into the Console tab
 * 4. The extraction will start automatically
 */

function getBountyIdFromUrl() {
  const match = window.location.pathname.match(/\\/bounties\\/(\\d+)/);
  if (!match) {
    throw new Error('Please navigate to a Civitai bounty page first');
  }
  return match[1];
}

async function extractBountyEntries(bountyId = null) {
  if (!bountyId) {
    bountyId = getBountyIdFromUrl();
  }
  
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

// Auto-run the extraction
console.log("Civitai Bounty Data Extractor loaded. Starting extraction...");
extractBountyEntries().catch(error => {
  console.error("Failed to start extraction:", error);
});

// Example usage: extractBountyEntries()
console.log("<h1>Extraction started. Please remain in this tab until the extraction is complete.</h1>");`;

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
          className={`px-4 py-2 rounded-sm ${copied ? 'bg-green-600' : 'bg-blue-600'} text-white`}
        >
          {copied ? 'Copied!' : 'Copy Script'}
        </button>
      </div>
      <div className="text-sm mb-4">
        <p>Copy this script and run it in your browser console while on the Civitai bounty page.</p>
        <p>The extraction will start automatically when you paste the script.</p>
      </div>
      <div className="text-sm mb-4 text-red-500 font-bold">
        
        <p className='text-red-500'><span className="mr-2">🚨</span> Running scripts in your browser is dangerous. A malicious actor could quite literally take full control of your account and drain all your buzz if you paste code without verifying it first. I urge you to verify the code yourself, but since not everyone is a coder, I suggest you use an LLM like Claude or ChatGPT to verify the safety of this script.</p>
        <p className='text-yellow-600'><span className="mr-2">⚠️</span> You can run this script without being logged into your account. </p>
        <br />
        <p className='text-green-500'>Claude report: <a className='text-blue-500' href="https://claude.ai/share/805587b0-fe00-405b-9955-33ea4d0adfcc">https://claude.ai/share/805587b0-fe00-405b-9955-33ea4d0adfcc</a></p>
        <p className='text-green-500'>ChatGPT report: <a className='text-blue-500' href="https://chatgpt.com/share/67e6ea09-1970-800f-91bd-60dd28c0d6d0">https://chatgpt.com/share/67e6ea09-1970-800f-91bd-60dd28c0d6d0</a></p>
      </div>
      <pre className="bg-gray-800 text-gray-100 dark:bg-gray-50 dark:text-gray-900 p-4 rounded-md overflow-auto text-xs h-64">
        {scriptContent}
      </pre>
    </div>
  );
};

export default ExtractorScript;