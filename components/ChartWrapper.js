import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS, FONT, SPACING } from "../theme";
import { useTranslation } from "react-i18next";

/**
 * A wrapper component that safely renders charts with error handling
 * and platform-specific implementations
 */
const ChartWrapper = ({
  data,
  chartType = 'line',
  width,
  height = 220,
  chartConfig,
  style,
  onError
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebPlatform, setIsWebPlatform] = useState(Platform.OS === 'web');
  const [chartWidth, setChartWidth] = useState(width || Math.min(Dimensions.get('window').width - 40, 1000));

  useEffect(() => {
    setIsWebPlatform(Platform.OS === 'web');
    setIsLoading(false);
    
    // Adjust width for Android to prevent overflow
    if (Platform.OS === 'android') {
      setChartWidth(Math.min(Dimensions.get('window').width - 40, width || 1000));
    } else {
      setChartWidth(width || Math.min(Dimensions.get('window').width - 40, 1000));
    }
  }, [width]);

  useEffect(() => {
    // Reset error state when data changes
    setError(null);
  }, [data]);

  if (!data || !data.datasets || !data.labels) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.noDataText}>{t("historical.noDataAvailable")}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>{t("historical.chartRenderingError")}</Text>
        <Text style={styles.errorDetailText}>{error.message}</Text>
      </View>
    );
  }

  // Special handling for web platform
  if (isWebPlatform) {
    return (
      <View style={[styles.webContainer, style]}>
        <Text style={styles.webMessage}>
          {t("historical.customChartView")}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Date</Text>
              {data.datasets.map((dataset, index) => (
                <Text key={`header-${index}`} style={styles.tableHeaderCell}>
                  {dataset.label || `Series ${index + 1}`}
                </Text>
              ))}
            </View>
            <View style={styles.tableBody}>
              {data.labels.map((label, labelIndex) => (
                <View key={`row-${labelIndex}`} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{label}</Text>
                  {data.datasets.map((dataset, datasetIndex) => (
                    <Text key={`cell-${labelIndex}-${datasetIndex}`} style={styles.tableCell}>
                      {dataset.data[labelIndex]} PKR
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Native platform charts
  try {
    // Configure chart based on platform
    const platformChartConfig = {
      ...chartConfig,
      // Android-specific optimizations
      propsForLabels: Platform.OS === 'android' ? {
        fontSize: FONT.sizes.xs,
      } : chartConfig.propsForLabels,
      propsForBackgroundLines: Platform.OS === 'android' ? {
        strokeWidth: 1,
        strokeDasharray: [], // Solid lines work better on Android
      } : chartConfig.propsForBackgroundLines,
    };

    // For Android & iOS
    if (chartType === 'line') {
      return (
        <View style={[styles.chartContainer, style]}>
          <LineChart
            data={data}
            width={chartWidth}
            height={height}
            chartConfig={platformChartConfig}
            bezier
            style={styles.chart}
            fromZero
            yAxisSuffix=" PKR"
            withInnerLines={Platform.OS !== 'android'} // Disable inner lines on Android for better performance
            segments={Platform.OS === 'android' ? 4 : 6} // Fewer segments on Android
          />
        </View>
      );
    } else if (chartType === 'bar') {
      return (
        <View style={[styles.chartContainer, style]}>
          <BarChart
            data={data}
            width={chartWidth}
            height={height}
            chartConfig={platformChartConfig}
            style={styles.chart}
            fromZero
            yAxisSuffix=" PKR"
            showBarTops={Platform.OS !== 'android'} // Disable bar tops on Android for better performance
            withInnerLines={Platform.OS !== 'android'} // Disable inner lines on Android
          />
        </View>
      );
    }
  } catch (error) {
    console.error('Error rendering chart:', error);
    setError(error);
    if (onError) onError(error);
    
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>{t("historical.chartRenderingError")}</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 16,
    padding: SPACING.medium,
    overflow: 'hidden',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 16,
  },
  chart: {
    borderRadius: 16,
    ...(Platform.OS === 'android' ? { marginLeft: -10 } : {}), // Fix alignment issues on Android
  },
  noDataText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
  },
  errorText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.error,
    marginBottom: SPACING.small,
    textAlign: 'center',
  },
  errorDetailText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  webContainer: {
    height: 220,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.medium,
    overflow: 'hidden',
  },
  webMessage: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
    marginBottom: SPACING.small,
    textAlign: 'center',
  },
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.small,
    marginBottom: SPACING.small,
  },
  tableHeaderCell: {
    width: 100,
    fontWeight: 'bold',
    fontSize: FONT.sizes.small,
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.small,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableCell: {
    width: 100,
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
    paddingHorizontal: SPACING.small,
  },
});

export default ChartWrapper; 