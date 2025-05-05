import axios from "axios";
import { API_BASE_URL } from "../config";

// Check if the API is available
export const checkApiAvailability = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/test-connection/`, {
      timeout: 5000,
    });
    return { available: true, data: response.data };
  } catch (error) {
    console.error("API availability check failed:", error);
    return {
      available: false,
      error: error.message,
      details: error.response ? error.response.data : "No response from server",
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
        : startDate.toISOString().split("T")[0];
    const formattedEndDate =
      typeof endDate === "string"
        ? endDate
        : endDate.toISOString().split("T")[0];

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
export const getForecast = async (commodity, location, days = 7) => {
  try {
    const params = { commodity, location, days };
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
