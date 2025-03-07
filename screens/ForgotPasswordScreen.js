"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"

import Input from "../components/Input"
import Button from "../components/Button"
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleResetPassword = async () => {
    if (!phoneNumber.trim()) {
      setError(t("validation.phoneRequired"))
      return
    }

    if (!/^03\d{9}$/.test(phoneNumber)) {
      setError(t("validation.invalidPhone"))
      return
    }

    setLoading(true)
    setError("")

    try {
      // In a real app, you would make an API call to request a password reset
      // For demo purposes, we'll simulate a successful request
      await new Promise((resolve) => setTimeout(resolve, 1500))

      Alert.alert(t("auth.resetPasswordSent"), t("auth.resetPasswordSentMessage"), [
        {
          text: t("common.ok"),
          onPress: () => navigation.navigate("Login"),
        },
      ])
    } catch (error) {
      setError(t("errors.general"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <Text style={styles.appName}>{t("common.appName")}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>{t("auth.forgotPassword")}</Text>
            <Text style={styles.subtitle}>{t("auth.forgotPasswordInstructions")}</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Input
              label={t("common.mobileNumber")}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="03xx xxx xxxx"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            <Button
              title={t("auth.resetPassword")}
              onPress={handleResetPassword}
              loading={loading}
              style={styles.resetButton}
            />

            <TouchableOpacity style={styles.backToLoginButton} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.backToLoginText}>{t("auth.backToLogin")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

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
    padding: SPACING.large,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.large,
  },
  backButton: {
    padding: SPACING.small,
    marginRight: SPACING.medium,
  },
  appName: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.large,
    marginTop: SPACING.xxl,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    textAlign: "center",
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.large,
    textAlign: "center",
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.medium,
    textAlign: "center",
  },
  resetButton: {
    marginTop: SPACING.large,
  },
  backToLoginButton: {
    marginTop: SPACING.large,
    alignItems: "center",
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: FONT.sizes.medium,
  },
})

export default ForgotPasswordScreen

