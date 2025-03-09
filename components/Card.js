import { View, StyleSheet, Platform } from "react-native"
import { COLORS, SHADOWS, SPACING } from "../theme"

const Card = ({ children, style, noPadding = false }) => {
  return (
    <View style={[
      styles.card,
      noPadding && styles.noPadding,
      style
    ]}>
      {children}
    </View>
  )
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
          borderWidth: 0.2,
          borderColor: COLORS.border,
        }
    ),
  },
  noPadding: {
    padding: 0,
  }
})

export default Card

