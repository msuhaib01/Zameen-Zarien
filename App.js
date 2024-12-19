import { I18nManager } from "react-native";

// Set RTL once
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "styled-components/native";
import { theme } from "./src/theme/theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppNavigator />
    </ThemeProvider>
  );
}
