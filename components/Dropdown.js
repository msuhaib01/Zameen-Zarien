"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, FONT, SPACING } from "../theme"

const Dropdown = ({ label, data, value, onSelect, placeholder = "Select an option", error, style }) => {
  const [visible, setVisible] = useState(false)
  const selectedItem = data.find((item) => item.value === value)

  const toggleDropdown = () => {
    setVisible(!visible)
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        onSelect(item.value)
        setVisible(false)
      }}
    >
      <Text style={[styles.itemText, item.value === value && styles.selectedItemText]}>{item.label}</Text>
      {item.value === value && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={[styles.dropdown, error && styles.dropdownError]} onPress={toggleDropdown}>
        <Text style={selectedItem ? styles.selectedText : styles.placeholderText}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons name={visible ? "chevron-up" : "chevron-down"} size={20} color={COLORS.gray} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)} activeOpacity={1}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label || "Select an option"}</Text>
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.value.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.large,
  },
  label: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.small,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.medium,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownError: {
    borderColor: COLORS.error,
  },
  placeholderText: {
    color: COLORS.gray,
    fontSize: FONT.sizes.medium,
  },
  selectedText: {
    color: COLORS.text.primary,
    fontSize: FONT.sizes.medium,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT.sizes.small,
    marginTop: SPACING.xs,
  },
  overlay: {
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
  modalContent: {
    padding: SPACING.large,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.large,
  },
  modalTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  listContainer: {
    paddingBottom: SPACING.large,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
  selectedItemText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
})

export default Dropdown

