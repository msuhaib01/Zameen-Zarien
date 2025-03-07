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
} from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"

import Header from "../components/Header"
import Card from "../components/Card"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"
import { useApp } from "../context/AppContext"

const screenWidth = Dimensions.get("window").width

const HistoricalDataScreen = ({ navigation }) => {
  const { t } = useTranslation()
  const { commodities, selectedCommodity, setSelectedCommodity, getCommodityData } = useApp()

  const [refreshing, setRefreshing] = useState(false)
  const [priceData, setPriceData] = useState(null)
  const [chartType, setChartType] = useState("line") // 'line' or 'bar'
  const [timeRange, setTimeRange] = useState("week") // 'week', 'month', 'year'
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 7 days ago
  const [endDate, setEndDate] = useState(new Date()) // Today
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [compareCommodities, setCompareCommodities] = useState(false)
  const [selectedCommodities, setSelectedCommodities] = useState([selectedCommodity])

  // Chart type options
  const chartTypeOptions = [
    { label: t("historical.lineChart"), value: "line" },
    { label: t("historical.barChart"), value: "bar" },
  ]

  // Time range options
  const timeRangeOptions = [
    { label: t("historical.weekly"), value: "week" },
    { label: t("historical.monthly"), value: "month" },
    { label: t("historical.yearly"), value: "year" },
  ]

  // Commodity options
  const commodityOptions = commodities.map((commodity) => ({
    label: t("common.language") === "en" ? commodity.name : commodity.name_ur,
    value: commodity.id,
  }))

  // Load price data when selected commodity changes
  useEffect(() => {
    loadPriceData()
  }, [selectedCommodity, timeRange, startDate, endDate])

  // Update selected commodities when toggling compare mode
  useEffect(() => {
    if (compareCommodities) {
      if (!selectedCommodities.includes(selectedCommodity)) {
        setSelectedCommodities([...selectedCommodities, selectedCommodity])
      }
    } else {
      setSelectedCommodities([selectedCommodity])
    }
  }, [compareCommodities, selectedCommodity])

  // Load price data
  const loadPriceData = () => {
    const data = getCommodityData(selectedCommodity)
    setPriceData(data)
  }

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    // In a real app, you would fetch fresh data here
    await new Promise((resolve) => setTimeout(resolve, 1000))
    loadPriceData()
    setRefreshing(false)
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

  // Get filtered historical data based on date range
  const getFilteredHistoricalData = (commodityId) => {
    const data = getCommodityData(commodityId)
    if (!data || !data.history) return []

    const startTimestamp = startDate.getTime()
    const endTimestamp = endDate.getTime()

    return data.history.filter((item) => {
      const itemDate = new Date(item.date).getTime()
      return itemDate >= startTimestamp && itemDate <= endTimestamp
    })
  }

  // Prepare chart data
  const getChartData = () => {
    if (!priceData || !priceData.history) return null

    // Get data for all selected commodities
    const datasets = selectedCommodities.map((commodityId, index) => {
      const filteredData = getFilteredHistoricalData(commodityId)
      const commodity = commodities.find((c) => c.id === commodityId)

      // Generate a color based on index
      const colors = [
        COLORS.primary,
        COLORS.accent,
        "#2E8B57", // Sea green
        "#4682B4", // Steel blue
        "#8B4513", // Saddle brown
      ]

      const color = colors[index % colors.length]

      return {
        data: filteredData.map((item) => item.price),
        color: (opacity = 1) => `rgba(${color.replace(/[^\d,]/g, "")}, ${opacity})`,
        strokeWidth: 2,
        label: t("common.language") === "en" ? commodity.name : commodity.name_ur,
      }
    })

    // Get labels (dates) from the first dataset
    const firstDataset = getFilteredHistoricalData(selectedCommodities[0])
    const labels = firstDataset.map((item) => {
      const date = new Date(item.date)
      return `${date.getDate()}/${date.getMonth() + 1}`
    })

    return {
      labels,
      datasets,
      legend: selectedCommodities.map((commodityId) => {
        const commodity = commodities.find((c) => c.id === commodityId)
        return t("common.language") === "en" ? commodity.name : commodity.name_ur
      }),
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

  // Export data
  const exportData = () => {
    // In a real app, this would generate and download a CSV or Excel file
    alert(t("historical.exportSuccess"))
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("historical.title")} showBackButton={true} />

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
            label={t("historical.timeRange")}
            data={timeRangeOptions}
            value={timeRange}
            onSelect={setTimeRange}
            style={styles.dropdown}
          />

          <Dropdown
            label={t("historical.chartType")}
            data={chartTypeOptions}
            value={chartType}
            onSelect={setChartType}
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

        {priceData ? (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>
              {t("historical.priceHistory")} -{" "}
              {selectedCommodities.length === 1
                ? t("common.language") === "en"
                  ? commodities.find((c) => c.id === selectedCommodities[0])?.name
                  : commodities.find((c) => c.id === selectedCommodities[0])?.name_ur
                : t("historical.multipleCommodities")}
            </Text>

            {getChartData() && chartType === "line" && (
              <LineChart
                data={getChartData()}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                fromZero
                yAxisSuffix=" PKR"
              />
            )}

            {getChartData() && chartType === "bar" && (
              <BarChart
                data={getChartData()}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
                yAxisSuffix=" PKR"
              />
            )}

            <View style={styles.legendContainer}>
              {selectedCommodities.map((commodityId, index) => {
                const commodity = commodities.find((c) => c.id === commodityId)
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
              })}
            </View>
          </Card>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
          </View>
        )}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>{t("historical.statistics")}</Text>

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
        </View>

        <Button
          title={t("historical.exportData")}
          onPress={exportData}
          type="primary"
          icon={<Ionicons name="download-outline" size={18} color={COLORS.white} style={styles.buttonIcon} />}
          style={styles.exportButton}
        />
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
  filtersContainer: {
    marginBottom: SPACING.medium,
  },
  dropdown: {
    marginBottom: SPACING.medium,
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
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.large,
    marginBottom: SPACING.large,
    ...SHADOWS.medium,
  },
  statsTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    color: COLORS.text.primary,
  },
  statsTable: {
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
  exportButton: {
    marginBottom: SPACING.large,
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
  },
})

export default HistoricalDataScreen

