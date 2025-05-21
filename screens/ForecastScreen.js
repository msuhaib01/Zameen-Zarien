"use client";

import { useState, useEffect } from "react";
import { Platform, useWindowDimensions } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";

import Header from "../components/Header";
import WebLayout from "../components/WebLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import FilterSection from "../components/FilterSection";
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"; // Ensure SPACING is used or imported if needed by chartWidth
import { useApp } from "../context/AppContext";
import {
  getForecast,
  getPriceHistory,
  getModelPrediction,
} from "../services/cropPricesService";

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
  const parts = dateString.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const day = parseInt(parts[2], 10);

  const reconstructedDate = new Date(year, month, day);
  return (
    reconstructedDate.getFullYear() === year &&
    reconstructedDate.getMonth() === month &&
    reconstructedDate.getDate() === day
  );
};

const ForecastScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const {
    commodities,
    selectedCommodity,
    setSelectedCommodity,
    locations,
    selectedLocation,
    setSelectedLocation,
    getCommodityData,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [compareWithHistorical, setCompareWithHistorical] = useState(false);

  // Date range state
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(sevenDaysLater);
  const [startDateInput, setStartDateInput] = useState(
    formatDateForInput(today)
  );
  const [endDateInput, setEndDateInput] = useState(
    formatDateForInput(sevenDaysLater)
  );
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isWebPlatform] = useState(Platform.OS === "web");
  const [chartWidth, setChartWidth] = useState(300); // State for chart width
  // Initialize chart width
  useEffect(() => {
    let calculatedWidth;
    if (isWebPlatform) {
      // For web, we'll use onLayout to get the exact width later
      // Just set an initial value that will be updated by onLayout event
      const spacingLg = (SPACING && typeof SPACING.lg === 'number') ? SPACING.lg : 24;
      calculatedWidth = Math.max(windowWidth - (spacingLg * 2 + 40), 300);
    } else { // Mobile
      calculatedWidth = windowWidth - 40;
    }
    setChartWidth(calculatedWidth);
  }, [windowWidth, isWebPlatform]); // SPACING removed from dependency array as it's not needed


  // Commodity options
  const commodityOptions = commodities.map((commodity) => ({
    label: t("common.language") === "en" ? commodity.name : commodity.name_ur,
    value: commodity.id,
  }));

  // Location options
  const locationOptions = locations.map((location) => ({
    label: t("common.language") === "en" ? location.name : location.name_ur,
    value: location.id,
  }));

  // Load price data when selected commodity changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Calculate initial forecastDays based on the default date range
        const initialForecastDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        await loadPriceData(initialForecastDays);
      } catch (error) {
        console.error("Error loading data on initial load or commodity/location change:", error);
      }
    };

    fetchData();
  }, [selectedCommodity, selectedLocation, compareWithHistorical]); // Removed startDate, endDate from here to avoid loop with loadPriceData

  // Handle date change
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === "ios");
    setStartDate(currentDate);
    setStartDateInput(formatDateForInput(currentDate));
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === "ios");
    setEndDate(currentDate);
    setEndDateInput(formatDateForInput(currentDate));
  };

  // Handle web date input change with real-time validation and formatting
  const handleStartDateInputChange = (text) => {
    // Only allow digits and hyphens
    const sanitizedText = text.replace(/[^0-9-]/g, "");

    // Auto-format as user types (YYYY-MM-DD)
    let formattedText = sanitizedText;

    // If we have 4 digits and no hyphen yet, add one
    if (sanitizedText.length === 4 && !sanitizedText.includes("-")) {
      formattedText = sanitizedText + "-";
    }
    // If we have 7 characters and only one hyphen, add another
    else if (
      sanitizedText.length === 7 &&
      sanitizedText.split("-").length === 2
    ) {
      formattedText = sanitizedText + "-";
    }
    // Limit to 10 characters (YYYY-MM-DD)
    else if (sanitizedText.length > 10) {
      formattedText = sanitizedText.substring(0, 10);
    }

    setStartDateInput(formattedText);

    // If we have a complete date, validate it
    if (formattedText.length === 10 && validateDate(formattedText)) {
      const date = parseDateFromInput(formattedText);
      // Only update if it's a valid date and not after the end date
      if (!isNaN(date.getTime()) && date <= endDate) {
        setStartDate(date);
      }
    }
  };

  const handleEndDateInputChange = (text) => {
    // Only allow digits and hyphens
    const sanitizedText = text.replace(/[^0-9-]/g, "");

    // Auto-format as user types (YYYY-MM-DD)
    let formattedText = sanitizedText;

    // If we have 4 digits and no hyphen yet, add one
    if (sanitizedText.length === 4 && !sanitizedText.includes("-")) {
      formattedText = sanitizedText + "-";
    }
    // If we have 7 characters and only one hyphen, add another
    else if (
      sanitizedText.length === 7 &&
      sanitizedText.split("-").length === 2
    ) {
      formattedText = sanitizedText + "-";
    }
    // Limit to 10 characters (YYYY-MM-DD)
    else if (sanitizedText.length > 10) {
      formattedText = sanitizedText.substring(0, 10);
    }

    setEndDateInput(formattedText);

    // If we have a complete date, validate it
    if (formattedText.length === 10 && validateDate(formattedText)) {
      const date = parseDateFromInput(formattedText);
      // Only update if it's a valid date, after the start date
      if (!isNaN(date.getTime()) && date >= startDate) {
        setEndDate(date);
      }
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Apply the date range and fetch data
  const applyDateRange = () => {
    // We'll use the current startDate and endDate values
    // which have already been validated during input

    // Calculate forecast days based on date range
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Fetch data with the current date range
    loadPriceData(daysDiff);
  };

  // Load price data
  const loadPriceData = async (days) => {
    try {
      setIsDataLoading(true);

      // Calculate forecast days based on date range if not provided
      const forecastDays =
        days || Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      // Get commodity and location names
      const commodityName = commodities.find(
        (c) => c.id === selectedCommodity
      )?.name;
      const locationName = locations.find(
        (l) => l.id === selectedLocation
      )?.name;

      if (!commodityName || !locationName) {
        console.error("Invalid commodity or location");
        return;
      }

      // Format dates for API
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      // Get forecast data using the AI model
      let forecastData = await getModelPrediction(
        commodityName,
        locationName,
        forecastDays,
        startDate,
        endDate
      );

      // Get historical data for comparison if needed
      let historicalData = null;
      if (compareWithHistorical) {
        // Get data using the selected date range
        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];

        historicalData = await getPriceHistory(
          commodityName,
          locationName,
          formattedStartDate,
          formattedEndDate
        );
      }

      // Transform data for the UI
      const transformedData = {
        forecast: forecastData.forecast,
        history: historicalData ? historicalData.data : [],
        average: historicalData ? historicalData.stats.average : 0,
        highest: historicalData ? historicalData.stats.highest : 0,
        lowest: historicalData ? historicalData.stats.lowest : 0,
        usingModel:
          forecastData.using_model !== undefined
            ? forecastData.using_model
            : true,
        message: forecastData.message || "",
      };

      setPriceData(transformedData);
    } catch (error) {
      console.error("Error loading forecast data:", error);
      setPriceData(null);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPriceData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };
  // Format a date string as 'D Month YYYY' for tooltips
  const formatFullDate = (dateStr) => {
    const date = new Date(dateStr);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Prepare chart data
  const getChartData = () => {
    if (!priceData || !priceData.forecast || priceData.forecast.length === 0) {
      return { labels: [t("common.noData") || "N/A"], datasets: [{ data: [0] }], legend: [t("forecast.predictedPrice")] };
    }

    let forecastItems = [...priceData.forecast];
    
    // Ensure endDate and startDate are valid Date objects before calculation
    const validStartDate = startDate instanceof Date && !isNaN(startDate);
    const validEndDate = endDate instanceof Date && !isNaN(endDate);
    const forecastPeriodDays = (validStartDate && validEndDate) ? 
      Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))) : 7; // Default to 7 days if dates are invalid

    // Calculate max data points based on screen width and date range
    let MAX_DATA_POINTS;
    if (isWebPlatform) {
      const screenWidth = windowWidth;
      if (screenWidth < 500) {        // Very small screens
        MAX_DATA_POINTS = 8;
      } else if (screenWidth < 768) { // Small screens (e.g., Tailwind 'sm' to 'md')
        MAX_DATA_POINTS = 12;
      } else if (screenWidth < 1024) { // Medium screens (e.g., Tailwind 'md' to 'lg', tablets)
        MAX_DATA_POINTS = 20;
      } else if (screenWidth < 1280) { // Large screens (e.g., Tailwind 'lg' to 'xl', small desktops)
        MAX_DATA_POINTS = 25;
      } else {                         // Extra large screens (e.g., Tailwind 'xl' and up)
        MAX_DATA_POINTS = 30;
      }
    } else { // Mobile
      if (forecastPeriodDays > 365) {
        MAX_DATA_POINTS = 15;
      } else {
        MAX_DATA_POINTS = 10;
      }
    }

    // Store original data for tooltips
    const originalData = [...forecastItems];

    if (forecastItems.length > MAX_DATA_POINTS) {
      // Sample the data to get a reasonable number of points
      const step = Math.ceil(forecastItems.length / MAX_DATA_POINTS);
      const sampledData = [];
      for (let i = 0; i < forecastItems.length; i += step) {
        sampledData.push(forecastItems[i]);
      }
      // Always include the last data point
      if (sampledData[sampledData.length - 1] !== forecastItems[forecastItems.length - 1]) {
        sampledData.push(forecastItems[forecastItems.length - 1]);
      }
      forecastItems = sampledData;
    }

    // Format the dates for display based on date range and data density
    const formatChartDate = (dateStr, idx, arr) => {
      const date = new Date(dateStr);
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      
      if (arr.length <= 15) {
        // Show full date if few points
        return `${date.getDate()} ${monthNames[date.getMonth()]}`;
      } else if (arr.length <= 40) {
        // Show month/day
        return `${monthNames[date.getMonth()]}/${date.getDate()}`;
      } else {
        // Show only month for very dense data
        return `${monthNames[date.getMonth()]}`;
      }
    };

    // Add tooltips data
    const tooltipData = forecastItems.map(item => ({
      date: formatFullDate(item.date),
      price: `PKR ${item.price}`,
      rawDate: new Date(item.date)
    }));
    
    const datasets = [{
      data: forecastItems.map(item => Number(item.price) || 0),
      color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, // Green from Dashboard
      strokeWidth: 3,
    }];

    if (compareWithHistorical && priceData.history && priceData.history.length > 0) {
      const historicalDataPoints = forecastItems.map(fItem => {
        const fDateStr = new Date(fItem.date).toDateString();
        const historyMatch = priceData.history.find(hItem => new Date(hItem.date).toDateString() === fDateStr);
        return historyMatch ? (Number(historyMatch.price) || 0) : null;
      });

      if (historicalDataPoints.some(p => p !== null)) {
        datasets.push({
          data: historicalDataPoints,
          color: (opacity = 1) => COLORS.accent ? (typeof COLORS.accent === 'function' ? COLORS.accent(opacity) : `rgba(${hexToRgb(COLORS.accent)}, ${opacity})`) : `rgba(139, 0, 0, ${opacity})`, // Accent or fallback red
          strokeWidth: 3,
        });
      }
    }

    return {
      labels: forecastItems.map((item, idx, arr) => formatChartDate(item.date, idx, arr)),
      datasets,
      legend: [ // This legend is for the chart component if it renders one
        t("forecast.predictedPrice"),
        ...(compareWithHistorical && datasets.length > 1 ? [t("forecast.actualPrice")] : []),
      ],
      tooltipData: tooltipData,
      originalData: originalData,
    };
  };  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, // Dark green from Dashboard
    labelColor: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`, // Dark text from Dashboard
    style: {
      borderRadius: 16,
      // Add some padding to the left of the chart to prevent y-axis labels from being cut off
      paddingLeft: isWebPlatform ? 80 : 40, // Increased padding for both web and mobile to prevent digit cutoff
    },
    // Add left margin to y-axis labels to prevent first digit from being cut off
    yAxisLabelOffset: 10,
    propsForDots: {
      r: "5", // Consistent with Dashboard
      strokeWidth: "2",
      stroke: COLORS.primaryDark, // Consistent with Dashboard
    },
    propsForBackgroundLines: { // Added from Dashboard
      strokeWidth: 1,
      stroke: "#e0e0e0",
      strokeDasharray: "5, 5",
    },    propsForLabels: { 
      fontSize: isWebPlatform ? 12 : 10,
      fontWeight: "bold",
      fill: COLORS.text.secondary,
      dx: 5, // Add horizontal offset to labels to prevent cutoff
    },
    tooltipConfig: { 
      backgroundColor: 'rgba(255, 255, 255, 0.95)', // Consistent with Dashboard
      borderRadius: 8,
      borderColor: COLORS.border,
      borderWidth: 1,
      padding: 10,
      textColor: COLORS.text.primary, // Added for consistency
      titleColor: COLORS.primary,    // Added for consistency
      titleFontSize: 14,            // Added for consistency
      valueFontSize: 16,            // Added for consistency
      // Removed labelColor and valueColor as textColor and specific title/value styles are used
      ...SHADOWS.small,
    },
    withLegend: false, // Disable built-in legend as there's a custom one
  };

  // Helper function to convert hex to rgb (if not already global)
  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (!hex || typeof hex !== 'string') return '0,0,0'; // Fallback for invalid hex
    const shorthandRegex = /^#?([a-f\\d])([a-f\\d])([a-f\\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r1, g1, b1) => r1 + r1 + g1 + g1 + b1 + b1);
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    if (result) {
      r = parseInt(result[1], 16);
      g = parseInt(result[2], 16);
      b = parseInt(result[3], 16);
    }
    return `${r},${g},${b}`;
  };
  
  // Render content function for reuse between web and mobile
  const renderContent = () => (
    <>
      <FilterSection
        commodityOptions={commodityOptions}
        locationOptions={locationOptions}
        selectedCommodity={selectedCommodity}
        selectedLocation={selectedLocation}
        onSelectCommodity={setSelectedCommodity}
        onSelectLocation={setSelectedLocation}
        commodityLabel={t("dashboard.commodity")}
        locationLabel={t("historical.location")}
      />
    </>
  );

  // Return different layouts based on platform

  // Store chart data in a variable to call getChartData() only once per render
  const chartDisplayData = getChartData();

  return isWebPlatform ? (
    <WebLayout
      title={t("forecast.title")}
      currentScreen="Forecast"
      navigation={navigation}
    >
      <FilterSection
        commodityOptions={commodityOptions}
        locationOptions={locationOptions}
        selectedCommodity={selectedCommodity}
        selectedLocation={selectedLocation}
        onSelectCommodity={setSelectedCommodity}
        onSelectLocation={setSelectedLocation}
        commodityLabel={t("dashboard.commodity")}
        locationLabel={t("historical.location")}
      />

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
                  <Text style={styles.datePickerLabel}>
                    {t("historical.from")}
                  </Text>
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
                  <Text style={styles.datePickerLabel}>
                    {t("historical.to")}
                  </Text>
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
                <Text style={styles.optionText}>
                  {t("forecast.compareHistorical")}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>{"AI Model Prediction"}</Text>
            {priceData.message && (
              <Text style={styles.messageText}>{priceData.message}</Text>
            )}

            {chartDisplayData && chartDisplayData.labels && chartDisplayData.labels.length > 0 && chartDisplayData.datasets[0] && chartDisplayData.datasets[0].data.length > 0 && chartDisplayData.labels[0] !== (t("common.noData") || "N/A") ? (
              isWebPlatform ? (
                <View
                  style={[styles.chartWrapper, { width: '100%' }]} // Ensure wrapper takes full width for onLayout
                  onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    // Only update if width is valid and has changed to prevent infinite loops
                    if (width > 0 && width !== chartWidth) {
                      setChartWidth(width);
                    }
                  }}
                >
                  {chartWidth > 0 ? (
                    <LineChart
                      data={chartDisplayData}
                      width={chartWidth} // Use measured width
                      height={250} // Fixed height for web
                      chartConfig={{
                        ...chartConfig,
                        // Ensure color function is correctly defined for template literal
                        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                        propsForDots: {
                          r: "5",
                          strokeWidth: "2",
                          stroke: COLORS.primaryDark,
                        },
                        strokeWidth: 3,
                      }}
                      bezier
                      style={styles.chart} // Basic style, width is handled by prop
                      yAxisSuffix=" PKR"
                      yAxisInterval={1}
                      fromZero={false}
                      withDots={true}
                      withInnerLines={true}
                      withOuterLines={true}
                      withVerticalLines={true}                      withHorizontalLines={true}
                      withVerticalLabels={true}
                      withHorizontalLabels={true}
                      horizontalLabelRotation={0}
                      paddingLeft={80} // Increased padding to fix cut-off issue with digits
                      yLabelsOffset={10} // Add offset to y-axis labels to prevent first digit cutoff
                      decorator={() => (
                        <View style={styles.tooltipContainer}>
                          {isWebPlatform && (
                            <View style={styles.tooltipHint}>
                              <Ionicons name="information-circle-outline" size={16} color={COLORS.info || COLORS.primary} />
                              <Text style={styles.tooltipHintText}>
                                {t("dashboard.hoverForDetails") || "Hover for details"}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}                      onDataPointClick={({ value, index }) => {
                        if (chartDisplayData.tooltipData && chartDisplayData.tooltipData[index]) {
                          const tooltipItem = chartDisplayData.tooltipData[index];
                          // Show tooltip data in alert - avoid newline character
                          alert(`${tooltipItem.date} - ${tooltipItem.price}`);
                        }
                      }}
                    />
                  ) : (
                    // Show a loader or placeholder while width is being measured
                    <View style={{ height: 250, justifyContent: 'center', alignItems: 'center' }}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                  )}
                </View>
              ) : (
                // Mobile platform
                <View style={styles.chartWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ 
                      minWidth: chartDisplayData.labels && chartDisplayData.labels.length > 0 
                                ? Math.max(windowWidth - 40, chartDisplayData.labels.length * 40) 
                                : windowWidth - 40 
                    }}
                    style={{ width: '100%' }}
                  >
                    <LineChart
                      data={chartDisplayData}
                      width={
                        chartDisplayData.labels && chartDisplayData.labels.length > 0
                          ? Math.max(windowWidth - 40, chartDisplayData.labels.length * 40)
                          : windowWidth - 40
                      }
                      height={220} // Mobile height
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                        propsForDots: {
                          r: "5",
                          strokeWidth: "2",
                          stroke: COLORS.primaryDark,
                        },
                        strokeWidth: 3,
                      }}
                      bezier
                      style={[
                        styles.chart, 
                        { 
                          minWidth: chartDisplayData.labels && chartDisplayData.labels.length > 0 
                                    ? Math.max(windowWidth - 40, chartDisplayData.labels.length * 40) 
                                    : windowWidth - 40 
                        }
                      ]}
                      yAxisSuffix=" PKR"
                      yAxisInterval={1}
                      fromZero={false}
                      withDots={true}
                      withInnerLines={true}
                      withOuterLines={true}
                      withVerticalLines={true}
                      withHorizontalLines={true}
                      withVerticalLabels={true}                      withHorizontalLabels={true}                      horizontalLabelRotation={30} // Mobile rotation
                      paddingLeft={40} // Added left padding for mobile to prevent digit cutoff
                      yLabelsOffset={10} // Add offset to y-axis labels to prevent first digit cutoff
                      onDataPointClick={({ value, index }) => {
                        if (chartDisplayData.tooltipData && chartDisplayData.tooltipData[index]) {
                          const tooltipItem = chartDisplayData.tooltipData[index];
                          alert(`${tooltipItem.date} - ${tooltipItem.price}`);
                        }
                      }}
                    />
                  </ScrollView>
                </View>
              )
            ) : (
              <View style={{height: 220, justifyContent: 'center', alignItems: 'center', ...styles.chart}}>
                <Text>{chartDisplayData && chartDisplayData.labels ? chartDisplayData.labels[0] : (t("common.loading") || "Loading...")}</Text>
              </View>
            )}

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: COLORS.primary },
                  ]}
                />
                <Text style={styles.legendText}>
                  {t("forecast.predictedPrice")}
                </Text>
              </View>

              {compareWithHistorical && (
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: COLORS.accent },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {t("forecast.actualPrice")}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          <View style={styles.forecastDetailsCard}>
            <Text style={styles.forecastDetailsTitle}>
              {t("forecast.forecastDetails")}
            </Text>

            <View style={styles.forecastDetailsTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>{t("common.date")}</Text>
                <Text style={styles.tableHeaderCell}>
                  {t("forecast.predictedPrice")}
                </Text>
                {compareWithHistorical && priceData.history && (
                  <Text style={styles.tableHeaderCell}>
                    {t("forecast.actualPrice")}
                  </Text>
                )}
              </View>

              {priceData.forecast
                .slice(
                  0,
                  Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                )
                .map((item, index) => {
                  // Find matching historical data for this date if comparing
                  const historicalItem =
                    compareWithHistorical && priceData.history
                      ? priceData.history.find(
                          (h) =>
                            new Date(h.date).toDateString() ===
                            new Date(item.date).toDateString()
                        )
                      : null;

                  return (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.tableCell}>PKR {item.price}</Text>
                      {compareWithHistorical && priceData.history && (
                        <Text style={styles.tableCell}>
                          {historicalItem ? `PKR ${historicalItem.price}` : "-"}
                        </Text>
                      )}
                    </View>
                  );
                })}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      )}
    </WebLayout>
  ) : (
    <SafeAreaView style={styles.container}>
      <Header title={t("forecast.title")} showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <FilterSection
          commodityOptions={commodityOptions}
          locationOptions={locationOptions}
          selectedCommodity={selectedCommodity}
          selectedLocation={selectedLocation}
          onSelectCommodity={setSelectedCommodity}
          onSelectLocation={setSelectedLocation}
          commodityLabel={t("dashboard.commodity")}
          locationLabel={t("historical.location")}
        />

        {priceData ? (
          <>
            <Card style={styles.forecastCard}>
              <Text style={styles.cardTitle}>
                {t("common.language") === "en"
                  ? commodities.find((c) => c.id === selectedCommodity)?.name
                  : commodities.find((c) => c.id === selectedCommodity)
                      ?.name_ur}
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
                    <Text style={styles.datePickerLabel}>
                      {t("historical.from")}
                    </Text>
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
                    <Text style={styles.datePickerLabel}>
                      {t("historical.to")}
                    </Text>
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
                  onPress={() =>
                    setCompareWithHistorical(!compareWithHistorical)
                  }
                >
                  <Ionicons
                    name={compareWithHistorical ? "checkbox" : "square-outline"}
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={styles.optionText}>
                    {t("forecast.compareHistorical")}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>{"AI Model Prediction"}</Text>
              {priceData.message && (
                <Text style={styles.messageText}>{priceData.message}</Text>
              )}

              {chartDisplayData && chartDisplayData.labels && chartDisplayData.labels.length > 0 && chartDisplayData.datasets[0] && chartDisplayData.datasets[0].data.length > 0 && chartDisplayData.labels[0] !== (t("common.noData") || "N/A") ? (
                <View style={styles.chartWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ 
                      minWidth: chartDisplayData.labels && chartDisplayData.labels.length > 0 
                                ? Math.max(windowWidth - 40, chartDisplayData.labels.length * 40) 
                                : windowWidth - 40 
                    }}
                    style={{ width: '100%' }}
                  >
                    <LineChart
                      data={chartDisplayData}
                      width={
                        chartDisplayData.labels && chartDisplayData.labels.length > 0
                          ? Math.max(windowWidth - 40, chartDisplayData.labels.length * 40)
                          : windowWidth - 40
                      }
                      height={220}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                        propsForDots: {
                          r: "5",
                          strokeWidth: "2",
                          stroke: COLORS.primaryDark,
                        },
                        strokeWidth: 3,
                      }}
                      bezier
                      style={[
                        styles.chart, 
                        { 
                          minWidth: chartDisplayData.labels && chartDisplayData.labels.length > 0 
                                    ? Math.max(windowWidth - 40, chartDisplayData.labels.length * 40) 
                                    : windowWidth - 40 
                        }
                      ]}
                      yAxisSuffix=" PKR"
                      yAxisInterval={1}
                      fromZero={false}
                      withDots={true}
                      withInnerLines={true}
                      withOuterLines={true}
                      withVerticalLines={true}
                      withHorizontalLines={true}
                      withVerticalLabels={true}
                      withHorizontalLabels={true}
                      horizontalLabelRotation={30}                      onDataPointClick={({ value, index }) => {
                        if (chartDisplayData.tooltipData && chartDisplayData.tooltipData[index]) {
                          const tooltipItem = chartDisplayData.tooltipData[index];
                          alert(`${tooltipItem.date} - ${tooltipItem.price}`);
                        }
                      }}
                    />
                  </ScrollView>
                </View>
              ) : (
                <View style={{height: 220, justifyContent: 'center', alignItems: 'center', ...styles.chart}}>
                  <Text>{chartDisplayData && chartDisplayData.labels ? chartDisplayData.labels[0] : (t("common.loading") || "Loading...")}</Text>
                </View>
              )}

              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: COLORS.primary },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {t("forecast.predictedPrice")}
                  </Text>
                </View>

                {compareWithHistorical && (
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: COLORS.accent },
                      ]}
                    />
                    <Text style={styles.legendText}>
                      {t("forecast.actualPrice")}
                    </Text>
                  </View>
                )}
              </View>
            </Card>

            <View style={styles.forecastDetailsCard}>
              <Text style={styles.forecastDetailsTitle}>
                {t("forecast.forecastDetails")}
              </Text>

              <View style={styles.forecastDetailsTable}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderCell}>{t("common.date")}</Text>
                  <Text style={styles.tableHeaderCell}>
                    {t("forecast.predictedPrice")}
                  </Text>
                  {compareWithHistorical && priceData.history && (
                    <Text style={styles.tableHeaderCell}>
                      {t("forecast.actualPrice")}
                    </Text>
                  )}
                </View>

                {priceData.forecast
                  .slice(
                    0,
                    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                  )
                  .map((item, index) => {
                    // Find matching historical data for this date if comparing
                    const historicalItem =
                      compareWithHistorical && priceData.history
                        ? priceData.history.find(
                            (h) =>
                              new Date(h.date).toDateString() ===
                              new Date(item.date).toDateString()
                          )
                        : null;

                    return (
                      <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCell}>
                          {new Date(item.date).toLocaleDateString()}
                        </Text>
                        <Text style={styles.tableCell}>PKR {item.price}</Text>
                        {compareWithHistorical && priceData.history && (
                          <Text style={styles.tableCell}>
                            {historicalItem
                              ? `PKR ${historicalItem.price}`
                              : "-"}
                          </Text>
                        )}
                      </View>
                    );
                  })}
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
  );
};

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
    fontStyle: "italic",
  },
  chartWrapper: {
    marginVertical: SPACING.medium,
    width: '100%',
    position: 'relative',
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
  tooltipContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  tooltipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tooltipHintText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
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
});

export default ForecastScreen;
