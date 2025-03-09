"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Image, StatusBar, Platform } from "react-native"
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
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Header title={t("settings.title")} showBackButton={false} />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          <TouchableOpacity
            style={styles.actionButtonContainer}
            onPress={handleResetSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={22} color={COLORS.primary} style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>{t("settings.resetSettings")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonContainer}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={22} color={COLORS.primary} style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>{t("settings.clearData")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButtonContainer}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.white} style={styles.actionIcon} />
            <Text style={styles.logoutButtonText}>{t("settings.logout")}</Text>
          </TouchableOpacity>
        </Card>

        {/* Version Section */}
        <Card style={styles.versionCard}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          
          <View style={styles.linksContainer}>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>{t("common.termsAndConditions")}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>{t("common.privacyPolicy")}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>{t("common.contactSupport")}</Text>
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
    padding: 0,  // Remove padding for card
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: SPACING.large,
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
  actionButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  actionIcon: {
    marginRight: SPACING.medium,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: FONT.sizes.medium,
    fontWeight: '500',
  },
  logoutButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.large,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: FONT.sizes.medium,
    fontWeight: 'bold',
  },
  versionCard: {
    alignItems: 'center',
    padding: SPACING.large,
  },
  versionText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.large,
  },
  linksContainer: {
    width: '100%',
    alignItems: 'center',
  },
  linkButton: {
    paddingVertical: SPACING.small,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT.sizes.medium,
    textAlign: 'center',
  },
})

export default SettingsScreen

