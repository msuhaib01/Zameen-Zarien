"use client"

import { useEffect, useState, useCallback } from "react"
import { StatusBar, View, StyleSheet } from "react-native"
import { LogBox, Text } from "react-native"
import { Asset } from "expo-asset"
import * as SplashScreen from "expo-splash-screen"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { I18nextProvider } from "react-i18next"

// Import i18n configuration
import i18n from "./i18n"

// Import navigation
import AppNavigator from "./navigation"

// Import context provider
import { AppProvider } from "./context/AppContext"

// Import animated splash screen
import AnimatedSplashScreen from "./components/AnimatedSplashScreen"

// Ignore specific warnings
LogBox.ignoreLogs([
  "Reanimated 2",
  "AsyncStorage has been extracted",
  "Non-serializable values were found in the navigation state",
])

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const [showSplashAnimation, setShowSplashAnimation] = useState(true)

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load assets
        await Asset.loadAsync([
          require("./assets/logo-placeholder.png"),
          require("./assets/icon.png"),
          require("./assets/splash.png"),
          require("./assets/adaptive-icon.png"),
          require("./assets/favicon.png"),
        ])

        // Wait for i18n initialization
        await i18n.init
      } catch (e) {
        console.warn("Error loading app:", e)
        setError(e)
      } finally {
        setIsReady(true)
        // Hide the expo splash screen to show our custom animated splash
        await SplashScreen.hideAsync()
      }
    }

    prepare()
  }, [])

  // Handle splash animation complete
  const onAnimationComplete = useCallback(() => {
    setShowSplashAnimation(false)
  }, [])

  if (!isReady) {
    return null
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading the app: {error.message}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <I18nextProvider i18n={i18n}>
        <GestureHandlerRootView style={styles.container}>
          <AppProvider>
            <StatusBar
              backgroundColor={showSplashAnimation ? "#006400" : "transparent"}
              barStyle={showSplashAnimation ? "light-content" : "auto"}
              translucent={!showSplashAnimation}
            />
            <AppNavigator />
            {showSplashAnimation && <AnimatedSplashScreen onAnimationComplete={onAnimationComplete} />}
          </AppProvider>
        </GestureHandlerRootView>
      </I18nextProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

