import { View, StyleSheet } from "react-native"
import { COLORS, SHADOWS, SPACING } from "../theme"

const Card = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.large,
    marginVertical: SPACING.medium,
    ...SHADOWS.medium,
  },
})

export default Card

