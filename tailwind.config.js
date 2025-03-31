/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#1A1B1E',
        darkContainerBg: '#141517',
        darkElementBg: '#343a40',
        darkSubElementBg: '#25262b'
      }
    },
  },
  plugins: [],
}