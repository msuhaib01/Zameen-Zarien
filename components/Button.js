import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, View } from "react-native"
import { COLORS, SPACING, SHADOWS, FONT } from "../theme"

const Button = ({
  title,
  onPress,
  type = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch (type) {
      case "primary":
        return styles.primaryButton
      case "secondary":
        return styles.secondaryButton
      case "outline":
        return styles.outlineButton
      case "danger":
        return styles.dangerButton
      case "success":
        return styles.successButton
      default:
        return styles.primaryButton
    }
  }

  const getTextStyle = () => {
    switch (type) {
      case "primary":
        return styles.primaryText
      case "secondary":
        return styles.secondaryText
      case "outline":
        return styles.outlineText
      case "danger":
        return styles.dangerText
      case "success":
        return styles.successText
      default:
        return styles.primaryText
    }
  }

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.smallButton
      case "medium":
        return styles.mediumButton
      case "large":
        return styles.largeButton
      default:
        return styles.mediumButton
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), getSizeStyle(), disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={type === "outline" ? COLORS.primary : COLORS.white} size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, getTextStyle(), disabled && styles.disabledText, textStyle]} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    ...(Platform.OS === 'ios' ? SHADOWS.small : { 
      elevation: 2,
      shadowColor: "#000",
    }),
    overflow: 'hidden', // Fix for Android ripple effect
  },
  text: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: FONT.sizes.medium,
  },
  iconContainer: {
    marginRight: SPACING.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Button types
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  secondaryText: {
    color: COLORS.text.primary,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  dangerText: {
    color: COLORS.white,
  },
  successButton: {
    backgroundColor: COLORS.success,
  },
  successText: {
    color: COLORS.white,
  },
  // Button sizes
  smallButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.medium,
    minWidth: 80,
    minHeight: 32,
  },
  mediumButton: {
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    minWidth: 120,
    minHeight: 40,
  },
  largeButton: {
    paddingVertical: SPACING.large,
    paddingHorizontal: SPACING.xl,
    minWidth: 160,
    minHeight: 48,
  },
  // Disabled state
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.lightGray,
  },
  disabledText: {
    color: COLORS.gray,
  },
})

export default Button

