import React from 'react';
import CivitaiBountyReviewer from './components/CivitaiBountyReviewer';
import ExtractorScript from './components/ExtractorScript';

function App() {
  return (
    <div className="App">
      <CivitaiBountyReviewer />
      <div className="max-w-4xl mx-auto mt-8 mb-16">
        <ExtractorScript />
      </div>
    </div>
  );
}

export default App;