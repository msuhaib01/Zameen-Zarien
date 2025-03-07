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
  Modal,
  Switch,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"

import Header from "../components/Header"
import Card from "../components/Card"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import Input from "../components/Input"
import ToggleSwitch from "../components/ToggleSwitch"
import { COLORS, FONT, SPACING } from "../theme"
import { useApp } from "../context/AppContext"

const AlertsScreen = ({ navigation }) => {
  const { t } = useTranslation()
  const { commodities, alerts, addAlert, updateAlert, deleteAlert, getCommodityData } = useApp()

  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [alertHistory, setAlertHistory] = useState([])

  // New alert form state
  const [formCommodity, setFormCommodity] = useState(1)
  const [formThreshold, setFormThreshold] = useState("")
  const [formCondition, setFormCondition] = useState("above") // 'above' or 'below'
  const [formNotificationMethods, setFormNotificationMethods] = useState({
    push: true,
    sms: false,
    email: false,
  })

  // Commodity options
  const commodityOptions = commodities.map((commodity) => ({
    label: t("common.language") === "en" ? commodity.name : commodity.name_ur,
    value: commodity.id,
  }))

  // Condition options
  const conditionOptions = [
    { label: t("alerts.above"), value: "above" },
    { label: t("alerts.below"), value: "below" },
  ]

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    // In a real app, you would fetch fresh data here
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  // Open add alert modal
  const openAddModal = () => {
    // Reset form
    setFormCommodity(1)
    setFormThreshold("")
    setFormCondition("above")
    setFormNotificationMethods({
      push: true,
      sms: false,
      email: false,
    })
    setShowAddModal(true)
  }

  // Open edit alert modal
  const openEditModal = (alert) => {
    setSelectedAlert(alert)
    setFormCommodity(alert.commodityId)
    setFormThreshold(alert.threshold.toString())
    setFormCondition(alert.condition)
    setFormNotificationMethods(alert.notificationMethods)
    setShowEditModal(true)
  }

  // Open alert history modal
  const openHistoryModal = (alert) => {
    setSelectedAlert(alert)
    // In a real app, you would fetch the alert history from the server
    // For demo purposes, we'll generate some mock history
    const mockHistory = [
      {
        id: "1",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        price: Number.parseInt(alert.threshold) + 5,
        triggered: true,
      },
      {
        id: "2",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        price: Number.parseInt(alert.threshold) - 2,
        triggered: false,
      },
      {
        id: "3",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        price: Number.parseInt(alert.threshold) + 10,
        triggered: true,
      },
    ]
    setAlertHistory(mockHistory)
    setShowHistoryModal(true)
  }

  // Handle add alert
  const handleAddAlert = () => {
    if (!formThreshold) {
      alert(t("validation.enterThreshold"))
      return
    }

    const newAlert = {
      commodityId: formCommodity,
      threshold: Number.parseInt(formThreshold),
      condition: formCondition,
      notificationMethods: formNotificationMethods,
      enabled: true,
    }

    addAlert(newAlert)
    setShowAddModal(false)
  }

  // Handle edit alert
  const handleEditAlert = () => {
    if (!formThreshold) {
      alert(t("validation.enterThreshold"))
      return
    }

    const updatedAlert = {
      ...selectedAlert,
      commodityId: formCommodity,
      threshold: Number.parseInt(formThreshold),
      condition: formCondition,
      notificationMethods: formNotificationMethods,
    }

    updateAlert(selectedAlert.id, updatedAlert)
    setShowEditModal(false)
  }

  // Handle delete alert
  const handleDeleteAlert = (alertId) => {
    deleteAlert(alertId)
  }

  // Toggle alert enabled status
  const toggleAlertEnabled = (alertId, currentStatus) => {
    updateAlert(alertId, { enabled: !currentStatus })
  }

  // Toggle notification method
  const toggleNotificationMethod = (method) => {
    setFormNotificationMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
    }))
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  // Get commodity name
  const getCommodityName = (commodityId) => {
    const commodity = commodities.find((c) => c.id === commodityId)
    return t("common.language") === "en" ? commodity?.name : commodity?.name_ur
  }

  // Get current price for a commodity
  const getCurrentPrice = (commodityId) => {
    const data = getCommodityData(commodityId)
    return data?.current || "-"
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("alerts.title")} showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Button
          title={t("alerts.addAlert")}
          onPress={openAddModal}
          type="primary"
          icon={<Ionicons name="add-circle-outline" size={18} color={COLORS.white} style={styles.buttonIcon} />}
          style={styles.addButton}
        />

        {alerts.length > 0 ? (
          <View style={styles.alertsContainer}>
            {alerts.map((alert) => (
              <Card key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertTitle}>{getCommodityName(alert.commodityId)}</Text>
                  <View style={styles.alertActions}>
                    <TouchableOpacity style={styles.alertAction} onPress={() => openHistoryModal(alert)}>
                      <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.alertAction} onPress={() => openEditModal(alert)}>
                      <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.alertAction} onPress={() => handleDeleteAlert(alert.id)}>
                      <Ionicons name="trash-outline" size={20} color={COLORS.accent} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.alertContent}>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertInfoLabel}>{t("alerts.condition")}:</Text>
                    <Text style={styles.alertInfoValue}>
                      {alert.condition === "above" ? t("alerts.above") : t("alerts.below")} PKR {alert.threshold}
                    </Text>
                  </View>

                  <View style={styles.alertInfo}>
                    <Text style={styles.alertInfoLabel}>{t("alerts.currentPrice")}:</Text>
                    <Text style={styles.alertInfoValue}>PKR {getCurrentPrice(alert.commodityId)}</Text>
                  </View>

                  <View style={styles.alertInfo}>
                    <Text style={styles.alertInfoLabel}>{t("alerts.notificationMethods")}:</Text>
                    <View style={styles.notificationMethodsContainer}>
                      {alert.notificationMethods.push && (
                        <View style={styles.notificationMethod}>
                          <Ionicons name="notifications" size={16} color={COLORS.primary} />
                          <Text style={styles.notificationMethodText}>{t("alerts.push")}</Text>
                        </View>
                      )}
                      {alert.notificationMethods.sms && (
                        <View style={styles.notificationMethod}>
                          <Ionicons name="chatbubble" size={16} color={COLORS.primary} />
                          <Text style={styles.notificationMethodText}>{t("alerts.sms")}</Text>
                        </View>
                      )}
                      {alert.notificationMethods.email && (
                        <View style={styles.notificationMethod}>
                          <Ionicons name="mail" size={16} color={COLORS.primary} />
                          <Text style={styles.notificationMethodText}>{t("alerts.email")}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.alertFooter}>
                  <Text style={styles.alertStatus}>{alert.enabled ? t("alerts.enabled") : t("alerts.disabled")}</Text>
                  <Switch
                    value={alert.enabled}
                    onValueChange={() => toggleAlertEnabled(alert.id, alert.enabled)}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                    thumbColor={COLORS.white}
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>{t("alerts.noAlerts")}</Text>
            <Text style={styles.emptySubtext}>{t("alerts.addAlertPrompt")}</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Alert Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("alerts.addAlert")}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Dropdown
                label={t("dashboard.commodity")}
                data={commodityOptions}
                value={formCommodity}
                onSelect={setFormCommodity}
              />

              <Dropdown
                label={t("alerts.condition")}
                data={conditionOptions}
                value={formCondition}
                onSelect={setFormCondition}
              />

              <Input
                label={t("alerts.priceThreshold")}
                value={formThreshold}
                onChangeText={setFormThreshold}
                placeholder="0"
                keyboardType="numeric"
              />

              <Text style={styles.notificationMethodsLabel}>{t("alerts.notificationMethod")}</Text>

              <View style={styles.notificationMethodsForm}>
                <ToggleSwitch
                  label={t("alerts.push")}
                  value={formNotificationMethods.push}
                  onValueChange={() => toggleNotificationMethod("push")}
                />

                <ToggleSwitch
                  label={t("alerts.sms")}
                  value={formNotificationMethods.sms}
                  onValueChange={() => toggleNotificationMethod("sms")}
                />

                <ToggleSwitch
                  label={t("alerts.email")}
                  value={formNotificationMethods.email}
                  onValueChange={() => toggleNotificationMethod("email")}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={t("common.cancel")}
                onPress={() => setShowAddModal(false)}
                type="outline"
                style={styles.modalButton}
              />
              <Button title={t("common.save")} onPress={handleAddAlert} type="primary" style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Alert Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("alerts.editAlert")}</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Dropdown
                label={t("dashboard.commodity")}
                data={commodityOptions}
                value={formCommodity}
                onSelect={setFormCommodity}
              />

              <Dropdown
                label={t("alerts.condition")}
                data={conditionOptions}
                value={formCondition}
                onSelect={setFormCondition}
              />

              <Input
                label={t("alerts.priceThreshold")}
                value={formThreshold}
                onChangeText={setFormThreshold}
                placeholder="0"
                keyboardType="numeric"
              />

              <Text style={styles.notificationMethodsLabel}>{t("alerts.notificationMethod")}</Text>

              <View style={styles.notificationMethodsForm}>
                <ToggleSwitch
                  label={t("alerts.push")}
                  value={formNotificationMethods.push}
                  onValueChange={() => toggleNotificationMethod("push")}
                />

                <ToggleSwitch
                  label={t("alerts.sms")}
                  value={formNotificationMethods.sms}
                  onValueChange={() => toggleNotificationMethod("sms")}
                />

                <ToggleSwitch
                  label={t("alerts.email")}
                  value={formNotificationMethods.email}
                  onValueChange={() => toggleNotificationMethod("email")}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={t("common.cancel")}
                onPress={() => setShowEditModal(false)}
                type="outline"
                style={styles.modalButton}
              />
              <Button title={t("common.save")} onPress={handleEditAlert} type="primary" style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert History Modal */}
      <Modal visible={showHistoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("alerts.alertHistory")}</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {alertHistory.length > 0 ? (
                alertHistory.map((item) => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyItemDate}>{formatDate(item.date)}</Text>
                      <View
                        style={[
                          styles.historyItemStatus,
                          item.triggered ? styles.historyItemTriggered : styles.historyItemNotTriggered,
                        ]}
                      >
                        <Text style={styles.historyItemStatusText}>
                          {item.triggered ? t("alerts.triggered") : t("alerts.notTriggered")}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.historyItemPrice}>PKR {item.price}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyHistoryText}>{t("alerts.noHistory")}</Text>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={t("common.close")}
                onPress={() => setShowHistoryModal(false)}
                type="primary"
                style={[styles.modalButton, { flex: 1 }]}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.large,
    paddingBottom: SPACING.xxxl,
  },
  addButton: {
    marginBottom: SPACING.large,
  },
  buttonIcon: {
    marginRight: SPACING.small,
  },
  alertsContainer: {
    marginBottom: SPACING.large,
  },
  alertCard: {
    marginBottom: SPACING.medium,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  alertTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  alertActions: {
    flexDirection: "row",
  },
  alertAction: {
    marginLeft: SPACING.medium,
  },
  alertContent: {
    marginBottom: SPACING.medium,
  },
  alertInfo: {
    flexDirection: "row",
    marginBottom: SPACING.small,
  },
  alertInfoLabel: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    width: 120,
  },
  alertInfoValue: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    fontWeight: "500",
    flex: 1,
  },
  notificationMethodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  notificationMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 16,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.small,
    marginRight: SPACING.small,
    marginBottom: SPACING.xs,
  },
  notificationMethodText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.medium,
  },
  alertStatus: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
  emptyContainer: {
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
  notificationMethodsLabel: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.small,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  notificationMethodsForm: {
    marginBottom: SPACING.large,
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
  historyItem: {
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 8,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  historyItemDate: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
  historyItemStatus: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.small,
    borderRadius: 16,
  },
  historyItemTriggered: {
    backgroundColor: COLORS.success,
  },
  historyItemNotTriggered: {
    backgroundColor: COLORS.gray,
  },
  historyItemStatusText: {
    fontSize: FONT.sizes.small,
    color: COLORS.white,
  },
  historyItemPrice: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  emptyHistoryText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    textAlign: "center",
    padding: SPACING.large,
  },
})

export default AlertsScreen

