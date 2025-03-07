"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"

import Input from "../components/Input"
import Button from "../components/Button"
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"
import { useApp } from "../context/AppContext"

const LoginScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const { login, changeLanguage } = useApp()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      setError(t("validation.allFieldsRequired"))
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await login(phoneNumber, password)
      if (!result.success) {
        setError(result.error || t("auth.loginFailed"))
      }
    } catch (error) {
      setError(t("errors.general"))
    } finally {
      setLoading(false)
    }
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ur" : "en"
    changeLanguage(newLang)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.appName}>{t("common.appName")}</Text>
            <TouchableOpacity style={styles.languageToggle} onPress={toggleLanguage}>
              <Text style={styles.languageText}>{i18n.language === "en" ? "اردو" : "English"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo-placeholder.png")} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>{t("auth.loginTitle")}</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Input
              label={t("common.mobileNumber")}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="03xx xxx xxxx"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <Input
                label={t("common.password")}
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.forgotPasswordText}>{t("auth.forgotPassword")}</Text>
            </TouchableOpacity>

            <Button title={t("common.login")} onPress={handleLogin} loading={loading} style={styles.loginButton} />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>{t("auth.noAccount")}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}>{t("common.register")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => {
              /* Handle support action */
            }}
          >
            <Text style={styles.supportText}>{t("common.contactSupport")}</Text>
          </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.large,
  },
  appName: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  languageToggle: {
    padding: SPACING.small,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  languageText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: SPACING.xxl,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.large,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    marginBottom: SPACING.large,
    textAlign: "center",
    color: COLORS.text.primary,
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
    right: SPACING.medium,
    top: 40,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: SPACING.large,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONT.sizes.small,
  },
  loginButton: {
    marginVertical: SPACING.large,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.medium,
  },
  registerText: {
    color: COLORS.text.secondary,
    marginRight: SPACING.small,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  supportButton: {
    marginTop: SPACING.xxl,
    alignItems: "center",
  },
  supportText: {
    color: COLORS.text.secondary,
    fontSize: FONT.sizes.small,
  },
})

export default LoginScreen

