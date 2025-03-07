import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native"
import { COLORS, SPACING, SHADOWS } from "../theme"

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
    >
      {loading ? (
        <ActivityIndicator color={type === "outline" ? COLORS.primary : COLORS.white} />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.text, getTextStyle(), disabled && styles.disabledText, textStyle]}>{title}</Text>
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
    ...SHADOWS.small,
  },
  text: {
    fontWeight: "bold",
    textAlign: "center",
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
  },
  mediumButton: {
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    minWidth: 120,
  },
  largeButton: {
    paddingVertical: SPACING.large,
    paddingHorizontal: SPACING.xl,
    minWidth: 160,
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

