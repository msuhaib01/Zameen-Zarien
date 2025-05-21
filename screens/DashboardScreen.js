"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  TextInput,
  useWindowDimensions,
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
import GridContainer from "../components/GridContainer";
import { COLORS, FONT, SPACING, SHADOWS } from "../theme";
import { useApp } from "../context/AppContext";
import {
  getPriceHistory,
  checkApiAvailability,
} from "../services/cropPricesService";

// We'll use useWindowDimensions hook for responsive sizing

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

const DashboardScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    commodities,
    selectedCommodity,
    setSelectedCommodity,
    locations,
    selectedLocation,
    setSelectedLocation,
    timePeriod,
    setTimePeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    getCommodityData,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [startDateInput, setStartDateInput] = useState(
    formatDateForInput(startDate)
  );
  const [endDateInput, setEndDateInput] = useState(formatDateForInput(endDate));
  const [isWebPlatform] = useState(Platform.OS === "web");
  const windowDimensions = useWindowDimensions();
  const [measuredChartWrapperWidth, setMeasuredChartWrapperWidth] = useState(0);

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

  // Check API availability when component mounts
  useEffect(() => {
    const checkApi = async () => {
      const result = await checkApiAvailability();
      setIsApiAvailable(result.available);

      if (!result.available) {
        console.error("API is not available:", result.error);
        alert(t("errors.apiNotAvailable", { error: result.error }));
      }
    };

    // Set initial date range to 2023 for better chance of having data
    const end = new Date(2023, 11, 31); // December 31, 2023
    const start = new Date(2023, 0, 1); // January 1, 2023
    setStartDate(start);
    setEndDate(end);
    setStartDateInput(formatDateForInput(start));
    setEndDateInput(formatDateForInput(end));

    checkApi();
  }, []);

  // Load price data when selected commodity or location changes
  useEffect(() => {
    if (isApiAvailable) {
      loadPriceData();
    } else {
      // Use sample data if API is not available
      const data = getCommodityData(selectedCommodity);
      setPriceData(data);
    }
  }, [selectedCommodity, selectedLocation, isApiAvailable]);

  // Load price data
  const loadPriceData = async () => {
    try {
      setIsDataLoading(true);

      // Check if API is available
      if (!isApiAvailable) {
        console.warn("API is not available, using sample data");
        const data = getCommodityData(selectedCommodity);
        setPriceData(data);
        return;
      }

      // Get commodity and location names
      const commodityName = commodities.find(
        (c) => c.id === selectedCommodity
      )?.name;
      const locationName = locations.find(
        (l) => l.id === selectedLocation
      )?.name;

      if (!commodityName || !locationName) {
        throw new Error("Selected commodity or location not found");
      }

      // Fetch data from API
      const data = await getPriceHistory(
        commodityName,
        locationName,
        startDate,
        endDate
      );

      // Transform data for display
      const transformedData = {
        current: data.stats.current || 0,
        highest: data.stats.highest || 0,
        lowest: data.stats.lowest || 0,
        average: data.stats.average || 0,
        history: data.data || [],
      };

      // Check if we have data
      if (transformedData.history.length === 0) {
        console.warn("No price data available for the selected criteria");
        // Show a message to the user, but don't use alert as it's disruptive
        console.log(
          `No data available for ${commodityName} in ${locationName} from ${formatDate(
            startDate
          )} to ${formatDate(endDate)}`
        );

        // We'll still set the data, but the chart will show a "No data available" message
      }

      setPriceData(transformedData);
    } catch (error) {
      console.error("Error loading price data:", error);

      // Show a more user-friendly error message
      alert(t("errors.dataLoadFailed", { error: error.message }));

      // Fallback to sample data on error
      const data = getCommodityData(selectedCommodity);
      setPriceData(data);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Apply the date range and fetch data
  const applyDateRange = () => {
    // We'll use the current startDate and endDate values
    // which have already been validated during input

    // Fetch data with the current date range
    loadPriceData();
  };

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
    const sanitizedText = text.replace(/[^0-9-]/g, '');

    // Auto-format as user types (YYYY-MM-DD)
    let formattedText = sanitizedText;

    // If we have 4 digits and no hyphen yet, add one
    if (sanitizedText.length === 4 && !sanitizedText.includes('-')) {
      formattedText = sanitizedText + '-';
    }
    // If we have 7 characters and only one hyphen, add another
    else if (sanitizedText.length === 7 && sanitizedText.split('-').length === 2) {
      formattedText = sanitizedText + '-';
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
    const sanitizedText = text.replace(/[^0-9-]/g, '');

    // Auto-format as user types (YYYY-MM-DD)
    let formattedText = sanitizedText;

    // If we have 4 digits and no hyphen yet, add one
    if (sanitizedText.length === 4 && !sanitizedText.includes('-')) {
      formattedText = sanitizedText + '-';
    }
    // If we have 7 characters and only one hyphen, add another
    else if (sanitizedText.length === 7 && sanitizedText.split('-').length === 2) {
      formattedText = sanitizedText + '-';
    }
    // Limit to 10 characters (YYYY-MM-DD)
    else if (sanitizedText.length > 10) {
      formattedText = sanitizedText.substring(0, 10);
    }

    setEndDateInput(formattedText);

    // If we have a complete date, validate it
    if (formattedText.length === 10 && validateDate(formattedText)) {
      const date = parseDateFromInput(formattedText);
      // Only update if it's a valid date, after the start date, and not in the future
      if (!isNaN(date.getTime()) && date >= startDate && date <= new Date()) {
        setEndDate(date);
      }
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return ""; // Ensure date is not null or undefined
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Format date for display on mobile (D/M/YY)
  const formatMobileDate = (date) => {
    if (!date) return ""; // Ensure date is not null or undefined
    return `${date.getDate()}/${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`;
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // Check API availability on refresh
      const apiStatus = await checkApiAvailability();
      setIsApiAvailable(apiStatus.available);

      if (apiStatus.available) {
        // If API is available, load fresh data
        await loadPriceData();
      } else {
        // If API is not available, show message and use sample data
        console.warn("API is not available on refresh, using sample data");
        alert(t("errors.apiNotAvailable", { error: apiStatus.error }));
        const data = getCommodityData(selectedCommodity);
        setPriceData(data);
      }
    } catch (error) {
      console.error("Error during refresh:", error);
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
    if (!priceData || !priceData.history || priceData.history.length === 0)
      return null;

    // Get all data points from the selected date range
    let chartData = [...priceData.history];

    // Calculate max data points based on screen width and date range
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Adjust max data points based on screen width
    let MAX_DATA_POINTS;
    if (isWebPlatform) {
      const screenWidth = windowDimensions.width;
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
      // The previous logic that effectively increased MAX_DATA_POINTS for longer date ranges (daysDiff > 365)
      // (e.g., basePoints * 2) has been removed, as it likely contributed to the "squished" look.
      // Now, MAX_DATA_POINTS is primarily determined by the available screen width for better visual comfort.
    } else {
      // For mobile, also adjusted to be slightly more conservative with points.
      if (daysDiff > 365) {
        MAX_DATA_POINTS = 15; // Previously 20
      } else {
        MAX_DATA_POINTS = 10; // Previously 12
      }
    }

    // Store original data for tooltips
    const originalData = [...chartData];

    if (chartData.length > MAX_DATA_POINTS) {
      // Sample the data to get a reasonable number of points
      const step = Math.ceil(chartData.length / MAX_DATA_POINTS);
      const sampledData = [];
      for (let i = 0; i < chartData.length; i += step) {
        sampledData.push(chartData[i]);
      }
      // Always include the last data point
      if (
        sampledData[sampledData.length - 1] !== chartData[chartData.length - 1]
      ) {
        sampledData.push(chartData[chartData.length - 1]);
      }
      chartData = sampledData;
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
        // Show only month or year for very dense data
        return `${monthNames[date.getMonth()]}`;
      }
    };

    // Add tooltips data
    const tooltipData = chartData.map(item => ({
      date: formatFullDate(item.date),
      price: `PKR ${item.price}`,
      rawDate: new Date(item.date)
    }));

    return {
      labels: chartData.map((item, idx, arr) => formatChartDate(item.date, idx, arr)),
      datasets: [
        {
          data: chartData.map((item) => item.price),
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, // Dark green
          strokeWidth: 3,
        },
      ],
      legend: [t("dashboard.priceHistory")],
      tooltipData: tooltipData,
      originalData: originalData,
    };
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, // Dark green color
    labelColor: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,    style: {
      borderRadius: 16,
      // Add some padding to the left of the chart to prevent y-axis labels from being cut off
      paddingLeft: isWebPlatform ? 80 : 40, // Increased padding for both web and mobile to prevent digit cutoff
    },
    // Add left margin to y-axis labels to prevent first digit from being cut off
    yAxisLabelOffset: 10,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: COLORS.primaryDark,
    },
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "#e0e0e0",
      strokeDasharray: "5, 5",
    },    propsForLabels: {
      fontSize: isWebPlatform ? 12 : 10,
      fontWeight: "bold",
      fill: COLORS.text.secondary,
      // Add a small x offset to push labels slightly to the right to prevent cutoff
      dx: 5, 
    },
    // Add tooltip configuration
    tooltipConfig: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 8,
      borderColor: COLORS.border,
      borderWidth: 1,
      padding: 10,
      textColor: COLORS.text.primary,
      titleColor: COLORS.primary,
      titleFontSize: 14,
      valueFontSize: 16,
      ...SHADOWS.small,
    },
  };

  // Determine the content to render
  const renderContent = () => {
    const chartDisplayData = getChartData(); // Calculate chart data once

    return (
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
        style={styles.filtersCard}
      />

      <Card style={styles.dateRangeCard} variant="default" shadow="subtle">
        <View style={styles.dateRangeHeader}>
          <Text style={styles.dateRangeTitle}>{t("historical.dateRange")}</Text>
          <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
        </View>

        <View style={styles.datePickersContainer}>
          <View style={styles.datePicker}>
            <Text style={styles.datePickerLabel}>{t("historical.from")}</Text>
            {isWebPlatform ? (
              <View style={styles.dateInputWrapper}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={styles.dateInputIcon} />
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
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={styles.dateButtonIcon} />
                  <Text style={styles.datePickerButtonText}>
                    {formatDate(startDate)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.gray} />
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
              <View style={styles.dateInputWrapper}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={styles.dateInputIcon} />
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
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={styles.dateButtonIcon} />
                  <Text style={styles.datePickerButtonText}>
                    {formatDate(endDate)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.gray} />
                </TouchableOpacity>

                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={onEndDateChange}
                    minimumDate={startDate}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={applyDateRange}
          activeOpacity={0.8}
          disabled={isDataLoading}
        >
          <View style={styles.applyButtonContent}>
            {isDataLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="search-outline" size={18} color={COLORS.white} style={styles.applyButtonIcon} />
                <Text style={styles.applyButtonText}>
                  {t("common.apply") || "Apply"}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Card>

      {isDataLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : priceData ? (
        <>
          <Card
            style={styles.priceCard}
            variant="default"
            shadow="large"
          >
            {/* Header section with commodity and location */}
            <View style={styles.priceCardHeader}>
              <Text style={styles.commodityName}>
                {t("common.language") === "en"
                  ? commodities.find((c) => c.id === selectedCommodity)?.name
                  : commodities.find((c) => c.id === selectedCommodity)
                      ?.name_ur}
                {" - "}
                {t("common.language") === "en"
                  ? locations.find((l) => l.id === selectedLocation)?.name
                  : locations.find((l) => l.id === selectedLocation)?.name_ur}
              </Text>

              <Text
                style={styles.dateRangeInfo}
                numberOfLines={1}
                adjustsFontSizeToFit={!isWebPlatform}
                ellipsizeMode="tail"
              >
                {isWebPlatform ? formatDate(startDate) : formatMobileDate(startDate)} - {isWebPlatform ? formatDate(endDate) : formatMobileDate(endDate)}
              </Text>
            </View>

            {/* Current price with highlight */}
            <View style={styles.currentPriceWrapper}>
              <View style={styles.currentPriceContainer}>
                <Text style={styles.currentPriceLabel}>
                  {t("dashboard.currentPrice")}
                </Text>
                <Text style={styles.currentPriceValue}>
                  PKR {priceData.current}
                </Text>
              </View>
            </View>

            {/* Price metrics in cards */}
            <View style={styles.priceMetricsContainer}>
              <View style={styles.priceMetric}>
                <View style={[styles.priceMetricIcon, styles.highestPriceIcon]}>
                  <Ionicons name="arrow-up" size={16} color={COLORS.white} />
                </View>
                <Text style={styles.priceMetricLabel}>
                  {t("dashboard.highestPrice")}
                </Text>
                <Text style={styles.priceMetricValue}>
                  PKR {priceData.highest}
                </Text>
              </View>

              <View style={styles.priceMetric}>
                <View style={[styles.priceMetricIcon, styles.lowestPriceIcon]}>
                  <Ionicons name="arrow-down" size={16} color={COLORS.white} />
                </View>
                <Text style={styles.priceMetricLabel}>
                  {t("dashboard.lowestPrice")}
                </Text>
                <Text style={styles.priceMetricValue}>
                  PKR {priceData.lowest}
                </Text>
              </View>

              <View style={styles.priceMetric}>
                <View style={[styles.priceMetricIcon, styles.averagePriceIcon]}>
                  <Ionicons name="analytics" size={16} color={COLORS.white} />
                </View>
                <Text style={styles.priceMetricLabel}>
                  {t("dashboard.averagePrice")}
                </Text>
                <Text style={styles.priceMetricValue}>
                  PKR {priceData.average}
                </Text>
              </View>
            </View>
          </Card>

          <Card
            style={styles.chartCard}
            variant="default"
            shadow="medium"
          >
            <View style={styles.chartCardHeader}>
              <Text style={styles.chartTitle}>
                {t("dashboard.priceHistory")}
              </Text>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={styles.legendDot} />
                  <Text style={styles.legendText}>{t("dashboard.priceHistory")}</Text>
                </View>
              </View>
            </View>

            {chartDisplayData ? (
              isWebPlatform ? (
                <View
                  style={[styles.chartWrapper, { width: '100%' }]} // Ensure wrapper takes full width for onLayout
                  onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    // Only update if width is valid and has changed to prevent infinite loops
                    if (width > 0 && width !== measuredChartWrapperWidth) {
                      setMeasuredChartWrapperWidth(width);
                    }
                  }}
                >
                  {measuredChartWrapperWidth > 0 ? (                    <LineChart
                      data={chartDisplayData}
                      width={measuredChartWrapperWidth} // Use measured width
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
                      yLabelsOffset={10} // Add offset to y-axis labels to prevent first digit cutoff
                      fromZero={false}
                      withDots={true}
                      withInnerLines={true}
                      withOuterLines={true}
                      withVerticalLines={true}
                      withHorizontalLines={true}
                      withVerticalLabels={true}
                      withHorizontalLabels={true}
                      horizontalLabelRotation={0}
                      paddingLeft={80} // Added explicit padding to prevent digit cutoff
                      decorator={() => (
                        <View style={styles.tooltipContainer}>
                          {isWebPlatform && ( // This will be true for web
                            <View style={styles.tooltipHint}>
                              <Ionicons name="information-circle-outline" size={16} color={COLORS.info} />
                              <Text style={styles.tooltipHintText}>
                                {t("dashboard.hoverForDetails")}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}                      onDataPointClick={({ value, index }) => {
                        if (chartDisplayData.tooltipData && chartDisplayData.tooltipData[index]) {
                          const tooltipItem = chartDisplayData.tooltipData[index];
                          // Ensure alert message is correctly formatted without newlines
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
                  <View style={styles.chartInfo}>
                    <View style={styles.chartInfoItem}>
                      <Ionicons name="trending-up" size={16} color={COLORS.primaryLight} />
                      <Text style={styles.chartInfoText}>
                        {t("dashboard.priceHistoryInfo")}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : ( // Mobile platform
                <View style={styles.chartWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ 
                      minWidth: chartDisplayData.labels && chartDisplayData.labels.length > 0 
                                ? Math.max(windowDimensions.width - 40, chartDisplayData.labels.length * 40) 
                                : windowDimensions.width - 40 
                    }}
                    style={{ width: '100%' }}
                  >
                    <LineChart
                      data={chartDisplayData}
                      width={
                        chartDisplayData.labels && chartDisplayData.labels.length > 0
                          ? Math.max(windowDimensions.width - 40, chartDisplayData.labels.length * 40)
                          : windowDimensions.width - 40
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
                                    ? Math.max(windowDimensions.width - 40, chartDisplayData.labels.length * 40) 
                                    : windowDimensions.width - 40 
                        }
                      ]}                      yAxisSuffix=" PKR"
                      yAxisInterval={1}
                      fromZero={false}
                      withDots={true}
                      withInnerLines={true}
                      withOuterLines={true}
                      withVerticalLines={true}
                      yLabelsOffset={10} // Add offset to y-axis labels to prevent first digit cutoff
                      withHorizontalLines={true}
                      withVerticalLabels={true}
                      withHorizontalLabels={true}
                      horizontalLabelRotation={30} // Mobile rotation
                      paddingLeft={40} // Added explicit padding to prevent digit cutoff
                      decorator={() => (
                        <View style={styles.tooltipContainer}>
                          {/* Hint is not shown on mobile as isWebPlatform will be false */}
                        </View>
                      )}                      onDataPointClick={({ value, index }) => {
                        if (chartDisplayData.tooltipData && chartDisplayData.tooltipData[index]) {
                          const tooltipItem = chartDisplayData.tooltipData[index];
                          alert(`${tooltipItem.date} - ${tooltipItem.price}`);
                        }
                      }}
                    />
                  </ScrollView>
                  <View style={styles.chartInfo}>
                    <View style={styles.chartInfoItem}>
                      <Ionicons name="trending-up" size={16} color={COLORS.primaryLight} />
                      <Text style={styles.chartInfoText}>
                        {t("dashboard.priceHistoryInfo")}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons name="analytics-outline" size={40} color={COLORS.lightGray} style={styles.noDataIcon} />
                <Text style={styles.noDataText}>
                  {t("historical.noChartDataAvailable")}
                </Text>
                <Text style={styles.noDataSubText}>
                  {t("common.language") === "en"
                    ? `No price data available for ${
                        commodities.find((c) => c.id === selectedCommodity)
                          ?.name
                      } in ${
                        locations.find((l) => l.id === selectedLocation)?.name
                      }`
                    : `${
                        commodities.find((c) => c.id === selectedCommodity)
                          ?.name_ur
                      } کے لیے ${
                        locations.find((l) => l.id === selectedLocation)
                          ?.name_ur
                      } میں کوئی قیمت کا ڈیٹا دستیاب نہیں ہے`}
                </Text>
                <Text style={styles.noDataSubText}>
                  {`${formatDate(startDate)} - ${formatDate(endDate)}`}
                </Text>
              </View>
            )}
          </Card>
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            {t("historical.noDataAvailable")}
          </Text>
          <Text style={styles.noDataSubText}>
            {t("historical.tryDifferentDateRange")}
          </Text>
        </View>
      )}
    </>
  );
};

// Main return for DashboardScreen component
return isWebPlatform ? (
  <WebLayout
    title={t("dashboard.title")}
    currentScreen="Dashboard"
    navigation={navigation}
    showNotificationsButton={true}
    onNotificationsPress={() => navigation.navigate("Notifications")}
    fullWidth={true}
  >
    {renderContent()}
  </WebLayout>
) : (
  <SafeAreaView style={styles.container}>
    <Header
      title={t("dashboard.title")}
      showNotificationsButton={true}
      onNotificationsPress={() => navigation.navigate("Notifications")}
    />
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderContent()}
    </ScrollView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? COLORS.background.green : COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.large,
    ...(Platform.OS !== "web" ? { paddingBottom: 100 } : {}), // Add extra bottom padding for mobile
  },
  notificationButton: {
    padding: SPACING.small,
  },
  filtersCard: {
    marginBottom: SPACING.medium,
    borderRadius: 16,
  },
  filtersTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    color: COLORS.text.primary,
  },
  filtersContainer: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.medium,
    ...(Platform.OS === "web" ? {
      width: "48%",
    } : {}),
  },
  filterIcon: {
    marginRight: SPACING.small,
    marginTop: SPACING.medium,
  },
  dropdown: {
    flex: 1,
  },
  dateRangeCard: {
    marginBottom: SPACING.large,
    borderRadius: 16,
  },
  dateRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: SPACING.medium,
  },
  dateRangeTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  datePickersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.medium,
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  datePicker: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  datePickerLabel: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.small,
    fontWeight: "500",
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.background.tertiary,
    paddingHorizontal: SPACING.small,
  },
  dateInputIcon: {
    marginRight: SPACING.small,
  },
  dateButtonIcon: {
    marginRight: SPACING.small,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.medium,
    backgroundColor: COLORS.background.tertiary,
  },
  datePickerButtonText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    flex: 1,
  },
  datePickerInput: {
    flex: 1,
    padding: SPACING.medium,
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    borderWidth: 0,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.medium,
    alignItems: "center",
    ...SHADOWS.primary,
  },
  applyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonIcon: {
    marginRight: SPACING.small,
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: FONT.sizes.medium,
    fontWeight: "bold",
  },
  priceCard: {
    marginBottom: SPACING.large,
    borderRadius: 20,
  },
  priceCardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  commodityName: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    marginBottom: SPACING.small,
    textAlign: "center",
    color: COLORS.text.primary,
  },
  dateRangeInfo: {
    fontSize: FONT.sizes.small,
    textAlign: "center",
    color: COLORS.text.secondary,
  },
  currentPriceWrapper: {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    borderRadius: 12,
    padding: SPACING.large,
    marginBottom: SPACING.large,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.1)',
  },
  currentPriceContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  currentPriceLabel: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.small,
    fontWeight: "500",
  },
  currentPriceValue: {
    fontSize: FONT.sizes.xxxl,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  priceMetricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: -SPACING.small,
  },
  priceMetric: {
    alignItems: "center",
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    marginHorizontal: SPACING.small,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...SHADOWS.subtle,
  },
  priceMetricIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  highestPriceIcon: {
    backgroundColor: COLORS.chart.green,
  },
  lowestPriceIcon: {
    backgroundColor: COLORS.chart.red,
  },
  averagePriceIcon: {
    backgroundColor: COLORS.chart.blue,
  },
  priceMetricLabel: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  priceMetricValue: {
    fontSize: FONT.sizes.medium,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  chartCard: {
    marginBottom: SPACING.large,
    borderRadius: 20,
  },
  chartCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: SPACING.medium,
  },
  chartTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  chartLegend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.medium,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
  },
  chartWrapper: {
    backgroundColor: 'rgba(46, 125, 50, 0.03)',
    borderRadius: 16,
    padding: SPACING.medium,
    width: '100%',
    ...(Platform.OS === "web" ? {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    } : {}),
  },
  chartScrollContainer: {
    width: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    marginBottom: SPACING.medium,
    borderRadius: 12,
    ...(Platform.OS === "web" ? {
      backgroundColor: COLORS.white,
      padding: SPACING.small,
      ...SHADOWS.subtle,
    } : {}),
  },
  chart: { // Simplified chart style
    marginVertical: SPACING.medium,
    borderRadius: 16,
    // Width/minWidth is now handled dynamically by props or parent for web
  },
  chartInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.small,
  },
  chartInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    ...SHADOWS.subtle,
  },
  chartInfoText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
    marginLeft: SPACING.small,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  // New styles for grid layout
  insightsCard: {
    marginBottom: SPACING.large,
    borderRadius: 20,
    height: '100%',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.large,
    paddingBottom: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  insightContent: {
    marginLeft: SPACING.medium,
    flex: 1,
  },
  insightTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  insightValue: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  insightDescription: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
  },
  statCard: {
    padding: SPACING.large,
    borderRadius: 16,
    marginBottom: SPACING.medium,
  },
  statCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardTitle: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
    textAlign: 'center',
  },
  statCardValue: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  tooltipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    ...SHADOWS.subtle,
  },
  tooltipHintText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  noDataIcon: {
    marginBottom: SPACING.medium,
  },
  // Removed navigation container styles as they're no longer needed
  buttonIcon: {
    marginRight: SPACING.small,
  },
  loadingContainer: {
    padding: SPACING.xxl,
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONT.sizes.large,
    color: COLORS.text.secondary,
    marginTop: SPACING.medium,
  },
  noDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 16,
    marginVertical: SPACING.medium,
    padding: SPACING.large,
  },
  noDataText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.small,
    textAlign: "center",
  },
  noDataSubText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
});

export default DashboardScreen;
