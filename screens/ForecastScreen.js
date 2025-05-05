"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView } from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import Slider from "@react-native-community/slider"

import Header from "../components/Header"
import Card from "../components/Card"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import { COLORS, FONT, SPACING } from "../theme"
import { useApp } from "../context/AppContext"
import { getForecast, getPriceHistory } from "../services/cropPricesService"

const screenWidth = Dimensions.get("window").width

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
  const [forecastDays, setForecastDays] = useState(7)
  const [compareWithHistorical, setCompareWithHistorical] = useState(false)

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
  }, [selectedCommodity, selectedLocation, forecastDays, compareWithHistorical])

  // Load price data
  const loadPriceData = async () => {
    try {
      // Get commodity and location names
      const commodityName = commodities.find(c => c.id === selectedCommodity)?.name
      const locationName = locations.find(l => l.id === selectedLocation)?.name

      if (!commodityName || !locationName) {
        console.error("Invalid commodity or location")
        return
      }

      // Get forecast data
      const forecastData = await getForecast(commodityName, locationName, forecastDays)

      // Get historical data for comparison if needed
      let historicalData = null
      if (compareWithHistorical) {
        // Get data for the past 30 days
        const today = new Date()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(today.getDate() - 30)

        const formattedStartDate = thirtyDaysAgo.toISOString().split('T')[0]
        const formattedEndDate = today.toISOString().split('T')[0]

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
      }

      setPriceData(transformedData)
    } catch (error) {
      console.error("Error loading forecast data:", error)
      setPriceData(null)
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

              <View style={styles.forecastDurationContainer}>
                <Text style={styles.forecastDurationLabel}>
                  {t("forecast.forecastDuration")}: {forecastDays} {t("forecast.days")}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={7}
                  step={1}
                  value={forecastDays}
                  onValueChange={setForecastDays}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.lightGray}
                  thumbTintColor={COLORS.primary}
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
              </View>
            </Card>

            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t("forecast.predictedPrice")}</Text>

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

                {priceData.forecast.slice(0, forecastDays).map((item, index) => (
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
  forecastDurationContainer: {
    marginBottom: SPACING.large,
  },
  forecastDurationLabel: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.small,
  },
  slider: {
    width: "100%",
    height: 40,
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

