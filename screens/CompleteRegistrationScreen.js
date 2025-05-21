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

import Header from "../components/Header";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import AuthWebLayout from "../components/AuthWebLayout";
import { COLORS, FONT, SPACING, SHADOWS } from "../theme";

const screenWidth = Dimensions.get("window").width;
const isSmallScreen = screenWidth < 360;
const isWebPlatform = Platform.OS === "web";

const CompleteRegistrationScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { phoneNumber } = route.params;

  // Form state
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompleteRegistration = async () => {
    if (!code.trim() || !fullName.trim() || !email.trim() || !password) {
      setError(t("validation.allFieldsRequired"));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t("validation.invalidEmail"));
      return;
    }

    if (password.length < 6) {
      setError(t("validation.passwordTooShort"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Completing registration for:", phoneNumber);
      // Import API_BASE_URL from config.js
      const { API_BASE_URL } = require("../config");
      console.log("Using API URL:", `${API_BASE_URL}/auth/verify-and-create/`);

      const response = await fetch(`${API_BASE_URL}/auth/verify-and-create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          code: code,
          full_name: fullName,
          email: email,
          password: password,
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || t("errors.general"));
      }

      console.log("Registration completed successfully");
      // Navigate back to login screen
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error completing registration:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Content to be rendered for both mobile and web
  const renderContent = () => (
    <Card style={styles.formCard}>
      <View style={styles.formContent}>
        <Text style={styles.title}>Complete Your Registration</Text>
        <Text style={styles.subtitle}>
          Enter the verification code sent to your phone and fill in your
          details
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Input
          label="Verification Code"
          value={code}
          onChangeText={setCode}
          placeholder="Enter the 4-digit code"
          keyboardType="number-pad"
          maxLength={4}
        />

        <Input
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          autoCapitalize="words"
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>

        <Button
          title="Create Account"
          onPress={handleCompleteRegistration}
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
        title={t("auth.completeRegistration")}
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
        title={t("auth.completeRegistration")}
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
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingRight: SPACING.medium,
  },
  button: {
    marginTop: SPACING.large,
  },
});

export default CompleteRegistrationScreen;
