// App.js
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from 'styled-components/native';
import { theme } from './src/theme/theme';
import { LanguageProvider } from './src/context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <AppNavigator />
      </ThemeProvider>
    </LanguageProvider>
  );
}