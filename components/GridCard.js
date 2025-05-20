import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Card from './Card';
import { SPACING } from '../theme';

/**
 * GridCard component for creating responsive card layouts
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render in the card
 * @param {Object} props.style - Additional styles for the card
 * @param {string} props.variant - Card variant (default, primary, etc.)
 * @param {string} props.shadow - Shadow size (small, medium, large, etc.)
 * @param {number} props.flex - Flex value for the card (default: 1)
 * @param {boolean} props.equalHeight - Whether to enforce equal height for all cards in a row
 * @param {string|number} props.minHeight - Minimum height for the card
 * @returns {React.ReactElement}
 */
const GridCard = ({
  children,
  style,
  variant = 'default',
  shadow = 'medium',
  flex = 1,
  equalHeight = false,
  minHeight,
  ...cardProps
}) => {
  return (
    <View style={[
      styles.container,
      { flex },
      equalHeight && styles.equalHeight,
      minHeight && { minHeight },
    ]}>
      <Card
        style={[styles.card, style]}
        variant={variant}
        shadow={shadow}
        {...cardProps}
      >
        {children}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.small,
  },
  card: {
    height: '100%',
  },
  equalHeight: {
    ...(Platform.OS === 'web' ? {
      display: 'flex',
      flexDirection: 'column',
    } : {}),
  },
});

export default GridCard;
