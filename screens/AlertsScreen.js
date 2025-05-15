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

const fakeCommodities = [
  { id: 1, name: "Wheat", name_ur: "گندم" },
  { id: 2, name: "Rice", name_ur: "چاول" },
  { id: 3, name: "Sugar", name_ur: "چینی" },
]

const fakeInitialAlerts = [
  {
    id: "1",
    commodityId: 1,
    threshold: 205,
    condition: "above",
    notificationMethods: { push: true, sms: false, email: true },
    enabled: true,
    createdAt: "2023-01-05T10:30:00Z",
  },
  {
    id: "2",
    commodityId: 2,
    threshold: 140,
    condition: "below",
    notificationMethods: { push: true, sms: true, email: false },
    enabled: false,
    createdAt: "2023-01-07T14:15:00Z",
  },
]

const AlertsScreen = ({ navigation }) => {
  const { t } = useTranslation()

  const [alerts, setAlerts] = useState(fakeInitialAlerts)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [alertHistory, setAlertHistory] = useState([])
  const [currentPrices, setCurrentPrices] = useState({ 1: 210, 2: 135, 3: 120 })

  const [formCommodity, setFormCommodity] = useState(1)
  const [formThreshold, setFormThreshold] = useState("")
  const [formCondition, setFormCondition] = useState("above")
  const [formNotificationMethods, setFormNotificationMethods] = useState({
    push: true,
    sms: false,
    email: false,
  })

  const commodityOptions = fakeCommodities.map((commodity) => ({
    label: t("common.language") === "en" ? commodity.name : commodity.name_ur,
    value: commodity.id,
  }))

  const conditionOptions = [
    { label: t("alerts.above"), value: "above" },
    { label: t("alerts.below"), value: "below" },
  ]

  const onRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setRefreshing(false)
  }

  const openAddModal = () => {
    setFormCommodity(1)
    setFormThreshold("")
    setFormCondition("above")
    setFormNotificationMethods({ push: true, sms: false, email: false })
    setShowAddModal(true)
  }

  const openEditModal = (alert) => {
    setSelectedAlert(alert)
    setFormCommodity(alert.commodityId)
    setFormThreshold(alert.threshold.toString())
    setFormCondition(alert.condition)
    setFormNotificationMethods(alert.notificationMethods)
    setShowEditModal(true)
  }

  const openHistoryModal = (alert) => {
    setSelectedAlert(alert)
    const mockHistory = [
      { id: "1", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), price: Number.parseInt(alert.threshold) + 5, triggered: true },
      { id: "2", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), price: Number.parseInt(alert.threshold) - 2, triggered: false },
      { id: "3", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), price: Number.parseInt(alert.threshold) + 10, triggered: true },
    ]
    setAlertHistory(mockHistory)
    setShowHistoryModal(true)
  }

  const handleAddAlert = () => {
    if (!formThreshold) {
      alert(t("validation.enterThreshold"))
      return
    }
    const newAlert = {
      id: Date.now().toString(),
      commodityId: formCommodity,
      threshold: Number.parseInt(formThreshold),
      condition: formCondition,
      notificationMethods: formNotificationMethods,
      enabled: true,
      createdAt: new Date().toISOString(),
    }
    setAlerts((prev) => [...prev, newAlert])
    setShowAddModal(false)
  }

  const handleEditAlert = () => {
    if (!formThreshold) {
      alert(t("validation.enterThreshold"))
      return
    }
    setAlerts((prev) => prev.map((a) => a.id === selectedAlert.id ? {
      ...a,
      commodityId: formCommodity,
      threshold: Number.parseInt(formThreshold),
      condition: formCondition,
      notificationMethods: formNotificationMethods,
    } : a))
    setShowEditModal(false)
  }

  const handleDeleteAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId))
  }

  const toggleAlertEnabled = (alertId, currentStatus) => {
    setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, enabled: !a.enabled } : a))
  }

  const toggleNotificationMethod = (method) => {
    setFormNotificationMethods((prev) => ({ ...prev, [method]: !prev[method] }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const getCommodityName = (commodityId) => {
    const commodity = fakeCommodities.find((c) => c.id === commodityId)
    return t("common.language") === "en" ? commodity?.name : commodity?.name_ur
  }

  const getCurrentPrice = (commodityId) => {
    return currentPrices[commodityId] || "-"
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
                    <View style={styles.notificationMethodsWrapper}>
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
    alignItems: "flex-start",
  },
  alertInfoLabel: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    width: 140,
    marginRight: SPACING.small,
  },
  alertInfoValue: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    fontWeight: "500",
    flex: 1,
  },
  notificationMethodsWrapper: {
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
    marginBottom: SPACING.small,
  },
  notificationMethodText: {
    marginLeft: SPACING.xs,
    fontSize: FONT.sizes.small,
    color: COLORS.text.primary,
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

