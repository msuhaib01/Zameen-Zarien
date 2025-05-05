"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView, Platform, ActivityIndicator } from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"

import Header from "../components/Header"
import Card from "../components/Card"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"
import { useApp } from "../context/AppContext"
import { getPriceHistory } from "../services/cropPricesService"

const screenWidth = Dimensions.get("window").width

const DashboardScreen = ({ navigation }) => {
  const { t } = useTranslation()
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
    getCommodityData
  } = useApp()

  const [refreshing, setRefreshing] = useState(false)
  const [priceData, setPriceData] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)

  // Time period options
  const timePeriodOptions = [
    { label: t("dashboard.day"), value: "day" },
    { label: t("dashboard.week"), value: "week" },
    { label: t("dashboard.month"), value: "month" },
    { label: t("dashboard.year"), value: "year" },
  ]

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

  // Load price data when selected commodity or date range changes
  useEffect(() => {
    loadPriceData()
  }, [selectedCommodity, selectedLocation, startDate, endDate])

  // Load price data
  const loadPriceData = async () => {
    try {
      setIsDataLoading(true)

      // Format dates for API
      const formattedStartDate = startDate.toISOString().split('T')[0]
      const formattedEndDate = endDate.toISOString().split('T')[0]

      // Get commodity and location names
      const commodityName = commodities.find(c => c.id === selectedCommodity)?.name
      const locationName = locations.find(l => l.id === selectedLocation)?.name

      if (commodityName && locationName) {
        // Fetch data from API
        const data = await getPriceHistory(
          commodityName,
          locationName,
          formattedStartDate,
          formattedEndDate
        )

        // Transform data for display
        const transformedData = {
          current: data.stats.current || 0,
          highest: data.stats.highest || 0,
          lowest: data.stats.lowest || 0,
          average: data.stats.average || 0,
          history: data.data || []
        }

        setPriceData(transformedData)
      } else {
        // Fallback to sample data if names not found
        const data = getCommodityData(selectedCommodity)
        setPriceData(data)
      }
    } catch (error) {
      console.error("Error loading price data:", error)
      // Fallback to sample data on error
      const data = getCommodityData(selectedCommodity)
      setPriceData(data)
    } finally {
      setIsDataLoading(false)
    }
  }

  // Apply a predefined date range based on time period
  const applyTimePeriod = (period) => {
    const end = new Date()
    let start = new Date()

    switch (period) {
      case 'day':
        start.setDate(end.getDate() - 1)
        break
      case 'week':
        start.setDate(end.getDate() - 7)
        break
      case 'month':
        start.setMonth(end.getMonth() - 1)
        break
      case 'year':
        start.setFullYear(end.getFullYear() - 1)
        break
      default:
        start.setDate(end.getDate() - 7) // Default to week
    }

    setStartDate(start)
    setEndDate(end)
    setTimePeriod(period)
  }

  // Handle date change
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate
    setShowStartDatePicker(Platform.OS === "ios")
    setStartDate(currentDate)
  }

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate
    setShowEndDatePicker(Platform.OS === "ios")
    setEndDate(currentDate)
  }

  // Format date for display
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    // In a real app, you would fetch fresh data here
    await new Promise((resolve) => setTimeout(resolve, 1000))
    loadPriceData()
    setRefreshing(false)
  }

  // Prepare chart data
  const getChartData = () => {
    if (!priceData || !priceData.history) return null

    // Get the last 7 days of data for the chart
    const chartData = priceData.history.slice(-7)

    return {
      labels: chartData.map((item) => {
        const date = new Date(item.date)
        return `${date.getDate()}/${date.getMonth() + 1}`
      }),
      datasets: [
        {
          data: chartData.map((item) => item.price),
          color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`, // Dark green
          strokeWidth: 2,
        },
      ],
      legend: [t("dashboard.priceHistory")],
    }
  }

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`,
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
      <Header title={t("dashboard.title")} showNotificationsButton={true} onNotificationsPress={() => navigation.navigate("Notifications")} />

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

          <Dropdown
            label={t("dashboard.timePeriod")}
            data={timePeriodOptions}
            value={timePeriod}
            onSelect={(value) => applyTimePeriod(value)}
            style={styles.dropdown}
          />
        </View>

        <Card style={styles.dateRangeCard}>
          <Text style={styles.dateRangeTitle}>{t("historical.dateRange")}</Text>

          <View style={styles.datePickersContainer}>
            <View style={styles.datePicker}>
              <Text style={styles.datePickerLabel}>{t("historical.from")}</Text>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowStartDatePicker(true)}>
                <Text style={styles.datePickerButtonText}>{formatDate(startDate)}</Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
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
            </View>

            <View style={styles.datePicker}>
              <Text style={styles.datePickerLabel}>{t("historical.to")}</Text>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowEndDatePicker(true)}>
                <Text style={styles.datePickerButtonText}>{formatDate(endDate)}</Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
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
            </View>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={loadPriceData}
          >
            <Text style={styles.applyButtonText}>{t("common.apply")}</Text>
          </TouchableOpacity>
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
                  ? commodities.find(c => c.id === selectedCommodity)?.name
                  : commodities.find(c => c.id === selectedCommodity)?.name_ur}
                {" - "}
                {t("common.language") === "en"
                  ? locations.find(l => l.id === selectedLocation)?.name
                  : locations.find(l => l.id === selectedLocation)?.name_ur}
              </Text>

              <Text style={styles.dateRangeInfo}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>

              <View style={styles.currentPriceContainer}>
                <Text style={styles.currentPriceLabel}>{t("dashboard.currentPrice")}:</Text>
                <Text style={styles.currentPriceValue}>PKR {priceData.current}</Text>
              </View>

              <View style={styles.priceMetricsContainer}>
                <View style={styles.priceMetric}>
                  <Text style={styles.priceMetricLabel}>{t("dashboard.highestPrice")}</Text>
                  <Text style={styles.priceMetricValue}>PKR {priceData.highest}</Text>
                </View>

                <View style={styles.priceMetric}>
                  <Text style={styles.priceMetricLabel}>{t("dashboard.lowestPrice")}</Text>
                  <Text style={styles.priceMetricValue}>PKR {priceData.lowest}</Text>
                </View>

                <View style={styles.priceMetric}>
                  <Text style={styles.priceMetricLabel}>{t("dashboard.averagePrice")}</Text>
                  <Text style={styles.priceMetricValue}>PKR {priceData.average}</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t("dashboard.priceHistory")}</Text>

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
            </Card>

            <View style={styles.navigationContainer}>
              <Button
                title={t("dashboard.setAlert")}
                onPress={() => navigation.navigate("Alerts")}
                type="primary"
                icon={<Ionicons name="notifications-outline" size={18} color={COLORS.white} style={styles.buttonIcon} />}
                style={styles.navigationButton}
              />

              <Button
                title={t("dashboard.viewHistorical")}
                onPress={() => navigation.navigate("Historical")}
                type="primary"
                icon={<Ionicons name="bar-chart-outline" size={18} color={COLORS.white} style={styles.buttonIcon} />}
                style={styles.navigationButton}
              />

              <Button
                title={t("dashboard.viewForecast")}
                onPress={() => navigation.navigate("Forecast")}
                type="primary"
                icon={<Ionicons name="trending-up-outline" size={18} color={COLORS.white} style={styles.buttonIcon} />}
                style={styles.navigationButton}
              />
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t("historical.noDataAvailable")}</Text>
            <Text style={styles.noDataSubText}>{t("historical.tryDifferentDateRange")}</Text>
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
})

export default DashboardScreen

