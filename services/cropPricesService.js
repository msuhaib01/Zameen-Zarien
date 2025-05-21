import axios from "axios";
import { API_BASE_URL } from "../config";

// Check if the API is available
export const checkApiAvailability = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/test-connection/`, {
      timeout: 15000, // Increased timeout to 15 seconds for testing
    });
    return { available: true, data: response.data };
  } catch (error) {
    console.error("API availability check failed. Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error("Error details - Message:", error.message, "Code:", error.code);
    if (error.request) {
      console.error("Error details - Request object present (indicates request was made):", error.request);
    }
    if (error.config) {
      console.error("Error details - Config:", JSON.stringify(error.config));
    }
    
    return {
      available: false,
      error: error.message,
      details: error.response ? error.response.data : "No response from server. Axios error code: " + (error.code || 'N/A'),
    };
  }
};

// Get all locations from the database
export const getLocations = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/crop-prices/locations/`
    );
    return response.data.locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw error;
  }
};

// Get all commodities from the database
export const getCommodities = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/crop-prices/commodities/`
    );
    return response.data.commodities;
  } catch (error) {
    console.error("Error fetching commodities:", error);
    throw error;
  }
};

// Get price history for a specific commodity and location
export const getPriceHistory = async (
  commodity,
  location,
  startDate,
  endDate
) => {
  try {
    // Validate inputs
    if (!commodity || !location) {
      console.error(
        "Missing required parameters: commodity and location are required"
      );
      throw new Error("Commodity and location are required");
    }

    // Ensure we have both startDate and endDate
    if (!startDate || !endDate) {
      console.warn("Missing date range parameters, using defaults");
      const today = new Date();
      endDate = endDate || today.toISOString().split("T")[0];

      // Default to 7 days ago if startDate is not provided
      if (!startDate) {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        startDate = sevenDaysAgo.toISOString().split("T")[0];
      }
    }

    // Format dates if they are Date objects
    const formattedStartDate =
      typeof startDate === "string"
        ? startDate
        : formatDateObjectToYYYYMMDD(startDate);
    const formattedEndDate =
      typeof endDate === "string"
        ? endDate
        : formatDateObjectToYYYYMMDD(endDate);

    const params = {
      commodity,
      location,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    };

    console.log("Fetching price history with params:", params);
    console.log("API URL:", `${API_BASE_URL}/api/crop-prices/price-history/`);

    const response = await axios.get(
      `${API_BASE_URL}/api/crop-prices/price-history/`,
      { params }
    );

    // Log the response for debugging
    console.log("API Response:", JSON.stringify(response.data));

    // Check if we have data
    if (!response.data) {
      console.warn("API returned empty response");
      throw new Error("Empty response received from server");
    }

    // If data array is empty, return the response with default values for stats
    if (!response.data.data || response.data.data.length === 0) {
      console.warn("No price data available for the selected criteria");

      // Make sure we have a valid stats object with default values
      if (!response.data.stats) {
        response.data.stats = {};
      }

      // Set default values for stats if they are null
      response.data.stats.current = response.data.stats.current || 0;
      response.data.stats.highest = response.data.stats.highest || 0;
      response.data.stats.lowest = response.data.stats.lowest || 0;
      response.data.stats.average = response.data.stats.average || 0;

      return response.data;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching price history:", error);
    // Add more context to the error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        "Server responded with error:",
        error.response.status,
        error.response.data
      );
      throw new Error(
        `Server error: ${error.response.status} - ${
          error.response.data.error || "Unknown error"
        }`
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server");
      throw new Error("No response from server. Please check your connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

// Get price forecast for a specific commodity and location
export const getForecast = async (
  commodity,
  location,
  days = 7,
  useModel = true
) => {
  try {
    const params = { commodity, location, days, use_model: useModel };
    const response = await axios.get(
      `${API_BASE_URL}/api/crop-prices/forecast/`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    throw error;
  }
};

// Get price prediction using the trained model
export const getModelPrediction = async (
  commodity,
  location,
  days = 7,
  startDate = null,
  endDate = null
) => {
  try {
    const params = { commodity, location, days };

    // If start and end dates are provided, use them instead of days
    if (startDate && endDate) {
      // Format dates if they are Date objects
      const formattedStartDate =
        typeof startDate === "string"
          ? startDate
          : formatDateObjectToYYYYMMDD(startDate); // Use helper here
      const formattedEndDate =
        typeof endDate === "string"
          ? endDate
          : formatDateObjectToYYYYMMDD(endDate); // Use helper here

      params.start_date = formattedStartDate;
      params.end_date = formattedEndDate;

      console.log(
        `Using date range for prediction: ${formattedStartDate} to ${formattedEndDate}`
      );
    } else {
      console.log(`Using days for prediction: ${days} days`);
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/crop-prices/model-predict/`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting model prediction:", error);
    throw error;
  }
};

// Compare prices of multiple commodities at a specific location
export const compareCommodities = async (
  commodities,
  location,
  startDate,
  endDate
) => {
  try {
    const params = { "commodities[]": commodities, location };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await axios.get(
      `${API_BASE_URL}/api/crop-prices/compare-commodities/`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error comparing commodities:", error);
    throw error;
  }
};

// Compare prices of a commodity across multiple locations
export const compareLocations = async (
  commodity,
  locations,
  startDate,
  endDate
) => {
  try {
    const params = { commodity, "locations[]": locations };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await axios.get(
      `${API_BASE_URL}/api/crop-prices/compare-locations/`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error comparing locations:", error);
    throw error;
  }
};

// Get real-time data from the AIMS table
export const getRealTimeData = async (commodity = null, location = null) => {
  try {
    console.log("Fetching real-time data from AIMS table");

    // Build params object with optional filters
    const params = {};
    if (commodity) params.commodity = commodity;
    if (location) params.location = location;

    console.log("API URL:", `${API_BASE_URL}/api/aims-table/`);
    console.log("Params:", params);

    const response = await axios.get(`${API_BASE_URL}/api/aims-table/`, {
      params,
    });

    // Log the response for debugging
    console.log("API Response received");

    // Check if we have data
    if (!response.data) {
      console.warn("API returned empty response");
      throw new Error("Empty response received from server");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching real-time data:", error);

    // Add more context to the error
    if (error.response) {
      console.error(
        "Server responded with error:",
        error.response.status,
        error.response.data
      );
      throw new Error(
        `Server error: ${error.response.status} - ${
          error.response.data.error || "Unknown error"
        }`
      );
    } else if (error.request) {
      console.error("No response received from server");
      throw new Error("No response from server. Please check your connection.");
    } else {
      throw error;
    }
  }
};

// Helper function to format a Date object to YYYY-MM-DD string
// without timezone conversion issues from toISOString()
// This function can be moved to a utility file if used elsewhere
const formatDateObjectToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
