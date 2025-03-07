"use client"
import { View, Text, Switch, StyleSheet } from "react-native"
import { COLORS, FONT, SPACING } from "../theme"

const ToggleSwitch = ({ label, value, onValueChange, disabled = false, style }) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Switch
        trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
        thumbColor={value ? COLORS.white : COLORS.white}
        ios_backgroundColor={COLORS.lightGray}
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  label: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
})

export default ToggleSwitch

