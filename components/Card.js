import { View, StyleSheet, Platform } from "react-native"
import { COLORS, SHADOWS, SPACING } from "../theme"

const Card = ({
  children,
  style,
  noPadding = false,
  variant = "default",
  borderColor,
  elevation,
  shadow = "medium",
  accentColor,
  accentPosition = "left"
}) => {
  return (
    <View style={[
      styles.card,
      styles[variant] || styles.default,
      styles[`shadow${shadow.charAt(0).toUpperCase() + shadow.slice(1)}`] || styles.shadowMedium,
      noPadding && styles.noPadding,
      borderColor && { borderColor },
      elevation !== undefined && {
        elevation,
        shadowOpacity: elevation / 10,
      },
      accentColor && accentPosition === "left" && {
        borderLeftWidth: 4,
        borderLeftColor: accentColor || COLORS.primary,
      },
      accentColor && accentPosition === "top" && {
        borderTopWidth: 4,
        borderTopColor: accentColor || COLORS.primary,
      },
      accentColor && accentPosition === "right" && {
        borderRightWidth: 4,
        borderRightColor: accentColor || COLORS.primary,
      },
      accentColor && accentPosition === "bottom" && {
        borderBottomWidth: 4,
        borderBottomColor: accentColor || COLORS.primary,
      },
      style
    ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.large,
    marginVertical: SPACING.medium,
    overflow: 'hidden',
  },
  // Card variants
  default: {
    backgroundColor: COLORS.white,
  },
  primary: {
    backgroundColor: COLORS.primaryLight,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outlined: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderGreen,
  },
  elevated: {
    backgroundColor: COLORS.white,
  },
  success: {
    backgroundColor: COLORS.success,
  },
  warning: {
    backgroundColor: COLORS.warning,
  },
  error: {
    backgroundColor: COLORS.error,
  },
  info: {
    backgroundColor: COLORS.info,
  },
  earth: {
    backgroundColor: COLORS.earth,
  },
  greenAccent: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  greenOutline: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderGreen,
  },
  lightGreen: {
    backgroundColor: COLORS.background.green,
  },
  // Shadow variants
  shadowSubtle: {
    ...(Platform.OS === 'ios'
      ? SHADOWS.subtle
      : {
          elevation: 1,
          shadowColor: "#000",
        }
    ),
  },
  shadowSmall: {
    ...(Platform.OS === 'ios'
      ? SHADOWS.small
      : {
          elevation: 2,
          shadowColor: "#000",
        }
    ),
  },
  shadowMedium: {
    ...(Platform.OS === 'ios'
      ? SHADOWS.medium
      : {
          elevation: 4,
          shadowColor: "#000",
        }
    ),
  },
  shadowLarge: {
    ...(Platform.OS === 'ios'
      ? SHADOWS.large
      : {
          elevation: 6,
          shadowColor: "#000",
        }
    ),
  },
  shadowXl: {
    ...(Platform.OS === 'ios'
      ? SHADOWS.xl
      : {
          elevation: 8,
          shadowColor: "#000",
        }
    ),
  },
  shadowPrimary: {
    ...(Platform.OS === 'ios'
      ? SHADOWS.primary
      : {
          elevation: 4,
          shadowColor: COLORS.primary,
        }
    ),
  },
  noPadding: {
    padding: 0,
  }
})

export default Card

