import React, { useState } from 'react';
import CivitaiBountyReviewer from './components/CivitaiBountyReviewer';
import nightwind from 'nightwind/helper'
import { Helmet } from "react-helmet"

import "./index.css"

function App() {
  const [darkMode, setDarkMode] = useState((window.localStorage.getItem('nightwind-mode') || 'light') === 'light');
  return (<>
  <Helmet>
      <script>{nightwind.init()}</script>
    </Helmet>
    <div className="App text-black min-h-screen bg-gray-100 p-6">
    <label class="inline-flex items-center cursor-pointer absolute">
      <input type="checkbox" checked={darkMode} onChange={() => {
        nightwind.toggle()
        setDarkMode(!darkMode)
      }} class="sr-only peer" />
        <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-800">Dark mode</span>
    </label>
      <CivitaiBountyReviewer />
    </div>
  </>
  );
}

export default App;