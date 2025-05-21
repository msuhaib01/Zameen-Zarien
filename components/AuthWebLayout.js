"use client";

import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useWindowDimensions } from 'react-native';
import Header from './Header';
import { COLORS } from '../theme';

/**
 * AuthWebLayout component for web-specific layout of authentication screens
 * This layout centers the content in a container with appropriate width
 */
const AuthWebLayout = ({ children, title, showBackButton, onBackPress, rightComponent }) => {
  const { width: windowWidth } = useWindowDimensions();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Header
        title={title}
        showBackButton={showBackButton}
        onBackPress={onBackPress}
        rightComponent={rightComponent}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.contentWrapper,
          {
            // Adjust width based on screen size for responsive design
            width: windowWidth > 1200 ? 500 : windowWidth > 768 ? 450 : 400,
            maxWidth: '95%'
          }
        ]}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  contentWrapper: {
    alignSelf: 'center',
  },
});

export default AuthWebLayout;
