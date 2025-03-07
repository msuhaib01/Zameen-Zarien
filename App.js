"use client"

import { useEffect, useState } from "react"
import { StatusBar } from "expo-status-bar"
import { LogBox, View, Text } from "react-native"
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
        await SplashScreen.hideAsync()
      }
    }

    prepare()
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
    <I18nextProvider i18n={i18n}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AppProvider>
      </GestureHandlerRootView>
    </I18nextProvider>
  )
}

