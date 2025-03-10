"use client"

import { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTranslation } from "react-i18next"

// Create context
const AppContext = createContext()

// Sample data for demonstration
const sampleCommodities = [
  { id: 1, name: "Wheat", name_ur: "گندم" },
  { id: 2, name: "Rice", name_ur: "چاول" },
  { id: 3, name: "Cotton", name_ur: "کپاس" },
  { id: 4, name: "Sugarcane", name_ur: "گنا" },
  { id: 5, name: "Maize", name_ur: "مکئی" },
]

// Add sample locations
const sampleLocations = [
  { id: 1, name: "Lahore", name_ur: "لاہور" },
  { id: 2, name: "Karachi", name_ur: "کراچی" },
  { id: 3, name: "Islamabad", name_ur: "اسلام آباد" },
  { id: 4, name: "Multan", name_ur: "ملتان" },
  { id: 5, name: "Peshawar", name_ur: "پشاور" },
]

const samplePriceData = {
  1: {
    // Wheat
    current: 200,
    highest: 210,
    lowest: 195,
    average: 202,
    history: [
      { date: "2023-01-01", price: 198 },
      { date: "2023-01-02", price: 200 },
      { date: "2023-01-03", price: 205 },
      { date: "2023-01-04", price: 210 },
      { date: "2023-01-05", price: 208 },
      { date: "2023-01-06", price: 202 },
      { date: "2023-01-07", price: 200 },
      { date: "2023-01-08", price: 195 },
      { date: "2023-01-09", price: 197 },
      { date: "2023-01-10", price: 200 },
    ],
    forecast: [
      { date: "2023-01-11", price: 201, confidence: [198, 204] },
      { date: "2023-01-12", price: 203, confidence: [199, 207] },
      { date: "2023-01-13", price: 205, confidence: [200, 210] },
      { date: "2023-01-14", price: 204, confidence: [198, 210] },
      { date: "2023-01-15", price: 202, confidence: [196, 208] },
      { date: "2023-01-16", price: 200, confidence: [194, 206] },
      { date: "2023-01-17", price: 198, confidence: [192, 204] },
    ],
  },
  2: {
    // Rice
    current: 150,
    highest: 160,
    lowest: 145,
    average: 152,
    history: [
      { date: "2023-01-01", price: 148 },
      { date: "2023-01-02", price: 150 },
      { date: "2023-01-03", price: 155 },
      { date: "2023-01-04", price: 160 },
      { date: "2023-01-05", price: 158 },
      { date: "2023-01-06", price: 152 },
      { date: "2023-01-07", price: 150 },
      { date: "2023-01-08", price: 145 },
      { date: "2023-01-09", price: 147 },
      { date: "2023-01-10", price: 150 },
    ],
    forecast: [
      { date: "2023-01-11", price: 151, confidence: [148, 154] },
      { date: "2023-01-12", price: 153, confidence: [149, 157] },
      { date: "2023-01-13", price: 155, confidence: [150, 160] },
      { date: "2023-01-14", price: 154, confidence: [148, 160] },
      { date: "2023-01-15", price: 152, confidence: [146, 158] },
      { date: "2023-01-16", price: 150, confidence: [144, 156] },
      { date: "2023-01-17", price: 148, confidence: [142, 154] },
    ],
  },
}

// Sample alerts data
const sampleAlerts = [
  {
    id: "1",
    commodityId: 1,
    priceThreshold: 205,
    condition: "above",
    notificationMethods: {
      push: true,
      sms: false,
      email: true,
    },
    isEnabled: true,
    createdAt: "2023-01-05T10:30:00Z",
  },
  {
    id: "2",
    commodityId: 2,
    priceThreshold: 140,
    condition: "below",
    notificationMethods: {
      push: true,
      sms: true,
      email: false,
    },
    isEnabled: false,
    createdAt: "2023-01-07T14:15:00Z",
  },
  {
    id: "3",
    commodityId: 1,
    priceThreshold: 190,
    condition: "below",
    notificationMethods: {
      push: true,
      sms: false,
      email: false,
    },
    triggered: true,
    triggeredAt: "2023-01-09T09:45:00Z",
    triggerPrice: 188,
    createdAt: "2023-01-08T16:20:00Z",
  },
]

// Sample notifications data
const sampleNotifications = [
  {
    id: "1",
    title: "Price Alert Triggered",
    message: "Wheat price has risen above your alert threshold of PKR 205.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    type: "alert",
    commodityId: 1,
  },
  {
    id: "2",
    title: "New Market Report Available",
    message: "The monthly market analysis report for agricultural commodities is now available.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    type: "system",
  },
  {
    id: "3",
    title: "Price Alert Triggered",
    message: "Rice price has fallen below your alert threshold of PKR 140.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    read: false,
    type: "alert",
    commodityId: 2,
  },
  {
    id: "4",
    title: "App Update Available",
    message: "A new version of Zameen Zarien is available with improved features and bug fixes.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    read: true,
    type: "update",
  },
  {
    id: "5",
    title: "Welcome to Zameen Zarien",
    message: "Thank you for joining Zameen Zarien. Start monitoring commodity prices and set up alerts.",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    read: true,
    type: "system",
  },
]

// Provider component
export const AppProvider = ({ children }) => {
  const { i18n } = useTranslation()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [language, setLanguage] = useState(i18n.language)
  const [selectedCommodity, setSelectedCommodity] = useState(1) // Default to Wheat
  const [selectedLocation, setSelectedLocation] = useState(1) // Default to Lahore
  const [timePeriod, setTimePeriod] = useState("week") // 'day', 'week', 'month', 'year'
  const [alerts, setAlerts] = useState(sampleAlerts)
  const [notifications, setNotifications] = useState(sampleNotifications)
  const [doNotDisturb, setDoNotDisturb] = useState(false)

  // Load user data from AsyncStorage on app start
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user")
        if (userData) {
          setUser(JSON.parse(userData))
        }

        const savedLanguage = await AsyncStorage.getItem("language")
        if (savedLanguage) {
          setLanguage(savedLanguage)
          i18n.changeLanguage(savedLanguage)
        }

        const savedAlerts = await AsyncStorage.getItem("alerts")
        if (savedAlerts) {
          setAlerts(JSON.parse(savedAlerts))
        }

        const savedNotifications = await AsyncStorage.getItem("notifications")
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications))
        }

        const dndStatus = await AsyncStorage.getItem("doNotDisturb")
        if (dndStatus) {
          setDoNotDisturb(JSON.parse(dndStatus))
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [i18n])

  // Save user data to AsyncStorage when it changes
  useEffect(() => {
    if (user) {
      AsyncStorage.setItem("user", JSON.stringify(user))
    }
  }, [user])

  // Save language preference when it changes
  useEffect(() => {
    AsyncStorage.setItem("language", language)
    i18n.changeLanguage(language)
  }, [language, i18n])

  // Save alerts when they change
  useEffect(() => {
    AsyncStorage.setItem("alerts", JSON.stringify(alerts))
  }, [alerts])

  // Save notifications when they change
  useEffect(() => {
    AsyncStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications])

  // Save Do Not Disturb status when it changes
  useEffect(() => {
    AsyncStorage.setItem("doNotDisturb", JSON.stringify(doNotDisturb))
  }, [doNotDisturb])

  // Login function
  const login = async (phoneNumber, password) => {
    // In a real app, you would make an API call to authenticate
    // For demo purposes, we'll just set a mock user
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful login
      const userData = {
        id: 1,
        phoneNumber,
        name: "Demo User",
        email: "user@example.com",
      }

      setUser(userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    try {
      // Clear user data
      await AsyncStorage.removeItem("user")
      setUser(null)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Change language
  const changeLanguage = (lang) => {
    setLanguage(lang)
  }

  // Get commodity data
  const getCommodityData = (commodityId) => {
    return samplePriceData[commodityId] || null
  }

  // Add alert
  const addAlert = (alert) => {
    const newAlert = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...alert,
    }
    setAlerts((prevAlerts) => [...prevAlerts, newAlert])
    return newAlert
  }

  // Update alert
  const updateAlert = (alertId, updatedData) => {
    setAlerts((prevAlerts) => prevAlerts.map((alert) => (alert.id === alertId ? { ...alert, ...updatedData } : alert)))
  }

  // Delete alert
  const deleteAlert = (alertId) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId))
  }

  // Toggle Do Not Disturb
  const toggleDoNotDisturb = () => {
    setDoNotDisturb((prev) => !prev)
  }

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    }
    setNotifications((prev) => [newNotification, ...prev])
    return newNotification
  }

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
  }

  // Context value
  const value = {
    user,
    isLoading,
    language,
    selectedCommodity,
    setSelectedCommodity,
    selectedLocation,
    setSelectedLocation,
    timePeriod,
    setTimePeriod,
    alerts,
    notifications,
    doNotDisturb,
    login,
    logout,
    changeLanguage,
    getCommodityData,
    addAlert,
    updateAlert,
    deleteAlert,
    toggleDoNotDisturb,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    commodities: sampleCommodities,
    locations: sampleLocations,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

