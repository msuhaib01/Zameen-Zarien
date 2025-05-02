"use client";

import { useState } from "react";
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
  StatusBar,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import Header from "../components/Header";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import { COLORS, FONT, SPACING, SHADOWS } from "../theme";
import { useApp } from "../context/AppContext";

const screenWidth = Dimensions.get("window").width;
const isSmallScreen = screenWidth < 360;

const LoginScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { login, changeLanguage } = useApp();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      setError(t("validation.allFieldsRequired"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(phoneNumber, password);
      if (!result.success) {
        setError(result.error || t("auth.loginFailed"));
      }
    } catch (error) {
      setError(t("errors.general"));
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ur" : "en";
    changeLanguage(newLang);
  };

  // Create language toggle component for header
  const HeaderRight = () => (
    <TouchableOpacity
      style={styles.languageToggle}
      onPress={toggleLanguage}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={styles.languageText}>
        {i18n.language === "en" ? "اردو" : "English"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Header
        title={t("common.appName")}
        showBackButton={false}
        rightComponent={<HeaderRight />}
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
            <Image
              source={require("../assets/logo-placeholder.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Card style={styles.formCard}>
            <View style={styles.formContent}>
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

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("ForgotPassword")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.forgotPasswordText}>
                  {t("auth.forgotPassword")}
                </Text>
              </TouchableOpacity>

              <Button
                title={t("common.login")}
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
                size="large"
              />

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>{t("auth.noAccount")}</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("PhoneVerification")}
                  hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                >
                  <Text style={styles.registerLink}>
                    {t("common.register")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => {
              /* Handle support action */
            }}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text style={styles.supportText}>{t("common.contactSupport")}</Text>
          </TouchableOpacity>
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
  languageToggle: {
    padding: SPACING.small,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  languageText: {
    color: COLORS.primary,
    fontWeight: "bold",
    textAlign: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: isSmallScreen ? SPACING.large : SPACING.xxl,
    width: isSmallScreen ? 130 : 160,
    height: isSmallScreen ? 130 : 160,
    borderRadius: isSmallScreen ? 65 : 80,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignSelf: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: "hidden",
  },
  logo: {
    width: isSmallScreen ? 120 : 150,
    height: isSmallScreen ? 120 : 150,
    borderRadius: isSmallScreen ? 60 : 75,
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
    right: 12,
    top: "50%",
    transform: [{ translateY: -12 }],
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: SPACING.large,
    padding: SPACING.small,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONT.sizes.small,
  },
  loginButton: {
    marginVertical: SPACING.large,
    backgroundColor: COLORS.primary,
    alignSelf: "stretch",
    minHeight: 50,
    ...(Platform.OS === "ios"
      ? SHADOWS.medium
      : {
          elevation: 3,
          shadowColor: "#000",
        }),
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.medium,
    flexWrap: "wrap",
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
    marginTop: isSmallScreen ? SPACING.large : SPACING.xxl,
    alignItems: "center",
    padding: SPACING.medium,
  },
  supportText: {
    color: COLORS.text.secondary,
    fontSize: FONT.sizes.small,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
