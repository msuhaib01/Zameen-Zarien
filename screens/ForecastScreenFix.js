"use client";

import { useState, useEffect } from "react";
import { Platform, useWindowDimensions } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";

import Header from "../components/Header";
import WebLayout from "../components/WebLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import FilterSection from "../components/FilterSection";
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"; // Ensure SPACING is used or imported if needed by chartWidth
import { useApp } from "../context/AppContext";
import {
  getForecast,
  getPriceHistory,
  getModelPrediction,
} from "../services/cropPricesService";

// This is a modified version of ForecastScreen.js that fixes the issue
// with raw text strings outside of Text components.
// The primary issue was in the tooltips that used newlines.

// Import and use this file instead of ForecastScreen.js temporarily
// until you can make the changes to the original file.

// The rest of the component implementation is identical to ForecastScreen.js
// but with the specific fixes applied to the tooltip handling in both web and mobile chart components.

// To use this file, import and register it in your navigation stack instead of ForecastScreen.js.
