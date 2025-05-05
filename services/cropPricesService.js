import axios from 'axios'
import { API_BASE_URL } from '../config'

// Get all locations from the database
export const getLocations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/crop-prices/locations/`)
    return response.data.locations
  } catch (error) {
    console.error('Error fetching locations:', error)
    throw error
  }
}

// Get all commodities from the database
export const getCommodities = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/crop-prices/commodities/`)
    return response.data.commodities
  } catch (error) {
    console.error('Error fetching commodities:', error)
    throw error
  }
}

// Get price history for a specific commodity and location
export const getPriceHistory = async (commodity, location, startDate, endDate) => {
  try {
    // Ensure we have both startDate and endDate
    if (!startDate || !endDate) {
      console.warn('Missing date range parameters, using defaults')
      const today = new Date()
      endDate = endDate || today.toISOString().split('T')[0]

      // Default to 7 days ago if startDate is not provided
      if (!startDate) {
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(today.getDate() - 7)
        startDate = sevenDaysAgo.toISOString().split('T')[0]
      }
    }

    const params = {
      commodity,
      location,
      start_date: startDate,
      end_date: endDate
    }

    console.log('Fetching price history with params:', params)
    const response = await axios.get(`${API_BASE_URL}/api/crop-prices/price-history/`, { params })
    return response.data
  } catch (error) {
    console.error('Error fetching price history:', error)
    throw error
  }
}

// Get price forecast for a specific commodity and location
export const getForecast = async (commodity, location, days = 7) => {
  try {
    const params = { commodity, location, days }
    const response = await axios.get(`${API_BASE_URL}/api/crop-prices/forecast/`, { params })
    return response.data
  } catch (error) {
    console.error('Error fetching forecast:', error)
    throw error
  }
}

// Compare prices of multiple commodities at a specific location
export const compareCommodities = async (commodities, location, startDate, endDate) => {
  try {
    const params = { 'commodities[]': commodities, location }
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    const response = await axios.get(`${API_BASE_URL}/api/crop-prices/compare-commodities/`, { params })
    return response.data
  } catch (error) {
    console.error('Error comparing commodities:', error)
    throw error
  }
}

// Compare prices of a commodity across multiple locations
export const compareLocations = async (commodity, locations, startDate, endDate) => {
  try {
    const params = { commodity, 'locations[]': locations }
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    const response = await axios.get(`${API_BASE_URL}/api/crop-prices/compare-locations/`, { params })
    return response.data
  } catch (error) {
    console.error('Error comparing locations:', error)
    throw error
  }
}
