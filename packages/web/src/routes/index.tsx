/**
 * Application routing with sidebar layout
 * Matches premium dashboard design
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { EmployeeManager } from '../components/admin/EmployeeManager';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { DaysOffManagement } from '../components/admin/DaysOffManagement';
import { KioskDisplay } from '../components/display/KioskDisplay';
import { FormulaConfig } from '../components/admin/FormulaConfig';
import { DarkModeToggle } from '../components/common/DarkModeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../styles/theme';

type Screen = 'employees' | 'admin' | 'daysoff' | 'display' | 'formula';

export const AppRouter: React.FC = () => {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('admin');
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'employees':
        return <EmployeeManager />;
      case 'admin':
        return <AdminDashboard />;
      case 'daysoff':
        return <DaysOffManagement />;
      case 'display':
        return <KioskDisplay />;
      case 'formula':
        return <FormulaConfig />;
      default:
        return <AdminDashboard />;
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Navigation */}
        <View style={styles.nav}>
          <Text style={styles.navSection}>MENÚ</Text>

          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'admin' && styles.navItemActive]}
            onPress={() => setCurrentScreen('admin')}
          >
            <Text style={[styles.navLabel, currentScreen === 'admin' && styles.navLabelActive]}>
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'employees' && styles.navItemActive]}
            onPress={() => setCurrentScreen('employees')}
          >
            <Text style={[styles.navLabel, currentScreen === 'employees' && styles.navLabelActive]}>
              Empleados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'daysoff' && styles.navItemActive]}
            onPress={() => setCurrentScreen('daysoff')}
          >
            <Text style={[styles.navLabel, currentScreen === 'daysoff' && styles.navLabelActive]}>
              Días Libres
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'formula' && styles.navItemActive]}
            onPress={() => setCurrentScreen('formula')}
          >
            <Text style={[styles.navLabel, currentScreen === 'formula' && styles.navLabelActive]}>
              Fórmula
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'display' && styles.navItemActive]}
            onPress={() => setCurrentScreen('display')}
          >
            <Text style={[styles.navLabel, currentScreen === 'display' && styles.navLabelActive]}>
              Display
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchText}>Search (Ctrl+/)</Text>
          </View>

          <View style={styles.topBarActions}>
            <DarkModeToggle />
            <TouchableOpacity style={styles.iconBtn}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
              <Text style={styles.topIcon}>◉</Text>
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {renderScreen()}
        </ScrollView>
      </View>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof getThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  sidebar: {
    width: 240,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  logoImage: {
    width: 180,
    height: 50,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
  },
  nav: {
    paddingHorizontal: 12,
  },
  navSection: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: colors.primaryLight,
  },
  navIcon: {
    fontSize: 18,
    width: 24,
    marginRight: 12,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 300,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: colors.textSecondary,
  },
  searchText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.surfaceHover,
    position: 'relative',
  },
  topIcon: {
    fontSize: 18,
    color: colors.text,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    fontFamily: 'Montserrat, sans-serif',
  },
  content: {
    flex: 1,
  },
});
