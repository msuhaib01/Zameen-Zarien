import { View, StyleSheet, Platform } from "react-native"
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
    overflow: 'hidden',
    ...(Platform.OS === 'ios' 
      ? SHADOWS.medium 
      : {
          elevation: 4,
          shadowColor: "#000",
        }
    ),
  },
})

export default Card

