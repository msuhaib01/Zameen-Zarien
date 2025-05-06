"use client"

import { useState, useEffect } from "react"
import { Platform } from "react-native"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView, TextInput, ActivityIndicator } from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"

import Header from "../components/Header"
import Card from "../components/Card"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import { COLORS, FONT, SPACING } from "../theme"
import { useApp } from "../context/AppContext"
import { getForecast, getPriceHistory, getModelPrediction } from "../services/cropPricesService"

const screenWidth = Dimensions.get("window").width

// Format date for input field (YYYY-MM-DD)
const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

// Parse date from input field
const parseDateFromInput = (dateString) => {
  if (!dateString) return new Date();
  try {
    const [year, month, day] = dateString
      .split("-")
      .map((num) => parseInt(num, 10));
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date();
  }
};

// Date validation function
const validateDate = (dateString) => {
  // Check if the date string matches YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  // Check if the date is valid
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (isNaN(timestamp)) return false;

  // Check if the date components match the input
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const day = parseInt(parts[2], 10);

  const reconstructedDate = new Date(year, month, day);
  return reconstructedDate.getFullYear() === year &&
         reconstructedDate.getMonth() === month &&
         reconstructedDate.getDate() === day;
};

const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.41,
    shadowRadius: 9.11,

    elevation: 14,
  },
}

const ForecastScreen = ({ navigation }) => {
  const { t } = useTranslation()
  const { commodities, selectedCommodity, setSelectedCommodity, locations, selectedLocation, setSelectedLocation, getCommodityData } = useApp()

  const [refreshing, setRefreshing] = useState(false)
  const [priceData, setPriceData] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [compareWithHistorical, setCompareWithHistorical] = useState(false)
  const [useModel, setUseModel] = useState(true)

  // Date range state
  const today = new Date()
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)

  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(sevenDaysLater)
  const [startDateInput, setStartDateInput] = useState(formatDateForInput(today))
  const [endDateInput, setEndDateInput] = useState(formatDateForInput(sevenDaysLater))
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [isWebPlatform] = useState(Platform.OS === "web")

  // Commodity options
  const commodityOptions = commodities.map((commodity) => ({
    label: t("common.language") === "en" ? commodity.name : commodity.name_ur,
    value: commodity.id,
  }))

  // Location options
  const locationOptions = locations.map((location) => ({
    label: t("common.language") === "en" ? location.name : location.name_ur,
    value: location.id,
  }))

  // Load price data when selected commodity changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadPriceData()
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    fetchData()
  }, [selectedCommodity, selectedLocation, compareWithHistorical, useModel])

  // Handle date change
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate
    setShowStartDatePicker(Platform.OS === "ios")
    setStartDate(currentDate)
    setStartDateInput(formatDateForInput(currentDate))
  }

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate
    setShowEndDatePicker(Platform.OS === "ios")
    setEndDate(currentDate)
    setEndDateInput(formatDateForInput(currentDate))
  }

  // Handle web date input change with real-time validation and formatting
  const handleStartDateInputChange = (text) => {
    // Only allow digits and hyphens
    const sanitizedText = text.replace(/[^0-9-]/g, '')

    // Auto-format as user types (YYYY-MM-DD)
    let formattedText = sanitizedText

    // If we have 4 digits and no hyphen yet, add one
    if (sanitizedText.length === 4 && !sanitizedText.includes('-')) {
      formattedText = sanitizedText + '-'
    }
    // If we have 7 characters and only one hyphen, add another
    else if (sanitizedText.length === 7 && sanitizedText.split('-').length === 2) {
      formattedText = sanitizedText + '-'
    }
    // Limit to 10 characters (YYYY-MM-DD)
    else if (sanitizedText.length > 10) {
      formattedText = sanitizedText.substring(0, 10)
    }

    setStartDateInput(formattedText)

    // If we have a complete date, validate it
    if (formattedText.length === 10 && validateDate(formattedText)) {
      const date = parseDateFromInput(formattedText)
      // Only update if it's a valid date and not after the end date
      if (!isNaN(date.getTime()) && date <= endDate) {
        setStartDate(date)
      }
    }
  }

  const handleEndDateInputChange = (text) => {
    // Only allow digits and hyphens
    const sanitizedText = text.replace(/[^0-9-]/g, '')

    // Auto-format as user types (YYYY-MM-DD)
    let formattedText = sanitizedText

    // If we have 4 digits and no hyphen yet, add one
    if (sanitizedText.length === 4 && !sanitizedText.includes('-')) {
      formattedText = sanitizedText + '-'
    }
    // If we have 7 characters and only one hyphen, add another
    else if (sanitizedText.length === 7 && sanitizedText.split('-').length === 2) {
      formattedText = sanitizedText + '-'
    }
    // Limit to 10 characters (YYYY-MM-DD)
    else if (sanitizedText.length > 10) {
      formattedText = sanitizedText.substring(0, 10)
    }

    setEndDateInput(formattedText)

    // If we have a complete date, validate it
    if (formattedText.length === 10 && validateDate(formattedText)) {
      const date = parseDateFromInput(formattedText)
      // Only update if it's a valid date, after the start date
      if (!isNaN(date.getTime()) && date >= startDate) {
        setEndDate(date)
      }
    }
  }

  // Format date for display
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  // Apply the date range and fetch data
  const applyDateRange = () => {
    // We'll use the current startDate and endDate values
    // which have already been validated during input

    // Calculate forecast days based on date range
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

    // Fetch data with the current date range
    loadPriceData(daysDiff)
  }

  // Load price data
  const loadPriceData = async (days) => {
    try {
      setIsDataLoading(true)

      // Calculate forecast days based on date range if not provided
      const forecastDays = days || Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

      // Get commodity and location names
      const commodityName = commodities.find(c => c.id === selectedCommodity)?.name
      const locationName = locations.find(l => l.id === selectedLocation)?.name

      if (!commodityName || !locationName) {
        console.error("Invalid commodity or location")
        return
      }

      // Get forecast data - either using the model or simple linear prediction
      let forecastData;
      if (useModel) {
        // Use the trained model for prediction
        forecastData = await getModelPrediction(commodityName, locationName, forecastDays)
      } else {
        // Use simple linear prediction
        forecastData = await getForecast(commodityName, locationName, forecastDays, false)
      }

      // Get historical data for comparison if needed
      let historicalData = null
      if (compareWithHistorical) {
        // Get data using the selected date range
        const formattedStartDate = startDate.toISOString().split('T')[0]
        const formattedEndDate = endDate.toISOString().split('T')[0]

        historicalData = await getPriceHistory(
          commodityName,
          locationName,
          formattedStartDate,
          formattedEndDate
        )
      }

      // Transform data for the UI
      const transformedData = {
        forecast: forecastData.forecast,
        history: historicalData ? historicalData.data : [],
        average: historicalData ? historicalData.stats.average : 0,
        highest: historicalData ? historicalData.stats.highest : 0,
        lowest: historicalData ? historicalData.stats.lowest : 0,
        usingModel: forecastData.using_model !== undefined ? forecastData.using_model : useModel,
        message: forecastData.message || ''
      }

      setPriceData(transformedData)
    } catch (error) {
      console.error("Error loading forecast data:", error)
      setPriceData(null)
    } finally {
      setIsDataLoading(false)
    }
  }

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadPriceData()
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  // Prepare chart data
  const getChartData = () => {
    if (!priceData || !priceData.forecast) return null

    // Calculate forecast days based on date range
    const forecastDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

    // Get forecast data based on selected days
    const forecastData = priceData.forecast.slice(0, forecastDays)

    // Prepare datasets
    const datasets = [
      {
        data: forecastData.map((item) => item.price),
        color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`, // Dark green
        strokeWidth: 2,
      },
    ]

    // Add historical data if enabled
    if (compareWithHistorical && priceData.history) {
      const historicalData = priceData.history.slice(-forecastDays)
      datasets.push({
        data: historicalData.map((item) => item.price),
        color: (opacity = 1) => `rgba(139, 0, 0, ${opacity})`, // Dark red
        strokeWidth: 2,
      })
    }

    return {
      labels: forecastData.map((item) => {
        const date = new Date(item.date)
        return `${date.getDate()}/${date.getMonth() + 1}`
      }),
      datasets,
      legend: [
        t("forecast.predictedPrice"),
        ...(compareWithHistorical ? [t("historical.title")] : []),
      ],
    }
  }

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: COLORS.primary,
    },
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("forecast.title")} showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.filtersContainer}>
          <Dropdown
            label={t("dashboard.commodity")}
            data={commodityOptions}
            value={selectedCommodity}
            onSelect={setSelectedCommodity}
            style={styles.dropdown}
          />

          <Dropdown
            label={t("historical.location")}
            data={locationOptions}
            value={selectedLocation}
            onSelect={setSelectedLocation}
            style={styles.dropdown}
          />
        </View>

        {priceData ? (
          <>
            <Card style={styles.forecastCard}>
              <Text style={styles.cardTitle}>
                {t("common.language") === "en"
                  ? commodities.find((c) => c.id === selectedCommodity)?.name
                  : commodities.find((c) => c.id === selectedCommodity)?.name_ur}
                {" - "}
                {t("common.language") === "en"
                  ? locations.find((l) => l.id === selectedLocation)?.name
                  : locations.find((l) => l.id === selectedLocation)?.name_ur}
              </Text>

              <View style={styles.dateRangeContainer}>
                <Text style={styles.dateRangeTitle}>
                  {t("forecast.forecastDateRange") || "Forecast Date Range"}
                </Text>

                <View style={styles.datePickersContainer}>
                  <View style={styles.datePicker}>
                    <Text style={styles.datePickerLabel}>{t("historical.from")}</Text>
                    {isWebPlatform ? (
                      <TextInput
                        style={styles.datePickerInput}
                        value={startDateInput}
                        onChangeText={handleStartDateInputChange}
                        placeholder="YYYY-MM-DD"
                        keyboardType="numeric"
                        maxLength={10}
                        autoComplete="off"
                        autoCorrect={false}
                      />
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.datePickerButton}
                          onPress={() => setShowStartDatePicker(true)}
                        >
                          <Text style={styles.datePickerButtonText}>
                            {formatDate(startDate)}
                          </Text>
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={COLORS.primary}
                          />
                        </TouchableOpacity>

                        {showStartDatePicker && (
                          <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={onStartDateChange}
                            maximumDate={endDate}
                          />
                        )}
                      </>
                    )}
                  </View>

                  <View style={styles.datePicker}>
                    <Text style={styles.datePickerLabel}>{t("historical.to")}</Text>
                    {isWebPlatform ? (
                      <TextInput
                        style={styles.datePickerInput}
                        value={endDateInput}
                        onChangeText={handleEndDateInputChange}
                        placeholder="YYYY-MM-DD"
                        keyboardType="numeric"
                        maxLength={10}
                        autoComplete="off"
                        autoCorrect={false}
                      />
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.datePickerButton}
                          onPress={() => setShowEndDatePicker(true)}
                        >
                          <Text style={styles.datePickerButtonText}>
                            {formatDate(endDate)}
                          </Text>
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={COLORS.primary}
                          />
                        </TouchableOpacity>

                        {showEndDatePicker && (
                          <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="default"
                            onChange={onEndDateChange}
                            minimumDate={startDate}
                          />
                        )}
                      </>
                    )}
                  </View>
                </View>

                <Button
                  title={t("common.apply") || "Apply"}
                  onPress={applyDateRange}
                  style={styles.applyButton}
                  loading={isDataLoading}
                />
              </View>

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => setCompareWithHistorical(!compareWithHistorical)}
                >
                  <Ionicons
                    name={compareWithHistorical ? "checkbox" : "square-outline"}
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={styles.optionText}>{t("forecast.compareHistorical")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => setUseModel(!useModel)}
                >
                  <Ionicons
                    name={useModel ? "checkbox" : "square-outline"}
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={styles.optionText}>Use AI Model for Prediction</Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                {priceData.usingModel ? "AI Model Prediction" : t("forecast.predictedPrice")}
              </Text>
              {priceData.message && (
                <Text style={styles.messageText}>{priceData.message}</Text>
              )}

              {getChartData() && (
                <LineChart
                  data={getChartData()}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              )}

              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.legendText}>{t("forecast.predictedPrice")}</Text>
                </View>

                {compareWithHistorical && (
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: COLORS.accent }]} />
                    <Text style={styles.legendText}>{t("historical.title")}</Text>
                  </View>
                )}
              </View>
            </Card>

            <View style={styles.forecastDetailsCard}>
              <Text style={styles.forecastDetailsTitle}>{t("forecast.forecastDetails")}</Text>

              <View style={styles.forecastDetailsTable}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderCell}>{t("common.date")}</Text>
                  <Text style={styles.tableHeaderCell}>{t("forecast.predictedPrice")}</Text>
                </View>

                {priceData.forecast.slice(0, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))).map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{new Date(item.date).toLocaleDateString()}</Text>
                    <Text style={styles.tableCell}>PKR {item.price}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.large,
  },
  filtersContainer: {
    marginBottom: SPACING.medium,
  },
  dropdown: {
    marginBottom: SPACING.medium,
  },
  forecastCard: {
    marginBottom: SPACING.large,
  },
  cardTitle: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    textAlign: "center",
    color: COLORS.text.primary,
  },
  dateRangeContainer: {
    marginBottom: SPACING.large,
  },
  dateRangeTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.medium,
    textAlign: "center",
  },
  datePickersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.medium,
  },
  datePicker: {
    flex: 1,
    marginHorizontal: SPACING.small,
  },
  datePickerLabel: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
    marginBottom: SPACING.small,
  },
  datePickerInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    fontSize: FONT.sizes.medium,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  datePickerButtonText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
  applyButton: {
    marginTop: SPACING.small,
    backgroundColor: COLORS.primary,
  },
  optionsContainer: {
    marginBottom: SPACING.medium,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  optionText: {
    marginLeft: SPACING.small,
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
  chartCard: {
    marginBottom: SPACING.large,
  },
  chartTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    marginBottom: SPACING.small,
    color: COLORS.text.primary,
  },
  messageText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
    marginBottom: SPACING.medium,
    fontStyle: 'italic',
  },
  chart: {
    marginVertical: SPACING.medium,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.small,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.large,
    marginBottom: SPACING.small,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.small,
  },
  legendText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
  },
  forecastDetailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.large,
    marginBottom: SPACING.large,
    ...SHADOWS.medium,
  },
  forecastDetailsTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    color: COLORS.text.primary,
  },
  forecastDetailsTable: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.background.tertiary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.small,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.text.primary,
    fontSize: FONT.sizes.small,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.small,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    color: COLORS.text.primary,
    fontSize: FONT.sizes.small,
  },
  loadingContainer: {
    padding: SPACING.xxl,
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONT.sizes.large,
    color: COLORS.text.secondary,
  },
})

export default ForecastScreen

