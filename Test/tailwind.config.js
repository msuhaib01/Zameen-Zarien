/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust based on your file structure
    'Test\\App.js',              // Add the path to your App.js
    '.Test\\App.css',             // Add the path to your App.css
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}