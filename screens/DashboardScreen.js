"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView } from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"

import Header from "../components/Header"
import Card from "../components/Card"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import { COLORS, FONT, SPACING } from "../theme"
import { useApp } from "../context/AppContext"

const screenWidth = Dimensions.get("window").width

const DashboardScreen = ({ navigation }) => {
  const { t } = useTranslation()
  const { commodities, selectedCommodity, setSelectedCommodity, timePeriod, setTimePeriod, getCommodityData } = useApp()

  const [refreshing, setRefreshing] = useState(false)
  const [priceData, setPriceData] = useState(null)

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

  // Load price data when selected commodity changes
  useEffect(() => {
    loadPriceData()
  }, [selectedCommodity, timePeriod])

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

  // Header right component
  const HeaderRight = () => (
    <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate("Notifications")}>
      <Ionicons name="notifications" size={24} color={COLORS.white} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("dashboard.title")} rightComponent={<HeaderRight />} />

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
            label={t("dashboard.timePeriod")}
            data={timePeriodOptions}
            value={timePeriod}
            onSelect={setTimePeriod}
            style={styles.dropdown}
          />
        </View>

        {priceData ? (
          <>
            <Card style={styles.priceCard}>
              <Text style={styles.cardTitle}>
                {t("common.language") === "en"
                  ? commodities.find((c) => c.id === selectedCommodity)?.name
                  : commodities.find((c) => c.id === selectedCommodity)?.name_ur}
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

            <View style={styles.actionsContainer}>
              <Button
                title={t("dashboard.exportData")}
                onPress={() => {
                  /* Handle export data */
                }}
                type="outline"
                icon={<Ionicons name="download-outline" size={18} color={COLORS.primary} style={styles.buttonIcon} />}
                style={styles.actionButton}
              />

              <Button
                title={t("dashboard.setAlert")}
                onPress={() => navigation.navigate("Alerts")}
                type="outline"
                icon={
                  <Ionicons name="notifications-outline" size={18} color={COLORS.primary} style={styles.buttonIcon} />
                }
                style={styles.actionButton}
              />
            </View>

            <View style={styles.navigationContainer}>
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
  priceCard: {
    marginBottom: SPACING.large,
  },
  cardTitle: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    textAlign: "center",
    color: COLORS.text.primary,
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
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.large,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
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
  },
})

export default DashboardScreen

