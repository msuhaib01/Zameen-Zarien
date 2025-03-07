import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, FONT, SPACING } from "../theme"
import { useNavigation } from "@react-navigation/native"

const Header = ({ title, showBackButton = false, rightComponent }) => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title || t("common.appName")}</Text>
      </View>
      <View style={styles.rightContainer}>{rightComponent}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    height: 60,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: SPACING.medium,
  },
  title: {
    color: COLORS.white,
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
})

export default Header

