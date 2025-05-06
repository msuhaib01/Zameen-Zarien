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
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import Header from "../components/Header";
import Card from "../components/Card";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import { COLORS, FONT, SPACING, SHADOWS } from "../theme";
import { useApp } from "../context/AppContext";
import {
  getPriceHistory,
  checkApiAvailability,
} from "../services/cropPricesService";

const screenWidth = Dimensions.get("window").width;

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
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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

  // Prepare chart data
  const getChartData = () => {
    if (!priceData || !priceData.history || priceData.history.length === 0)
      return null;

    // Get all data points from the selected date range
    let chartData = [...priceData.history];

    // If we have too many data points, we need to sample them to avoid overcrowding the chart
    // Calculate max data points based on date range
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const MAX_DATA_POINTS = daysDiff > 365 ? 36 : 15; // More points for longer ranges

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

    // Format the dates for display based on date range
    const formatChartDate = (dateStr) => {
      const date = new Date(dateStr);
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      // Calculate the date range span in days
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      if (daysDiff > 365) {
        // For long ranges (> 1 year), show month/year (e.g., "Jan/21")
        return `${monthNames[date.getMonth()]}/${date
          .getFullYear()
          .toString()
          .substr(2, 2)}`;
      } else if (daysDiff > 60) {
        // For medium ranges (2-12 months), show month/day (e.g., "Jan/15")
        return `${monthNames[date.getMonth()]}/${date.getDate()}`;
      } else {
        // For short ranges (< 60 days), show day/month (e.g., "15/4")
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }
    };

    return {
      labels: chartData.map((item) => formatChartDate(item.date)),
      datasets: [
        {
          data: chartData.map((item) => item.price),
          color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`, // Dark green
          strokeWidth: 2,
        },
      ],
      legend: [t("dashboard.priceHistory")],
    };
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green color
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: COLORS.primary,
    },
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "#e3e3e3",
      strokeDasharray: "5, 5",
    },
    propsForLabels: {
      fontSize: 10,
      fontWeight: "bold",
    },
  };

  return (
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

        <Card style={styles.dateRangeCard}>
          <Text style={styles.dateRangeTitle}>{t("historical.dateRange")}</Text>

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
                      maximumDate={new Date()}
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
        </Card>

        {isDataLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
          </View>
        ) : priceData ? (
          <>
            <Card style={styles.priceCard}>
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

              <Text style={styles.dateRangeInfo}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>

              <View style={styles.currentPriceContainer}>
                <Text style={styles.currentPriceLabel}>
                  {t("dashboard.currentPrice")}:
                </Text>
                <Text style={styles.currentPriceValue}>
                  PKR {priceData.current}
                </Text>
              </View>

              <View style={styles.priceMetricsContainer}>
                <View style={styles.priceMetric}>
                  <Text style={styles.priceMetricLabel}>
                    {t("dashboard.highestPrice")}
                  </Text>
                  <Text style={styles.priceMetricValue}>
                    PKR {priceData.highest}
                  </Text>
                </View>

                <View style={styles.priceMetric}>
                  <Text style={styles.priceMetricLabel}>
                    {t("dashboard.lowestPrice")}
                  </Text>
                  <Text style={styles.priceMetricValue}>
                    PKR {priceData.lowest}
                  </Text>
                </View>

                <View style={styles.priceMetric}>
                  <Text style={styles.priceMetricLabel}>
                    {t("dashboard.averagePrice")}
                  </Text>
                  <Text style={styles.priceMetricValue}>
                    PKR {priceData.average}
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                {t("dashboard.priceHistory")}
              </Text>

              {getChartData() ? (
                <LineChart
                  data={getChartData()}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  yAxisSuffix=" PKR"
                  yAxisInterval={1}
                  fromZero={true}
                  withDots={true}
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLines={true}
                  withHorizontalLines={true}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  horizontalLabelRotation={0}
                />
              ) : (
                <View style={styles.noDataContainer}>
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

            <View style={styles.navigationContainer}>
              <Button
                title={t("dashboard.setAlert")}
                onPress={() => navigation.navigate("Alerts")}
                type="primary"
                icon={
                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                }
                style={styles.navigationButton}
              />

              <Button
                title={t("dashboard.viewHistorical")}
                onPress={() => navigation.navigate("Historical")}
                type="primary"
                icon={
                  <Ionicons
                    name="bar-chart-outline"
                    size={18}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                }
                style={styles.navigationButton}
              />

              <Button
                title={t("dashboard.viewForecast")}
                onPress={() => navigation.navigate("Forecast")}
                type="primary"
                icon={
                  <Ionicons
                    name="trending-up-outline"
                    size={18}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                }
                style={styles.navigationButton}
              />
            </View>
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
  notificationButton: {
    padding: SPACING.small,
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.medium,
  },
  dropdown: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  dateRangeCard: {
    marginBottom: SPACING.large,
  },
  dateRangeTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    color: COLORS.text.primary,
  },
  datePickersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.medium,
  },
  datePicker: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  datePickerLabel: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.small,
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
  },
  datePickerInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.medium,
    backgroundColor: COLORS.background.tertiary,
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.medium,
    alignItems: "center",
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: FONT.sizes.medium,
    fontWeight: "bold",
  },
  priceCard: {
    marginBottom: SPACING.large,
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
    marginBottom: SPACING.medium,
  },
  currentPriceContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.large,
  },
  currentPriceLabel: {
    fontSize: FONT.sizes.large,
    color: COLORS.text.primary,
    marginRight: SPACING.small,
  },
  currentPriceValue: {
    fontSize: FONT.sizes.xxl,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  priceMetricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceMetric: {
    alignItems: "center",
    flex: 1,
  },
  priceMetricLabel: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  priceMetricValue: {
    fontSize: FONT.sizes.medium,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  chartCard: {
    marginBottom: SPACING.large,
  },
  chartTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    color: COLORS.text.primary,
  },
  chart: {
    marginVertical: SPACING.medium,
    borderRadius: 16,
  },
  navigationContainer: {
    marginBottom: SPACING.large,
  },
  navigationButton: {
    marginBottom: SPACING.medium,
  },
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
