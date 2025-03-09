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
  StatusBar,
  Dimensions,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"

import Header from "../components/Header"
import Input from "../components/Input"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"
import Card from "../components/Card"
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"
import { useApp } from "../context/AppContext"

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 360;

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

  // Create language toggle component for header
  const HeaderRight = () => (
    <TouchableOpacity 
      style={styles.languageToggle} 
      onPress={toggleLanguage}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={styles.languageText}>{i18n.language === "en" ? "اردو" : "English"}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Header 
        title={t("common.appName")} 
        showBackButton={true} 
        rightComponent={<HeaderRight />}
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
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo-placeholder.png")} style={styles.logo} resizeMode="contain" />
          </View>

          <Card style={styles.formCard}>
            <View style={styles.formContent}>
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
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={24} 
                    color={COLORS.gray} 
                  />
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
                <TouchableOpacity 
                  style={styles.checkbox} 
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name={agreeToTerms ? "checkbox" : "square-outline"} size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>{t("auth.agreeToTerms")} </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      /* Navigate to terms and conditions */
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.termsLink}>{t("common.termsAndConditions")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {errors.terms ? <Text style={styles.termsError}>{errors.terms}</Text> : null}

              <Button 
                title={t("common.register")} 
                onPress={handleRegister} 
                loading={loading} 
                style={styles.registerButton} 
                size="large"
              />

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>{t("auth.alreadyHaveAccount")}</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate("Login")}
                  hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                >
                  <Text style={styles.loginLink}>{t("common.login")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
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
    padding: isSmallScreen ? SPACING.medium : SPACING.large,
    paddingTop: SPACING.medium,
    paddingBottom: SPACING.xxxl,
  },
  languageToggle: {
    padding: SPACING.small,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  languageText: {
    color: COLORS.primary,
    fontWeight: "bold",
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: isSmallScreen ? SPACING.medium : SPACING.large,
  },
  logo: {
    width: isSmallScreen ? 80 : 120,
    height: isSmallScreen ? 80 : 120,
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
    marginBottom: SPACING.large,
    textAlign: "center",
    color: COLORS.primary,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 38,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
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
    color: COLORS.text.secondary,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  termsError: {
    color: COLORS.error,
    fontSize: FONT.sizes.small,
    marginTop: -SPACING.small,
    marginBottom: SPACING.small,
  },
  registerButton: {
    marginVertical: SPACING.large,
    backgroundColor: COLORS.primary,
    alignSelf: 'stretch',
    minHeight: 50,
    ...(Platform.OS === 'ios' 
      ? SHADOWS.medium 
      : { 
          elevation: 3,
          shadowColor: "#000",
        }
    ),
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.medium,
    flexWrap: "wrap",
  },
  loginText: {
    color: COLORS.text.secondary,
    marginRight: SPACING.small,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
})

export default RegisterScreen

