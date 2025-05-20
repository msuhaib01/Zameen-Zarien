import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SPACING } from '../theme';

/**
 * GridRow component for creating responsive row layouts
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render in the row
 * @param {Object} props.style - Additional styles for the row
 * @param {string|number} props.gap - Gap between row items (default: SPACING.medium)
 * @param {boolean} props.wrap - Whether to wrap items to next line (default: true)
 * @param {string} props.justifyContent - Justify content value (default: 'space-between')
 * @param {string} props.alignItems - Align items value (default: 'stretch')
 * @returns {React.ReactElement}
 */
const GridRow = ({
  children,
  style,
  gap = SPACING.medium,
  wrap = true,
  justifyContent = 'space-between',
  alignItems = 'stretch',
}) => {
  return (
    <View style={[
      styles.container,
      {
        gap,
        justifyContent,
        alignItems,
        flexWrap: wrap ? 'wrap' : 'nowrap',
      },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: SPACING.medium,
    ...(Platform.OS === 'web' ? {
      display: 'flex',
    } : {}),
  },
});

export default GridRow;
