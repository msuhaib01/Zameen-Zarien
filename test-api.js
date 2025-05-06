const axios = require('axios');
// Using hardcoded URL since we can't import ES modules in CommonJS
const API_BASE_URL = "http://localhost:8000";

console.log('Testing API connection to:', API_BASE_URL);

// Test the basic connection endpoint
axios.get(`${API_BASE_URL}/api/test-connection/`)
  .then(response => {
    console.log('Connection successful!');
    console.log('Response:', response.data);

    // Now test the locations API
    return axios.get(`${API_BASE_URL}/api/crop-prices/locations/`);
  })
  .then(response => {
    console.log('\nLocations API successful!');
    console.log('Locations:', response.data);

    // Test the commodities API
    return axios.get(`${API_BASE_URL}/api/crop-prices/commodities/`);
  })
  .then(response => {
    console.log('\nCommodities API successful!');
    console.log('Commodities:', response.data);
  })
  .catch(error => {
    console.error('Error occurred:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server responded with status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Server might be down or network issue.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
  });
