import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { COLORS, FONT, SPACING, SHADOWS } from '../theme';

/**
 * WebLayout component for web-specific layout with sidebar navigation
 */
const WebLayout = ({
  children,
  title,
  currentScreen,
  navigation,
  showNotificationsButton = false,
  onNotificationsPress,
  fullWidth = false
}) => {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Use refs for animations to prevent recreation on re-renders
  const sidebarWidth = useRef(new Animated.Value(240)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    // Toggle the state
    setIsSidebarCollapsed(prevState => !prevState);
  };

  // Animate sidebar width and text opacity when collapse state changes
  useEffect(() => {
    if (isSidebarCollapsed) {
      // First animate the text opacity to 0
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start(() => {
        // Then animate the width
        Animated.timing(sidebarWidth, {
          toValue: 70,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    } else {
      // First animate the width
      Animated.timing(sidebarWidth, {
        toValue: 240,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        // Then animate the text opacity
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isSidebarCollapsed, sidebarWidth, textOpacity]);

  // Navigation items with their icons and routes
  const navItems = [
    {
      id: 'Dashboard',
      label: t('dashboard.title'),
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      id: 'RealTime',
      label: t('realTime.title'),
      icon: 'time-outline',
      activeIcon: 'time',
    },
    {
      id: 'Forecast',
      label: t('forecast.title'),
      icon: 'trending-up-outline',
      activeIcon: 'trending-up',
    },
    {
      id: 'Alerts',
      label: t('alerts.title'),
      icon: 'notifications-outline',
      activeIcon: 'notifications',
    },
    {
      id: 'Settings',
      label: t('settings.title'),
      icon: 'settings-outline',
      activeIcon: 'settings',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(76, 175, 80, 0.05)' }]}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        <View style={styles.sidebarHeader}>
          {!isSidebarCollapsed && (
            <Animated.View style={{ opacity: textOpacity, flex: 1, overflow: 'hidden' }}>
              <Text
                style={styles.appTitle}
                numberOfLines={1}
              >
                {t('common.appName')}
              </Text>
            </Animated.View>
          )}

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleSidebar}
          >
            <Ionicons
              name={isSidebarCollapsed ? 'menu' : 'chevron-back'}
              size={24}
              color={COLORS.primaryDark}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarDivider} />

        <View style={styles.sidebarNav}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                currentScreen === item.id && styles.navItemActive,
                isSidebarCollapsed && styles.navItemCollapsed
              ]}
              onPress={() => navigation.navigate(item.id)}
            >
              <Ionicons
                name={currentScreen === item.id ? item.activeIcon : item.icon}
                size={24}
                color={currentScreen === item.id ? COLORS.primary : COLORS.text.secondary}
                style={[
                  styles.navIcon,
                  isSidebarCollapsed && styles.navIconCollapsed
                ]}
              />
              {!isSidebarCollapsed && (
                <Animated.View style={{ opacity: textOpacity, flex: 1, overflow: 'hidden' }}>
                  <Text
                    style={[
                      styles.navLabel,
                      currentScreen === item.id && styles.navLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </Animated.View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Main content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>

          <View style={styles.headerRight}>
            {showNotificationsButton && (
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={onNotificationsPress}
              >
                <Ionicons name="notifications-outline" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={styles.contentContainer}
        >
          <View
            style={[
              styles.contentWrapper,
              // Adjust max-width based on screen size and fullWidth prop
              {
                maxWidth: fullWidth
                  ? (windowWidth > 1600 ? 1400 : windowWidth > 1200 ? 1100 : '95%')
                  : (windowWidth > 1200 ? 1100 : 900)
              }
            ]}
          >
            {children}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(76, 175, 80, 0.05)', // Subtle green background
  },
  sidebar: {
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderGreen,
    height: '100vh',
    ...SHADOWS.medium,
  },
  sidebarHeader: {
    padding: SPACING.medium,
    borderBottomWidth: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    overflow: 'hidden',
  },
  sidebarDivider: {
    height: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  appTitle: {
    fontSize: FONT.sizes.large,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    marginLeft: 'auto',
  },
  sidebarNav: {
    padding: SPACING.medium,
    paddingTop: SPACING.medium,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
    borderRadius: 12,
    marginBottom: SPACING.medium,
    borderLeftWidth: 0,
    borderLeftColor: 'transparent',
    minHeight: 48,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    padding: SPACING.small,
    alignItems: 'center',
  },
  navItemActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  navIcon: {
    marginRight: SPACING.medium,
    width: 24,
    textAlign: 'center',
    alignSelf: 'center',
  },
  navIconCollapsed: {
    marginRight: 0,
  },
  navLabel: {
    fontSize: FONT.sizes.medium,
    color: COLORS.text.secondary,
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  navLabelActive: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  mainContent: {
    flex: 1,
    height: '100vh',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.large,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(76, 175, 80, 0.2)',
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginLeft: SPACING.small,
  },
  notificationButton: {
    padding: SPACING.small,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.large,
    paddingBottom: SPACING.xxl * 2,
  },
  contentWrapper: {
    width: '100%',
    marginHorizontal: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.large,
  },
});

export default WebLayout;
