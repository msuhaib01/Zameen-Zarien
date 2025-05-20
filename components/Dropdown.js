"use client";

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, SPACING } from "../theme";

const Dropdown = ({
  label,
  data,
  value,
  onSelect,
  placeholder = "Select an option",
  error,
  style,
}) => {
  const [visible, setVisible] = useState(false);
  const selectedItem = data.find((item) => item.value === value);

  const toggleDropdown = () => {
    setVisible(!visible);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        item.value === value && styles.selectedItem,
      ]}
      onPress={() => {
        onSelect(item.value);
        setVisible(false);
      }}
    >
      <Text
        style={[
          styles.itemText,
          item.value === value && styles.selectedItemText,
        ]}
      >
        {item.label}
      </Text>
      {item.value === value && (
        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.dropdown, error && styles.dropdownError]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text
          style={selectedItem ? styles.selectedText : styles.placeholderText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons
          name={visible ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.primaryLight}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}
          activeOpacity={1}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text
                  style={styles.modalTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {label || "Select an option"}
                </Text>
                <TouchableOpacity
                  onPress={() => setVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <FlatList
                  data={data}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.value.toString()}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.listContainer}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                />
              </View>
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.large,
  },
  label: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.small,
    color: COLORS.primaryDark,
    fontWeight: "600",
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
    minHeight: 48,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    maxHeight: Platform.OS === "android" ? "70%" : "80%",
    minHeight: Platform.OS === "android" ? "40%" : "40%",
    ...(Platform.OS === "android" ? { elevation: 5 } : {}),
  },
  modalContent: {
    padding: SPACING.large,
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.large,
    paddingRight: SPACING.small,
  },
  modalTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: "bold",
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.medium,
  },
  listContainer: {
    paddingBottom: SPACING.large,
    flexGrow: 1,
  },

  itemText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
  selectedItemText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 48,
    borderLeftWidth: 0,
    borderLeftColor: 'transparent',
  },
  selectedItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
});

export default Dropdown;
