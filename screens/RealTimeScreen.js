"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"

import Header from "../components/Header"
import Card from "../components/Card"
import { COLORS, FONT, SPACING } from "../theme"
import { useApp } from "../context/AppContext"

const RealTimeScreen = ({ navigation }) => {
  const { t } = useTranslation()
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    // Simulate loading
    setTimeout(() => {
      setRefreshing(false)
    }, 1500)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("realTime.title")} showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.placeholderCard}>
          <Ionicons
            name="time-outline"
            size={64}
            color={COLORS.primary}
            style={styles.placeholderIcon}
          />
          <Text style={styles.placeholderTitle}>{t("realTime.comingSoon")}</Text>
          <Text style={styles.placeholderText}>{t("realTime.description")}</Text>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t("realTime.whatToExpect")}</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="flash-outline" size={24} color={COLORS.primary} style={styles.featureIcon} />
              <Text style={styles.featureText}>{t("realTime.liveUpdates")}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="globe-outline" size={24} color={COLORS.primary} style={styles.featureIcon} />
              <Text style={styles.featureText}>{t("realTime.marketCoverage")}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.primary} style={styles.featureIcon} />
              <Text style={styles.featureText}>{t("realTime.instantAlerts")}</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trending-up-outline" size={24} color={COLORS.primary} style={styles.featureIcon} />
              <Text style={styles.featureText}>{t("realTime.trendAnalysis")}</Text>
            </View>
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
    paddingBottom: SPACING.xxl,
  },
  placeholderCard: {
    alignItems: "center",
    padding: SPACING.xl,
    marginBottom: SPACING.large,
  },
  placeholderIcon: {
    marginBottom: SPACING.large,
  },
  placeholderTitle: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.medium,
    textAlign: "center",
  },
  placeholderText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  infoCard: {
    padding: SPACING.large,
  },
  infoTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.large,
  },
  featureList: {
    marginTop: SPACING.medium,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.large,
  },
  featureIcon: {
    marginRight: SPACING.medium,
  },
  featureText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    flex: 1,
  },
  loadingContainer: {
    padding: SPACING.xxl,
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONT.sizes.large,
    color: COLORS.text.secondary,
    marginTop: SPACING.medium,
  },
})

export default RealTimeScreen
