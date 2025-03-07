"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
  Modal,
  FlatList,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"

import Header from "../components/Header"
import Card from "../components/Card"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import ToggleSwitch from "../components/ToggleSwitch"
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"
import { useApp } from "../context/AppContext"

const NotificationsScreen = ({ navigation }) => {
  const { t } = useTranslation()
  const { notifications, markNotificationAsRead, deleteNotification, doNotDisturb, toggleDoNotDisturb, commodities } =
    useApp()

  const [refreshing, setRefreshing] = useState(false)
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all") // 'all', 'unread', 'alerts', 'system'
  const [dateFilter, setDateFilter] = useState("all") // 'all', 'today', 'week', 'month'
  const [commodityFilter, setCommodityFilter] = useState("all") // 'all' or commodity id

  // Filter options
  const statusFilterOptions = [
    { label: t("notifications.all"), value: "all" },
    { label: t("notifications.unread"), value: "unread" },
    { label: t("notifications.alerts"), value: "alerts" },
    { label: t("notifications.system"), value: "system" },
  ]

  const dateFilterOptions = [
    { label: t("notifications.allTime"), value: "all" },
    { label: t("notifications.today"), value: "today" },
    { label: t("notifications.thisWeek"), value: "week" },
    { label: t("notifications.thisMonth"), value: "month" },
  ]

  const commodityFilterOptions = [
    { label: t("notifications.allCommodities"), value: "all" },
    ...commodities.map((commodity) => ({
      label: t("common.language") === "en" ? commodity.name : commodity.name_ur,
      value: commodity.id.toString(),
    })),
  ]

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    // In a real app, you would fetch fresh notifications here
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  // Filter notifications based on selected filters
  const getFilteredNotifications = () => {
    return notifications.filter((notification) => {
      // Filter by status/type
      if (selectedFilter === "unread" && notification.read) {
        return false
      }
      if (selectedFilter === "alerts" && notification.type !== "alert") {
        return false
      }
      if (selectedFilter === "system" && notification.type !== "system") {
        return false
      }

      // Filter by date
      const notificationDate = new Date(notification.timestamp)
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      if (dateFilter === "today" && notificationDate < todayStart) {
        return false
      }

      if (dateFilter === "week") {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - 7)
        if (notificationDate < weekStart) {
          return false
        }
      }

      if (dateFilter === "month") {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        if (notificationDate < monthStart) {
          return false
        }
      }

      // Filter by commodity
      if (commodityFilter !== "all" && notification.commodityId !== Number.parseInt(commodityFilter)) {
        return false
      }

      return true
    })
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    notifications.forEach((notification) => {
      if (!notification.read) {
        markNotificationAsRead(notification.id)
      }
    })
  }

  // Delete all notifications
  const confirmDeleteAll = () => {
    Alert.alert(t("notifications.confirmDeleteAll"), t("notifications.confirmDeleteAllMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        onPress: deleteAllNotifications,
        style: "destructive",
      },
    ])
  }

  const deleteAllNotifications = () => {
    const filteredNotifications = getFilteredNotifications()
    filteredNotifications.forEach((notification) => {
      deleteNotification(notification.id)
    })
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date >= today) {
      // Today - show time only
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (date >= yesterday) {
      // Yesterday
      return t("notifications.yesterday")
    } else {
      // Other days - show date
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case "alert":
        return <Ionicons name="notifications" size={24} color={COLORS.accent} />
      case "system":
        return <Ionicons name="information-circle" size={24} color={COLORS.primary} />
      case "update":
        return <Ionicons name="refresh-circle" size={24} color={COLORS.success} />
      default:
        return <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primary} />
    }
  }

  // Get commodity name by ID
  const getCommodityName = (commodityId) => {
    if (!commodityId) return ""
    const commodity = commodities.find((c) => c.id === commodityId)
    return commodity ? (t("common.language") === "en" ? commodity.name : commodity.name_ur) : ""
  }

  // Render notification item
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => markNotificationAsRead(item.id)}
    >
      <View style={styles.notificationIconContainer}>
        {getNotificationIcon(item)}
        {!item.read && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>{formatDate(item.timestamp)}</Text>
        </View>

        <Text style={styles.notificationMessage}>{item.message}</Text>

        {item.commodityId && <Text style={styles.notificationCommodity}>{getCommodityName(item.commodityId)}</Text>}

        <View style={styles.notificationActions}>
          {!item.read && (
            <TouchableOpacity style={styles.notificationAction} onPress={() => markNotificationAsRead(item.id)}>
              <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.notificationActionText}>{t("notifications.markAsRead")}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.notificationAction} onPress={() => deleteNotification(item.id)}>
            <Ionicons name="trash-outline" size={18} color={COLORS.accent} />
            <Text style={[styles.notificationActionText, { color: COLORS.accent }]}>{t("common.delete")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  // Filtered notifications
  const filteredNotifications = getFilteredNotifications()

  // Count unread notifications
  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("notifications.title")} showBackButton={true} />

      <View style={styles.actionsContainer}>
        <View style={styles.notificationCountContainer}>
          <Text style={styles.notificationCountText}>
            {unreadCount > 0 ? t("notifications.unreadCount", { count: unreadCount }) : t("notifications.allRead")}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="filter" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={confirmDeleteAll}>
            <Ionicons name="trash" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <Card style={styles.dndCard}>
        <View style={styles.dndContainer}>
          <View style={styles.dndTextContainer}>
            <Text style={styles.dndTitle}>{t("notifications.doNotDisturb")}</Text>
            <Text style={styles.dndDescription}>{t("notifications.dndDescription")}</Text>
          </View>
          <ToggleSwitch value={doNotDisturb} onValueChange={toggleDoNotDisturb} />
        </View>
      </Card>

      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={COLORS.gray} />
          <Text style={styles.emptyText}>{t("notifications.noNotifications")}</Text>
          {(selectedFilter !== "all" || dateFilter !== "all" || commodityFilter !== "all") && (
            <Text style={styles.emptySubtext}>{t("notifications.tryDifferentFilters")}</Text>
          )}
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("notifications.filterNotifications")}</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Dropdown
                label={t("notifications.filterByStatus")}
                data={statusFilterOptions}
                value={selectedFilter}
                onSelect={setSelectedFilter}
              />

              <Dropdown
                label={t("notifications.filterByDate")}
                data={dateFilterOptions}
                value={dateFilter}
                onSelect={setDateFilter}
              />

              <Dropdown
                label={t("notifications.filterByCommodity")}
                data={commodityFilterOptions}
                value={commodityFilter}
                onSelect={setCommodityFilter}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={t("notifications.resetFilters")}
                onPress={() => {
                  setSelectedFilter("all")
                  setDateFilter("all")
                  setCommodityFilter("all")
                }}
                type="outline"
                style={styles.modalButton}
              />

              <Button
                title={t("common.apply")}
                onPress={() => setFilterModalVisible(false)}
                type="primary"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
  },
  notificationCountContainer: {
    flex: 1,
  },
  notificationCountText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    padding: SPACING.small,
    marginLeft: SPACING.medium,
  },
  dndCard: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.large,
  },
  dndContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dndTextContainer: {
    flex: 1,
  },
  dndTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  dndDescription: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
  },
  notificationsList: {
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.xxxl,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    ...SHADOWS.small,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationIconContainer: {
    marginRight: SPACING.medium,
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.small,
  },
  notificationTitle: {
    fontSize: FONT.sizes.medium,
    fontWeight: "bold",
    color: COLORS.text.primary,
    flex: 1,
  },
  notificationTime: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
    marginLeft: SPACING.small,
  },
  notificationMessage: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.small,
  },
  notificationCommodity: {
    fontSize: FONT.sizes.small,
    color: COLORS.primary,
    fontWeight: "500",
    marginBottom: SPACING.small,
  },
  notificationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: SPACING.small,
  },
  notificationAction: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.large,
  },
  notificationActionText: {
    fontSize: FONT.sizes.small,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginTop: SPACING.large,
    marginBottom: SPACING.small,
  },
  emptySubtext: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  modalContent: {
    padding: SPACING.large,
    maxHeight: "60%",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
})

export default NotificationsScreen

