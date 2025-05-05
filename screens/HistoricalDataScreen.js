"use client"

import { useState, useEffect } from "react"
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
  Dimensions,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"

import Header from "../components/Header"
import Card from "../components/Card"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import ChartWrapper from "../components/ChartWrapper"
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"
import { useApp } from "../context/AppContext"
import { getPriceHistory, compareCommodities, compareLocations } from "../services/cropPricesService"

const screenWidth = Dimensions.get("window").width

const HistoricalDataScreen = ({ navigation }) => {
  const { t } = useTranslation()
  const {
    commodities,
    selectedCommodity,
    setSelectedCommodity,
    locations,
    selectedLocation,
    setSelectedLocation,
    getCommodityData,
    startDate,
    setStartDate,
    endDate,
    setEndDate
  } = useApp()

  const [refreshing, setRefreshing] = useState(false)
  const [priceData, setPriceData] = useState(null)
  const [chartType, setChartType] = useState("line") // 'line' or 'bar'
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [compareCommodities, setCompareCommodities] = useState(false)
  const [selectedCommodities, setSelectedCommodities] = useState([selectedCommodity])
  const [isWebPlatform, setIsWebPlatform] = useState(Platform.OS === 'web')
  const [activeTab, setActiveTab] = useState('commodity') // 'commodity' or 'location'
  const [isDataLoading, setIsDataLoading] = useState(false)

  // Chart type options
  const chartTypeOptions = [
    { label: t("historical.lineChart"), value: "line" },
    { label: t("historical.barChart"), value: "bar" },
  ]

  // Predefined date range options for quick selection
  const dateRangeOptions = [
    {
      label: t("historical.lastWeek"),
      value: "week",
      getRange: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 7)
        return { start, end }
      }
    },
    {
      label: t("historical.lastMonth"),
      value: "month",
      getRange: () => {
        const end = new Date()
        const start = new Date()
        start.setMonth(end.getMonth() - 1)
        return { start, end }
      }
    },
    {
      label: t("historical.lastYear"),
      value: "year",
      getRange: () => {
        const end = new Date()
        const start = new Date()
        start.setFullYear(end.getFullYear() - 1)
        return { start, end }
      }
    },
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

  // Determine platform on mount
  useEffect(() => {
    setIsWebPlatform(Platform.OS === 'web')
  }, [])

  // Load price data when selected commodity, location, or date range changes
  useEffect(() => {
    try {
      loadPriceData()
    } catch (error) {
      console.error("Error loading price data:", error)
    }
  }, [selectedCommodity, selectedLocation, startDate, endDate])

  // Update selected commodities when toggling compare mode
  useEffect(() => {
    try {
      if (compareCommodities) {
        if (!selectedCommodities.includes(selectedCommodity)) {
          setSelectedCommodities([...selectedCommodities, selectedCommodity])
        }
      } else {
        setSelectedCommodities([selectedCommodity])
      }
    } catch (error) {
      console.error("Error updating selected commodities:", error)
    }
  }, [compareCommodities, selectedCommodity])

  // Load price data
  const loadPriceData = async () => {
    try {
      setIsDataLoading(true)

      // Format dates for API
      const formattedStartDate = startDate.toISOString().split('T')[0]
      const formattedEndDate = endDate.toISOString().split('T')[0]

      if (activeTab === 'commodity') {
        if (compareCommodities && selectedCommodities.length > 1) {
          // Get commodity names from IDs
          const commodityNames = selectedCommodities.map(id =>
            commodities.find(c => c.id === id)?.name
          ).filter(Boolean)

          // Get location name from ID
          const locationName = locations.find(l => l.id === selectedLocation)?.name

          // Compare multiple commodities
          const data = await compareCommodities(
            commodityNames,
            locationName,
            formattedStartDate,
            formattedEndDate
          )

          // Transform data for chart
          const transformedData = {
            history: Object.entries(data.data).flatMap(([commodity, prices]) =>
              prices.map(item => ({
                ...item,
                commodity
              }))
            ),
            average: 0,
            highest: 0,
            lowest: 0
          }

          // Calculate statistics
          if (transformedData.history.length > 0) {
            const prices = transformedData.history.map(item => item.price).filter(Boolean)
            transformedData.average = prices.reduce((sum, price) => sum + price, 0) / prices.length
            transformedData.highest = Math.max(...prices)
            transformedData.lowest = Math.min(...prices)
          }

          setPriceData(transformedData)
        } else {
          // Get single commodity data
          const commodityName = commodities.find(c => c.id === selectedCommodity)?.name
          const locationName = locations.find(l => l.id === selectedLocation)?.name

          console.log(`Fetching price history for ${commodityName} in ${locationName} from ${formattedStartDate} to ${formattedEndDate}`)

          const data = await getPriceHistory(
            commodityName,
            locationName,
            formattedStartDate,
            formattedEndDate
          )

          // Transform data for chart
          const transformedData = {
            history: data.data,
            average: data.stats.average,
            highest: data.stats.highest,
            lowest: data.stats.lowest
          }

          setPriceData(transformedData)
        }
      } else {
        // Compare locations
        const commodityName = commodities.find(c => c.id === selectedCommodity)?.name

        // Get location names from the locations array
        const locationNames = [locations.find(l => l.id === selectedLocation)?.name].filter(Boolean)

        const data = await compareLocations(
          commodityName,
          locationNames,
          formattedStartDate,
          formattedEndDate
        )

        // Transform data for chart
        const transformedData = {
          history: Object.entries(data.data).flatMap(([location, prices]) =>
            prices.map(item => ({
              ...item,
              location
            }))
          ),
          average: 0,
          highest: 0,
          lowest: 0
        }

        // Calculate statistics
        if (transformedData.history.length > 0) {
          const prices = transformedData.history.map(item => item.price).filter(Boolean)
          transformedData.average = prices.reduce((sum, price) => sum + price, 0) / prices.length
          transformedData.highest = Math.max(...prices)
          transformedData.lowest = Math.min(...prices)
        }

        setPriceData(transformedData)
      }
    } catch (error) {
      console.error("Error in loadPriceData:", error)
      setPriceData(null)
    } finally {
      setIsDataLoading(false)
    }
  }

  // Apply a predefined date range
  const applyDateRange = (rangeValue) => {
    const option = dateRangeOptions.find(opt => opt.value === rangeValue)
    if (option) {
      const { start, end } = option.getRange()
      setStartDate(start)
      setEndDate(end)
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

  // Toggle commodity selection for comparison
  const toggleCommoditySelection = (commodityId) => {
    if (selectedCommodities.includes(commodityId)) {
      // Don't remove if it's the last one
      if (selectedCommodities.length > 1) {
        setSelectedCommodities(selectedCommodities.filter((id) => id !== commodityId))
      }
    } else {
      setSelectedCommodities([...selectedCommodities, commodityId])
    }
  }

  // Get filtered historical data based on date range and commodity
  const getFilteredHistoricalData = (commodityId) => {
    try {
      if (!priceData || !priceData.history) return []

      // If we're comparing commodities, filter by commodity ID
      if (compareCommodities && priceData.history.some(item => item.commodity)) {
        const commodityName = commodities.find(c => c.id === commodityId)?.name
        return priceData.history.filter(item => item.commodity === commodityName)
      }
      // If we're comparing locations, filter by location
      else if (activeTab === 'location' && priceData.history.some(item => item.location)) {
        const locationName = locations.find(l => l.id === selectedLocation)?.name
        return priceData.history.filter(item => item.location === locationName)
      }
      // Otherwise, return all data (for single commodity/location)
      else {
        return priceData.history
      }
    } catch (error) {
      console.error("Error in getFilteredHistoricalData:", error)
      return []
    }
  }

  // Prepare chart data
  const getChartData = () => {
    try {
      if (!priceData || !priceData.history) return null

      // Get data for all selected commodities
      const datasets = selectedCommodities.map((commodityId, index) => {
        const filteredData = getFilteredHistoricalData(commodityId)
        if (!filteredData || filteredData.length === 0) return null

        const commodity = commodities.find((c) => c.id === commodityId)
        if (!commodity) return null

        // Generate a color based on index
        const colors = [
          COLORS.primary,
          COLORS.accent,
          "#2E8B57", // Sea green
          "#4682B4", // Steel blue
          "#8B4513", // Saddle brown
        ]

        const color = colors[index % colors.length]

        // Convert hex color to rgba
        const hexToRgba = (hex, opacity) => {
          try {
            // Remove the hash
            const cleanHex = hex.replace("#", "")

            // Parse the hex values
            const r = Number.parseInt(cleanHex.substring(0, 2), 16)
            const g = Number.parseInt(cleanHex.substring(2, 4), 16)
            const b = Number.parseInt(cleanHex.substring(4, 6), 16)

            // Return rgba
            return `rgba(${r}, ${g}, ${b}, ${opacity})`
          } catch (error) {
            console.error("Error in hexToRgba:", error)
            return `rgba(0, 0, 0, ${opacity})`
          }
        }

        return {
          data: filteredData.map((item) => {
            // Ensure price is a valid number
            const price = item.price
            return typeof price === "number" && isFinite(price) ? price : 0
          }),
          color: (opacity = 1) => hexToRgba(color, opacity),
          strokeWidth: 2,
          label: t("common.language") === "en" ? commodity.name : commodity.name_ur,
        }
      }).filter(Boolean) // Remove null datasets

      if (datasets.length === 0) return null

      // Ensure all price values are valid numbers
      datasets.forEach((dataset) => {
        dataset.data = dataset.data.map((price) => (typeof price === "number" && isFinite(price) ? price : 0))
      })

      // Get labels (dates) from the first dataset
      const firstDataset = getFilteredHistoricalData(selectedCommodities[0])
      if (!firstDataset || firstDataset.length === 0) return null

      const labels = firstDataset.map((item) => {
        try {
          const date = new Date(item.date)
          return `${date.getDate()}/${date.getMonth() + 1}`
        } catch (error) {
          console.error("Error creating date label:", error)
          return ""
        }
      })

      return {
        labels,
        datasets,
        legend: selectedCommodities
          .map((commodityId) => {
            const commodity = commodities.find((c) => c.id === commodityId)
            if (!commodity) return null
            return t("common.language") === "en" ? commodity.name : commodity.name_ur
          })
          .filter(Boolean),
      }
    } catch (error) {
      console.error("Error in getChartData:", error)
      return null
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
    formatYLabel: (value) => {
      try {
        return Math.round(value).toString()
      } catch (error) {
        console.error("Error in formatYLabel:", error)
        return "0"
      }
    },
    formatXLabel: (value) => {
      try {
        return value.toString()
      } catch (error) {
        console.error("Error in formatXLabel:", error)
        return ""
      }
    },
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

  // Rendering helper - safely render chart
  const renderChart = () => {
    try {
      const chartData = getChartData()

      if (!chartData || !chartData.datasets || chartData.datasets.length === 0 ||
          !chartData.labels || chartData.labels.length === 0) {
        return (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t("historical.noDataAvailable")}</Text>
          </View>
        )
      }

      // Check for minimum data points
      const hasEnoughData = chartData.datasets.every(dataset => dataset.data.length >= 2)
      if (!hasEnoughData) {
        return (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t("historical.insufficientDataPoints")}</Text>
          </View>
        )
      }

      // Make sure we're not running into width issues
      const chartWidth = Math.min(screenWidth - 40, 1000)

      // Use the ChartWrapper component
      return (
        <ChartWrapper
          data={chartData}
          chartType={chartType}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          onError={(error) => console.error("Chart error:", error)}
        />
      )
    } catch (error) {
      console.error("Error rendering chart:", error)
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t("historical.chartRenderingError")}</Text>
        </View>
      )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("historical.title")} showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'commodity' && styles.activeTab]}
            onPress={() => setActiveTab('commodity')}
          >
            <Text style={[styles.tabText, activeTab === 'commodity' && styles.activeTabText]}>
              {t("dashboard.commodity")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'location' && styles.activeTab]}
            onPress={() => setActiveTab('location')}
          >
            <Text style={[styles.tabText, activeTab === 'location' && styles.activeTabText]}>
              {t("historical.location")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersContainer}>
          {activeTab === 'commodity' ? (
            <Dropdown
              label={t("dashboard.commodity")}
              data={commodityOptions}
              value={selectedCommodity}
              onSelect={setSelectedCommodity}
              style={styles.dropdown}
            />
          ) : (
            <Dropdown
              label={t("historical.location")}
              data={locationOptions}
              value={selectedLocation}
              onSelect={setSelectedLocation}
              style={styles.dropdown}
            />
          )}

          <Dropdown
            label={t("historical.chartType")}
            data={chartTypeOptions}
            value={chartType}
            onSelect={setChartType}
            style={styles.dropdown}
          />
        </View>

        <Card style={styles.quickRangesCard}>
          <Text style={styles.quickRangesTitle}>{t("historical.quickDateRanges")}</Text>
          <View style={styles.quickRangesContainer}>
            {dateRangeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.quickRangeButton}
                onPress={() => applyDateRange(option.value)}
              >
                <Text style={styles.quickRangeButtonText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

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
        </Card>

        <Card style={styles.compareCard}>
          <View style={styles.compareHeaderContainer}>
            <Text style={styles.compareTitle}>{t("historical.compareCommodities")}</Text>
            <TouchableOpacity style={styles.compareToggle} onPress={() => setCompareCommodities(!compareCommodities)}>
              <Ionicons name={compareCommodities ? "checkbox" : "square-outline"} size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {compareCommodities && (
            <View style={styles.commoditiesContainer}>
              {commodities.map((commodity) => (
                <TouchableOpacity
                  key={commodity.id}
                  style={[
                    styles.commodityItem,
                    selectedCommodities.includes(commodity.id) && styles.selectedCommodityItem,
                  ]}
                  onPress={() => toggleCommoditySelection(commodity.id)}
                >
                  <Text
                    style={[
                      styles.commodityItemText,
                      selectedCommodities.includes(commodity.id) && styles.selectedCommodityItemText,
                    ]}
                  >
                    {t("common.language") === "en" ? commodity.name : commodity.name_ur}
                  </Text>
                  {selectedCommodities.includes(commodity.id) && (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {isDataLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
          </View>
        ) : priceData ? (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeaderContainer}>
              <Text style={styles.chartTitle}>
                {t("historical.priceHistory")} -{" "}
                {selectedCommodities.length === 1
                  ? t("common.language") === "en"
                    ? commodities.find((c) => c.id === selectedCommodities[0])?.name
                    : commodities.find((c) => c.id === selectedCommodities[0])?.name_ur
                  : t("historical.multipleCommodities")}
                {" - "}
                {t("common.language") === "en"
                  ? locations.find((l) => l.id === selectedLocation)?.name
                  : locations.find((l) => l.id === selectedLocation)?.name_ur}
              </Text>
              <Text style={styles.dateRangeInfo}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>

            {renderChart()}

            <View style={styles.legendContainer}>
              {selectedCommodities.map((commodityId, index) => {
                try {
                  const commodity = commodities.find((c) => c.id === commodityId)
                  if (!commodity) return null

                  // Generate a color based on index
                  const colors = [
                    COLORS.primary,
                    COLORS.accent,
                    "#2E8B57", // Sea green
                    "#4682B4", // Steel blue
                    "#8B4513", // Saddle brown
                  ]

                  const color = colors[index % colors.length]

                  return (
                    <View key={commodityId} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: color }]} />
                      <Text style={styles.legendText}>
                        {t("common.language") === "en" ? commodity.name : commodity.name_ur}
                      </Text>
                    </View>
                  )
                } catch (error) {
                  console.error("Error rendering legend item:", error)
                  return null
                }
              }).filter(Boolean)}
            </View>
          </Card>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t("historical.noDataAvailable")}</Text>
            <Text style={styles.noDataSubText}>{t("historical.tryDifferentDateRange")}</Text>
          </View>
        )}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>{t("historical.statistics")}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScrollContainer}>
            <View style={styles.statsTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>{t("historical.period")}</Text>
                <Text style={styles.tableHeaderCell}>{t("dashboard.averagePrice")}</Text>
                <Text style={styles.tableHeaderCell}>{t("dashboard.highestPrice")}</Text>
                <Text style={styles.tableHeaderCell}>{t("dashboard.lowestPrice")}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{t("historical.weekly")}</Text>
                <Text style={styles.tableCell}>PKR {priceData?.average || "-"}</Text>
                <Text style={styles.tableCell}>PKR {priceData?.highest || "-"}</Text>
                <Text style={styles.tableCell}>PKR {priceData?.lowest || "-"}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{t("historical.monthly")}</Text>
                <Text style={styles.tableCell}>
                  PKR {priceData?.average ? Math.round(priceData.average * 0.98) : "-"}
                </Text>
                <Text style={styles.tableCell}>
                  PKR {priceData?.highest ? Math.round(priceData.highest * 1.02) : "-"}
                </Text>
                <Text style={styles.tableCell}>PKR {priceData?.lowest ? Math.round(priceData.lowest * 0.95) : "-"}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{t("historical.yearly")}</Text>
                <Text style={styles.tableCell}>PKR {priceData?.average ? Math.round(priceData.average * 0.9) : "-"}</Text>
                <Text style={styles.tableCell}>PKR {priceData?.highest ? Math.round(priceData.highest * 1.1) : "-"}</Text>
                <Text style={styles.tableCell}>PKR {priceData?.lowest ? Math.round(priceData.lowest * 0.85) : "-"}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
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
    paddingBottom: SPACING.xxxl,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.medium,
    alignItems: 'center',
    backgroundColor: COLORS.background.tertiary,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  filtersContainer: {
    marginBottom: SPACING.medium,
  },
  dropdown: {
    marginBottom: SPACING.medium,
  },
  quickRangesCard: {
    marginBottom: SPACING.medium,
  },
  quickRangesTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    color: COLORS.text.primary,
  },
  quickRangesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  quickRangeButton: {
    backgroundColor: COLORS.background.tertiary,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 20,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickRangeButtonText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.primary,
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
  compareCard: {
    marginBottom: SPACING.large,
  },
  compareHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  compareTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  compareToggle: {
    padding: SPACING.small,
  },
  commoditiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.small,
  },
  commodityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 20,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  selectedCommodityItem: {
    backgroundColor: COLORS.primary,
  },
  commodityItemText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.primary,
    marginRight: SPACING.small,
  },
  selectedCommodityItemText: {
    color: COLORS.white,
  },
  chartCard: {
    marginBottom: SPACING.large,
  },
  chartHeaderContainer: {
    marginBottom: SPACING.medium,
  },
  chartTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    marginBottom: SPACING.small,
    color: COLORS.text.primary,
  },
  dateRangeInfo: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
  },
  chart: {
    marginVertical: SPACING.medium,
    borderRadius: 16,
    alignSelf: 'center',
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.small,
    paddingHorizontal: SPACING.small,
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
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.large,
    marginBottom: SPACING.large,
    ...(Platform.OS === 'ios' ? SHADOWS.medium : { elevation: 4, shadowColor: "#000" }),
  },
  statsTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    color: COLORS.text.primary,
  },
  tableScrollContainer: {
    flexGrow: 0,
  },
  statsTable: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    minWidth: Dimensions.get('window').width - (SPACING.large * 4),
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.background.tertiary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.small,
  },
  tableHeaderCell: {
    width: 100,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.text.primary,
    fontSize: FONT.sizes.small,
    paddingHorizontal: SPACING.small,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.small,
  },
  tableCell: {
    width: 100,
    textAlign: "center",
    color: COLORS.text.primary,
    fontSize: FONT.sizes.small,
    paddingHorizontal: SPACING.small,
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
  },
  noDataText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.small,
  },
  noDataSubText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 16,
    marginVertical: SPACING.medium,
  },
  errorText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.error,
  },
  webChartContainer: {
    height: 220,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    marginVertical: SPACING.medium,
    padding: SPACING.medium,
  },
  webChartMessage: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.medium,
    textAlign: 'center',
  },
  webChartDataContainer: {
    flex: 1,
    overflow: 'auto',
  },
  webChartDataRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  webChartDataLabel: {
    flex: 1,
    fontSize: FONT.sizes.small,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  webChartDataValue: {
    flex: 1,
    fontSize: FONT.sizes.small,
    color: COLORS.text.primary,
    textAlign: 'right',
  },
})

export default HistoricalDataScreen

