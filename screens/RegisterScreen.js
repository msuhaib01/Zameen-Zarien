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
  Alert,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"

import Input from "../components/Input"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"
import { useApp } from "../context/AppContext"

const RegisterScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const { login, changeLanguage } = useApp()

  // Form state
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [preferredCommodity, setPreferredCommodity] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
  })

  // Commodity options for dropdown
  const commodityOptions = [
    { label: t("common.language") === "en" ? "Wheat" : "گندم", value: 1 },
    { label: t("common.language") === "en" ? "Rice" : "چاول", value: 2 },
    { label: t("common.language") === "en" ? "Cotton" : "کپاس", value: 3 },
    { label: t("common.language") === "en" ? "Sugarcane" : "گنا", value: 4 },
    { label: t("common.language") === "en" ? "Maize" : "مکئی", value: 5 },
  ]

  // Validate form
  const validateForm = () => {
    let isValid = true
    const newErrors = {
      name: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: "",
    }

    // Validate name
    if (!name.trim()) {
      newErrors.name = t("validation.nameRequired")
      isValid = false
    }

    // Validate phone number
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = t("validation.phoneRequired")
      isValid = false
    } else if (!/^03\d{9}$/.test(phoneNumber)) {
      newErrors.phoneNumber = t("validation.invalidPhone")
      isValid = false
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = t("validation.emailRequired")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("validation.invalidEmail")
      isValid = false
    }

    // Validate password
    if (!password) {
      newErrors.password = t("validation.passwordRequired")
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = t("validation.passwordTooShort")
      isValid = false
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t("validation.passwordsDoNotMatch")
      isValid = false
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      newErrors.terms = t("validation.termsRequired")
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // In a real app, you would make an API call to register the user
      // For demo purposes, we'll simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      Alert.alert(t("auth.registrationSuccess"), t("auth.registrationSuccessMessage"), [
        {
          text: t("common.ok"),
          onPress: () => {
            // Navigate to login screen
            navigation.navigate("Login")
          },
        },
      ])
    } catch (error) {
      Alert.alert(t("auth.registrationFailed"), t("errors.general"))
    } finally {
      setLoading(false)
    }
  }

  // Toggle language
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ur" : "en"
    changeLanguage(newLang)
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

            <TouchableOpacity style={styles.languageToggle} onPress={toggleLanguage}>
              <Text style={styles.languageText}>{i18n.language === "en" ? "اردو" : "English"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo-placeholder.png")} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>{t("auth.registerTitle")}</Text>

            <Input
              label={t("auth.fullName")}
              value={name}
              onChangeText={setName}
              placeholder={t("auth.fullNamePlaceholder")}
              error={errors.name}
              autoCapitalize="words"
            />

            <Input
              label={t("common.mobileNumber")}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="03xx xxx xxxx"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              autoCapitalize="none"
            />

            <Input
              label={t("common.email")}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              keyboardType="email-address"
              error={errors.email}
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <Input
                label={t("common.password")}
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                secureTextEntry={!showPassword}
                error={errors.password}
                style={styles.passwordInput}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <Input
                label={t("auth.confirmPassword")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="********"
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
                style={styles.passwordInput}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <Dropdown
              label={t("auth.preferredCommodity")}
              data={commodityOptions}
              value={preferredCommodity}
              onSelect={setPreferredCommodity}
              placeholder={t("alerts.selectCommodity")}
            />

            <View style={styles.termsContainer}>
              <TouchableOpacity style={styles.checkbox} onPress={() => setAgreeToTerms(!agreeToTerms)}>
                <Ionicons name={agreeToTerms ? "checkbox" : "square-outline"} size={24} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>{t("auth.agreeToTerms")}</Text>
                <TouchableOpacity>
                  <Text style={styles.termsLink}>{t("common.termsAndConditions")}</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}> {t("common.and")} </Text>
                <TouchableOpacity>
                  <Text style={styles.termsLink}>{t("common.privacyPolicy")}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {errors.terms ? <Text style={styles.termsError}>{errors.terms}</Text> : null}

            <Button
              title={t("common.register")}
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{t("auth.alreadyHaveAccount")}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>{t("common.login")}</Text>
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
  backButton: {
    padding: SPACING.small,
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
    marginVertical: SPACING.large,
  },
  logo: {
    width: 120,
    height: 120,
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: SPACING.medium,
  },
  checkbox: {
    marginRight: SPACING.small,
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  termsText: {
    fontSize: FONT.sizes.small,
    color: COLORS.text.secondary,
  },
  termsLink: {
    fontSize: FONT.sizes.small,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  termsError: {
    color: COLORS.error,
    fontSize: FONT.sizes.small,
    marginBottom: SPACING.medium,
  },
  registerButton: {
    marginVertical: SPACING.large,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.small,
  },
  loginText: {
    color: COLORS.text.secondary,
    marginRight: SPACING.small,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  supportButton: {
    marginTop: SPACING.large,
    alignItems: "center",
  },
  supportText: {
    color: COLORS.text.secondary,
    fontSize: FONT.sizes.small,
  },
})

export default RegisterScreen

