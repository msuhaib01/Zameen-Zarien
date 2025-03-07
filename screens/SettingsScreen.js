"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Image } from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

import Header from "../components/Header"
import Card from "../components/Card"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import ToggleSwitch from "../components/ToggleSwitch"
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"
import { useApp } from "../context/AppContext"

const SettingsScreen = ({ navigation }) => {
  const { t } = useTranslation()
  const {
    user,
    logout,
    language,
    changeLanguage,
    commodities,
    selectedCommodity,
    setSelectedCommodity,
    doNotDisturb,
    toggleDoNotDisturb,
  } = useApp()

  const [defaultView, setDefaultView] = useState("dashboard")
  const [dataUpdateFrequency, setDataUpdateFrequency] = useState("hourly")
  const [notificationSound, setNotificationSound] = useState(true)
  const [vibration, setVibration] = useState(true)

  // Language options
  const languageOptions = [
    { label: "English", value: "en" },
    { label: "اردو", value: "ur" },
  ]

  // Default view options
  const defaultViewOptions = [
    { label: t("dashboard.title"), value: "dashboard" },
    { label: t("forecast.title"), value: "forecast" },
    { label: t("historical.title"), value: "historical" },
    { label: t("alerts.title"), value: "alerts" },
  ]

  // Data update frequency options
  const dataUpdateFrequencyOptions = [
    { label: t("settings.realTime"), value: "realtime" },
    { label: t("settings.hourly"), value: "hourly" },
    { label: t("settings.daily"), value: "daily" },
  ]

  // Commodity options
  const commodityOptions = commodities.map((commodity) => ({
    label: t("common.language") === "en" ? commodity.name : commodity.name_ur,
    value: commodity.id,
  }))

  // Handle logout
  const handleLogout = () => {
    Alert.alert(t("settings.confirmLogout"), t("settings.confirmLogoutMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("settings.logout"),
        onPress: () => logout(),
        style: "destructive",
      },
    ])
  }

  // Handle clear data
  const handleClearData = () => {
    Alert.alert(t("settings.confirmClearData"), t("settings.confirmClearDataMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("settings.clearData"),
        onPress: () => {
          // Clear all app data except user authentication
          AsyncStorage.multiRemove([
            "alerts",
            "notifications",
            "defaultView",
            "dataUpdateFrequency",
            "notificationSound",
            "vibration",
          ]).then(() => {
            Alert.alert(t("settings.dataCleared"), t("settings.dataSuccessfullyCleared"))
          })
        },
        style: "destructive",
      },
    ])
  }

  // Handle reset settings
  const handleResetSettings = () => {
    Alert.alert(t("settings.confirmResetSettings"), t("settings.confirmResetSettingsMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("settings.resetSettings"),
        onPress: () => {
          // Reset settings to defaults
          setDefaultView("dashboard")
          setDataUpdateFrequency("hourly")
          setNotificationSound(true)
          setVibration(true)
          setSelectedCommodity(1)
          Alert.alert(t("settings.settingsReset"), t("settings.settingsSuccessfullyReset"))
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("settings.title")} showBackButton={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* User Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={require("../assets/logo-placeholder.png")}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || "Demo User"}</Text>
              <Text style={styles.profilePhone}>{user?.phoneNumber || "03xx xxx xxxx"}</Text>
              <Text style={styles.profileEmail}>{user?.email || "user@example.com"}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={styles.editProfileText}>{t("settings.editProfile")}</Text>
          </TouchableOpacity>
        </Card>

        {/* App Settings Section */}
        <Text style={styles.sectionTitle}>{t("settings.appSettings")}</Text>

        <Card style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t("settings.language")}</Text>
            <Dropdown
              data={languageOptions}
              value={language}
              onSelect={changeLanguage}
              style={styles.settingDropdown}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t("settings.defaultCommodity")}</Text>
            <Dropdown
              data={commodityOptions}
              value={selectedCommodity}
              onSelect={setSelectedCommodity}
              style={styles.settingDropdown}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t("settings.defaultView")}</Text>
            <Dropdown
              data={defaultViewOptions}
              value={defaultView}
              onSelect={setDefaultView}
              style={styles.settingDropdown}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t("settings.dataUpdateFrequency")}</Text>
            <Dropdown
              data={dataUpdateFrequencyOptions}
              value={dataUpdateFrequency}
              onSelect={setDataUpdateFrequency}
              style={styles.settingDropdown}
            />
          </View>
        </Card>

        {/* Notification Settings Section */}
        <Text style={styles.sectionTitle}>{t("settings.notificationSettings")}</Text>

        <Card style={styles.settingsCard}>
          <ToggleSwitch
            label={t("notifications.doNotDisturb")}
            value={doNotDisturb}
            onValueChange={toggleDoNotDisturb}
            style={styles.toggleItem}
          />

          <ToggleSwitch
            label={t("settings.notificationSound")}
            value={notificationSound}
            onValueChange={setNotificationSound}
            style={styles.toggleItem}
          />

          <ToggleSwitch
            label={t("settings.vibration")}
            value={vibration}
            onValueChange={setVibration}
            style={styles.toggleItem}
          />
        </Card>

        {/* Account Actions Section */}
        <Text style={styles.sectionTitle}>{t("settings.accountActions")}</Text>

        <Card style={styles.actionsCard}>
          <Button
            title={t("settings.resetSettings")}
            onPress={handleResetSettings}
            type="outline"
            icon={<Ionicons name="refresh-outline" size={18} color={COLORS.primary} style={styles.buttonIcon} />}
            style={styles.actionButton}
          />

          <Button
            title={t("settings.clearData")}
            onPress={handleClearData}
            type="outline"
            icon={<Ionicons name="trash-outline" size={18} color={COLORS.primary} style={styles.buttonIcon} />}
            style={styles.actionButton}
          />

          <Button
            title={t("settings.logout")}
            onPress={handleLogout}
            type="primary"
            icon={<Ionicons name="log-out-outline" size={18} color={COLORS.white} style={styles.buttonIcon} />}
            style={styles.logoutButton}
          />
        </Card>

        {/* About Section */}
        <Card style={styles.aboutCard}>
          <Text style={styles.appVersion}>{t("settings.version")} 1.0.0</Text>

          <View style={styles.aboutLinks}>
            <TouchableOpacity style={styles.aboutLink}>
              <Text style={styles.aboutLinkText}>{t("common.termsAndConditions")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.aboutLink}>
              <Text style={styles.aboutLinkText}>{t("common.privacyPolicy")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.aboutLink}>
              <Text style={styles.aboutLinkText}>{t("common.contactSupport")}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.large,
    paddingBottom: SPACING.xxxl,
  },
  profileCard: {
    marginBottom: SPACING.large,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.background.tertiary,
    overflow: "hidden",
    marginRight: SPACING.large,
    ...SHADOWS.small,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  profilePhone: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  editProfileText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.medium,
    marginTop: SPACING.large,
  },
  settingsCard: {
    marginBottom: SPACING.large,
  },
  settingItem: {
    marginBottom: SPACING.large,
  },
  settingLabel: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.small,
  },
  settingDropdown: {
    marginBottom: 0,
  },
  toggleItem: {
    marginBottom: SPACING.medium,
  },
  actionsCard: {
    marginBottom: SPACING.large,
  },
  actionButton: {
    marginBottom: SPACING.medium,
  },
  logoutButton: {
    backgroundColor: COLORS.accent,
  },
  buttonIcon: {
    marginRight: SPACING.small,
  },
  aboutCard: {
    alignItems: "center",
    paddingVertical: SPACING.large,
  },
  appVersion: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.large,
  },
  aboutLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  aboutLink: {
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  aboutLinkText: {
    fontSize: FONT.sizes.small,
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
})

export default SettingsScreen

