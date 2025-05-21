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
  StatusBar,
  Dimensions,
} from "react-native"
import { useTranslation } from "react-i18next"
import { Ionicons } from "@expo/vector-icons"

import Header from "../components/Header"
import Input from "../components/Input"
import Button from "../components/Button"
import Card from "../components/Card"
import AuthWebLayout from "../components/AuthWebLayout"
import { COLORS, FONT, SPACING, SHADOWS } from "../theme"

const screenWidth = Dimensions.get('window').width;
const isSmallScreen = screenWidth < 360;
const isWebPlatform = Platform.OS === "web";

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
  
  // Content to be rendered for both mobile and web
  const renderContent = () => (
    <Card style={styles.formCard}>
      <View style={styles.formContent}>
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
          size="large"
        />

        <TouchableOpacity 
          style={styles.backToLoginButton} 
          onPress={() => navigation.navigate("Login")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backToLoginText}>{t("auth.backToLogin")}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  // Return different layouts based on platform
  if (isWebPlatform) {
    return (
      <AuthWebLayout
        title={t("common.appName")} 
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
        title={t("common.appName")} 
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
  },
  formCard: {
    padding: 0,
    marginTop: SPACING.xxl,
  },
  formContent: {
    padding: isSmallScreen ? SPACING.medium : SPACING.large,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: "bold",
    marginBottom: SPACING.medium,
    textAlign: "center",
    color: COLORS.primary,
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
  backToLoginButton: {
    marginTop: SPACING.large,
    alignItems: "center",
    padding: SPACING.small,
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: FONT.sizes.medium,
    fontWeight: "500",
  },
})

export default ForgotPasswordScreen

