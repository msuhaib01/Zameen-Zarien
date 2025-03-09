import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, FONT, SPACING } from "../theme"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

const Header = ({ title, showBackButton = false, rightComponent, onBackPress, containerStyle }) => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      navigation.goBack()
    }
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <StatusBar 
        backgroundColor={COLORS.primary} 
        barStyle="light-content" 
      />
      
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {showBackButton ? (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderLeft} />
          )}
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title || t("common.appName")}
          </Text>
        </View>

        <View style={styles.rightContainer}>
          {rightComponent ? rightComponent : <View style={styles.placeholderRight} />}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 16 : 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    ...Platform.select({
      android: {
        elevation: 4,
        shadowColor: "#000",
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    height: 60,
  },
  leftContainer: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backButton: {
    padding: SPACING.xs,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  rightContainer: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  placeholderLeft: {
    width: 24,
  },
  placeholderRight: {
    width: 24,
  },
})

export default Header

