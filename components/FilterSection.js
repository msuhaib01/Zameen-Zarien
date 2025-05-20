"use client";

import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../theme";
import Dropdown from "./Dropdown";
import Card from "./Card";

/**
 * Standardized filter section component for commodity and location selection
 * Used across dashboard, forecast, and real-time pages
 */
const FilterSection = ({
  commodityOptions,
  locationOptions,
  selectedCommodity,
  selectedLocation,
  onSelectCommodity,
  onSelectLocation,
  commodityLabel,
  locationLabel,
  style,
}) => {
  return (
    <Card style={[styles.container, style]}>
      <View style={styles.filtersContainer}>
        <Dropdown
          label={commodityLabel}
          data={commodityOptions}
          value={selectedCommodity}
          onSelect={onSelectCommodity}
          style={styles.dropdown}
        />

        <Dropdown
          label={locationLabel}
          data={locationOptions}
          value={selectedLocation}
          onSelect={onSelectLocation}
          style={styles.dropdown}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.large,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  filtersContainer: {
    gap: SPACING.medium,
  },
  dropdown: {
    marginBottom: 0, // Override the default margin in Dropdown component
  },
});

export default FilterSection;
