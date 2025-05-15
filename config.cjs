// CommonJS version of config.js for use in Node.js scripts
// This file mirrors the settings in config.js but in CommonJS format

// API configuration
// Use this for development on your phone with laptop backend
// exports.API_BASE_URL = "http://192.168.100.94:8000";

// IMPORTANT: When running the app on your phone, use your laptop's IP address (above)
// When running the app on your laptop/emulator, use localhost (below)

// Uncomment this for local development on the same device (laptop/emulator)
exports.API_BASE_URL = "http://localhost:8000";

// Uncomment this if using Expo tunnel or a deployed backend
// exports.API_BASE_URL = "https://your-deployed-backend.com";

// App configuration
exports.APP_NAME = "Zameen Zarien";

// Theme configuration
exports.PRIMARY_COLOR = "#4CAF50";
exports.SECONDARY_COLOR = "#FFC107";

// Other configuration
exports.DEFAULT_LANGUAGE = "en";
