"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../config";

import Header from "../components/Header";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import AuthWebLayout from "../components/AuthWebLayout";
import { COLORS, FONT, SPACING, SHADOWS } from "../theme";

const screenWidth = Dimensions.get("window").width;
const isSmallScreen = screenWidth < 360;
const isWebPlatform = Platform.OS === "web";

const PhoneVerificationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError(t("validation.phoneRequired"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending verification code to:", phoneNumber);
      console.log("Using API URL:", `${API_BASE_URL}/auth/create-account/`);
      const response = await fetch(`${API_BASE_URL}/auth/create-account/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || t("errors.general"));
      }

      console.log("Verification code sent successfully");
      // Navigate to the next screen with the phone number
      navigation.navigate("CompleteRegistration", { phoneNumber });
    } catch (error) {
      console.error("Error sending verification code:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Content to be rendered for both mobile and web
  const renderContent = () => (
    <Card style={styles.formCard}>
      <View style={styles.formContent}>
        <Text style={styles.title}>Enter Your Phone Number</Text>
        <Text style={styles.subtitle}>
          We'll send you a verification code to complete your registration
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Input
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        <Button
          title="Send Verification Code"
          onPress={handleSendCode}
          loading={loading}
          style={styles.button}
          size="large"
        />
      </View>
    </Card>
  );

  // Return different layouts based on platform
  if (isWebPlatform) {
    return (
      <AuthWebLayout
        title={t("auth.registerTitle")}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      >
        {renderContent()}
      </AuthWebLayout>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Header
        title={t("auth.registerTitle")}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: isSmallScreen ? SPACING.medium : SPACING.large,
    paddingTop: SPACING.medium,
  },
  formCard: {
    padding: 0,
  },
  formContent: {
    padding: isSmallScreen ? SPACING.medium : SPACING.large,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    marginBottom: SPACING.small,
    textAlign: "center",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.large,
    textAlign: "center",
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.medium,
    textAlign: "center",
  },
  button: {
    marginTop: SPACING.large,
  },
});

export default PhoneVerificationScreen;
