"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import Header from "../components/Header";
import WebLayout from "../components/WebLayout";
import Card from "../components/Card";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import FilterSection from "../components/FilterSection";
import GridContainer from "../components/GridContainer";
import { COLORS, FONT, SPACING, SHADOWS } from "../theme";
import { useApp } from "../context/AppContext";
import {
  getRealTimeData,
  checkApiAvailability,
} from "../services/cropPricesService";

const RealTimeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation(); // Ensure i18n is destructured
  const { commodities, locations } = useApp();
  const windowDimensions = useWindowDimensions();
  const [isWebPlatform] = useState(Platform.OS === "web");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [realTimeData, setRealTimeData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCommodity, setSelectedCommodity] = useState("all");
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [uniqueCommodities, setUniqueCommodities] = useState([]);
  const [error, setError] = useState(null);

  // Location and commodity filter options
  const locationOptions = [
    { label: t("common.allLocations"), value: "all" },
    ...uniqueLocations.map((locationName) => {
      const locObject = locations.find(locCtx => locCtx.name === locationName);
      const label = i18n.language === 'ur'
        ? (locObject?.name_ur || locationName)
        : (locObject?.name || locationName);
      return {
        label: label,
        value: locationName,
      };
    }),
  ];

  const commodityOptions = [
    { label: t("common.allCommodities"), value: "all" },
    ...uniqueCommodities.map((commodityName) => {
      const comObject = commodities.find(comCtx => comCtx.name === commodityName);
      const label = i18n.language === 'ur'
        ? (comObject?.name_ur || commodityName)
        : (comObject?.name || commodityName);
      return {
        label: label,
        value: commodityName,
      };
    }),
  ];

  // Load real-time data when component mounts
  useEffect(() => {
    checkApiAndLoadData();
  }, []);

  // Check API availability and load data
  const checkApiAndLoadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if API is available
      const result = await checkApiAvailability();
      setIsApiAvailable(result.available);

      if (!result.available) {
        console.error("API is not available:", result.error);
        setError(t("errors.apiNotAvailable", { error: result.error }));
        return;
      }

      // Load real-time data
      await loadRealTimeData();
    } catch (error) {
      console.error("Error checking API availability:", error);
      setError(t("errors.general"));
    } finally {
      setIsLoading(false);
    }
  };

  // Load real-time data from API
  const loadRealTimeData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get real-time data from API
      const response = await getRealTimeData();

      if (!response || !response.data || response.data.length === 0) {
        setError(t("realTime.noDataAvailable"));
        return;
      }

      setRealTimeData(response.data);

      // Extract unique locations and commodities for filters
      const locations = [
        ...new Set(response.data.map((item) => item.CityName)),
      ];
      const commodities = [
        ...new Set(response.data.map((item) => item.CropName)),
      ];

      setUniqueLocations(locations);
      setUniqueCommodities(commodities);
    } catch (error) {
      console.error("Error loading real-time data:", error);
      setError(t("errors.dataLoadFailed", { error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on selected location and commodity
  const getFilteredData = () => {
    if (!realTimeData || realTimeData.length === 0) return [];

    return realTimeData.filter((item) => {
      const locationMatch =
        selectedLocation === "all" || item.CityName === selectedLocation;
      const commodityMatch =
        selectedCommodity === "all" || item.CropName === selectedCommodity;
      return locationMatch && commodityMatch;
    });
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await checkApiAndLoadData();
    setRefreshing(false);
  };

  // Get price change class based on change value
  const getPriceChangeClass = (change) => {
    if (!change) return styles.neutral;

    // Remove any non-numeric characters except for the sign
    const cleanChange = change.replace(/[^0-9+-]/g, "");

    if (cleanChange.startsWith("+")) return styles.positive;
    if (cleanChange.startsWith("-")) return styles.negative;
    return styles.neutral;
  };

  const filteredData = getFilteredData();

  // Render content for both web and mobile
  const renderContent = () => (
    <>
      {/* Filters */}
      <FilterSection
        commodityOptions={commodityOptions}
        locationOptions={locationOptions}
        selectedCommodity={selectedCommodity}
        selectedLocation={selectedLocation}
        onSelectCommodity={setSelectedCommodity}
        onSelectLocation={setSelectedLocation}
        commodityLabel={t("dashboard.commodity")}
        locationLabel={t("realTime.location")}
        style={styles.filtersCard}
      />

      {/* Loading indicator */}
      {isLoading ? (
        <Card style={styles.loadingCard} shadow="medium">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </Card>
      ) : error ? (
        // Error message
        <Card style={styles.errorCard} shadow="medium">
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={COLORS.error}
            style={styles.errorIcon}
          />
          <Text style={styles.errorTitle}>{t("errors.title")}</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title={t("common.retry")}
            onPress={checkApiAndLoadData}
            style={styles.retryButton}
          />
        </Card>
      ) : filteredData.length === 0 ? (
        // No data message
        <Card style={styles.noDataCard} shadow="medium">
          <Ionicons
            name="search-outline"
            size={64}
            color={COLORS.gray}
            style={styles.noDataIcon}
          />
          <Text style={styles.noDataTitle}>{t("realTime.noDataFound")}</Text>
          <Text style={styles.noDataText}>
            {t("realTime.tryDifferentFilters")}
          </Text>
        </Card>
      ) : (
        // Real-time data table
        <Card style={styles.tableCard} shadow="medium">
          <Text style={styles.tableTitle}>{t("realTime.marketPrices")}</Text>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.locationCell]}>
              {t("realTime.location")}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.commodityCell]}>
              {t("realTime.commodity")}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.priceCell]}>
              {t("realTime.todayPrice")}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.priceCell]}>
              {t("realTime.yesterdayPrice")}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.changeCell]}>
              {t("realTime.change")}
            </Text>
          </View>

          {/* Table body */}
          <ScrollView style={styles.tableBody}>
            {filteredData.map((item, index) => {
              const locObject = locations.find(locCtx => locCtx.name === item.CityName);
              const displayCityName = i18n.language === 'ur'
                ? (locObject?.name_ur || item.CityName)
                : (locObject?.name || item.CityName);

              const comObject = commodities.find(comCtx => comCtx.name === item.CropName);
              const displayCropName = i18n.language === 'ur'
                ? (comObject?.name_ur || item.CropName)
                : (comObject?.name || item.CropName);

              return (
                <View key={index} style={styles.tableRow}>
                  <Text
                    style={[styles.tableCell, styles.locationCell]}
                    numberOfLines={1}
                  >
                    {displayCityName}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.commodityCell]}
                    numberOfLines={1}
                  >
                    {displayCropName}
                  </Text>
                  <Text style={[styles.tableCell, styles.priceCell]}>
                    {item["Today's FQP/Average Price"]}
                  </Text>
                  <Text style={[styles.tableCell, styles.priceCell]}>
                    {item["Yesterday's FQP/Average Price"]}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.changeCell,
                      getPriceChangeClass(item["Change in Price"]),
                    ]}
                  >
                    {item["Change in Price"]}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </Card>
      )}
    </>
  );

  // Return different layouts based on platform
  return isWebPlatform ? (
    <WebLayout
      title={t("realTime.title")}
      currentScreen="RealTime"
      navigation={navigation}
      fullWidth={true}
    >
      {renderContent()}
    </WebLayout>
  ) : (
    <SafeAreaView style={styles.container}>
      <Header title={t("realTime.title")} showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
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
    paddingBottom: SPACING.xxl,
  },
  // Filters
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
    marginHorizontal: SPACING.xs,
  },
  // Loading state
  loadingCard: {
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  loadingText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    marginTop: SPACING.medium,
  },
  // Error state
  errorCard: {
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
  },
  errorIcon: {
    marginBottom: SPACING.medium,
  },
  errorTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.error,
    marginBottom: SPACING.small,
    textAlign: "center",
  },
  errorText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.large,
  },
  retryButton: {
    marginTop: SPACING.medium,
  },
  // No data state
  noDataCard: {
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  noDataIcon: {
    marginBottom: SPACING.medium,
  },
  noDataTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.small,
    textAlign: "center",
  },
  noDataText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  // Table styles
  tableCard: {
    padding: SPACING.medium,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.medium,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 125, 50, 0.2)',
    paddingVertical: SPACING.medium,
  },
  tableHeaderCell: {
    fontWeight: "bold",
    color: COLORS.text.primary,
    fontSize: FONT.sizes.small,
    textAlign: "center",
    paddingHorizontal: SPACING.xs,
  },
  tableBody: {
    maxHeight: 400, // Limit table height
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.medium,
    backgroundColor: COLORS.white,
  },
  tableCell: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.primary,
    textAlign: "center",
    paddingHorizontal: SPACING.xs,
  },
  // Cell width distribution
  locationCell: {
    width: "20%",
  },
  commodityCell: {
    width: "30%",
  },
  priceCell: {
    width: "20%",
  },
  changeCell: {
    width: "10%",
  },
  // Price change colors
  positive: {
    color: COLORS.chart.green,
    fontWeight: "bold",
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  negative: {
    color: COLORS.chart.red,
    fontWeight: "bold",
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  neutral: {
    color: COLORS.text.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  // Legacy styles for placeholder (can be removed later)
  placeholderCard: {
    alignItems: "center",
    padding: SPACING.xl,
    marginBottom: SPACING.large,
  },
  placeholderIcon: {
    marginBottom: SPACING.large,
  },
  placeholderTitle: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.medium,
    textAlign: "center",
  },
  placeholderText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  infoCard: {
    padding: SPACING.large,
  },
  infoTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.large,
  },
  featureList: {
    marginTop: SPACING.medium,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.large,
  },
  featureIcon: {
    marginRight: SPACING.medium,
  },
  featureText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    flex: 1,
  },
});

export default RealTimeScreen;
