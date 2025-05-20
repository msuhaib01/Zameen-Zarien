import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SPACING } from '../theme';

/**
 * GridContainer component for creating responsive grid layouts
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render in the grid
 * @param {number} props.columns - Number of columns for large screens (default: 2)
 * @param {number} props.columnsTablet - Number of columns for medium screens (default: 2)
 * @param {number} props.columnsMobile - Number of columns for small screens (default: 1)
 * @param {string|number} props.gap - Gap between grid items (default: SPACING.large)
 * @param {Object} props.style - Additional styles for the container
 * @param {boolean} props.autoFill - Whether to use auto-fill instead of fixed columns (default: false)
 * @param {string|number} props.minItemWidth - Minimum width of each item when using autoFill (default: '300px')
 * @returns {React.ReactElement}
 */
const GridContainer = ({
  children,
  columns = 2,
  columnsTablet = 2,
  columnsMobile = 1,
  gap = SPACING.large,
  style,
  autoFill = false,
  minItemWidth = '300px',
}) => {
  // Web-specific styles using CSS Grid
  if (Platform.OS === 'web') {
    const gridStyle = {
      display: 'grid',
      gridGap: gap,
      width: '100%',
      ...(autoFill
        ? {
            gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
          }
        : {
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            // Responsive grid using media queries
            '@media (max-width: 1200px)': {
              gridTemplateColumns: `repeat(${columnsTablet}, 1fr)`,
            },
            '@media (max-width: 768px)': {
              gridTemplateColumns: `repeat(${columnsMobile}, 1fr)`,
            },
          }),
    };

    return (
      <View style={[styles.container, gridStyle, style]}>
        {children}
      </View>
    );
  }

  // For non-web platforms, use a simple row with flexWrap
  return (
    <View style={[styles.container, styles.flexContainer, { gap }, style]}>
      {React.Children.map(children, (child) => (
        <View style={[styles.flexItem, { width: `${100 / columnsMobile}%` }]}>
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  flexContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flexItem: {
    paddingHorizontal: SPACING.small,
    marginBottom: SPACING.large,
  },
});

export default GridContainer;
