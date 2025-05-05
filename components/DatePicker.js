import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { COLORS, FONT, SPACING } from "../theme";

/**
 * A cross-platform date picker component that uses the appropriate date picker
 * based on the platform (web or native)
 */
const DatePicker = ({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  style
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isWebPlatform, setIsWebPlatform] = useState(Platform.OS === "web");

  useEffect(() => {
    setIsWebPlatform(Platform.OS === "web");
  }, []);

  // Format date for display
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    // For native platforms
    if (!isWebPlatform) {
      const currentDate = selectedDate || value;
      setShowPicker(Platform.OS === "ios");
      onChange(currentDate);
      return;
    }

    // For web platform, the event is handled differently
    if (selectedDate) {
      onChange(selectedDate);
      setShowPicker(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.buttonText}>{formatDate(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
      </TouchableOpacity>

      {showPicker && (
        isWebPlatform ? (
          <View style={styles.calendarOverlay}>
            <View style={styles.calendarContainer}>
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDateChange}
                disabled={(date) => {
                  if (minimumDate && date < minimumDate) return true;
                  if (maximumDate && date > maximumDate) return true;
                  return false;
                }}
                className="rounded-md border"
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <DateTimePicker
            value={value}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.medium,
  },
  label: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.small,
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.medium,
    backgroundColor: COLORS.background.tertiary,
  },
  buttonText: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
  calendarOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    maxWidth: 350,
    width: "100%",
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.small,
    alignItems: "center",
    marginTop: SPACING.medium,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: FONT.sizes.medium,
    fontWeight: "bold",
  }
});

export default DatePicker;
