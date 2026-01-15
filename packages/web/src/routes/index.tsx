/**
 * Application routing with sidebar layout
 * Matches premium dashboard design
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { EmployeeManager } from '../components/admin/EmployeeManager';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { DaysOffManagement } from '../components/admin/DaysOffManagement';
import { KioskDisplay } from '../components/display/KioskDisplay';
import { FormulaConfig } from '../components/admin/FormulaConfig';

type Screen = 'employees' | 'admin' | 'daysoff' | 'display' | 'formula';

export const AppRouter: React.FC = () => {
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('admin');

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

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>▥</Text>
          </View>
          <Text style={styles.logoText}>InPloy</Text>
        </View>

        {/* Navigation */}
        <View style={styles.nav}>
          <Text style={styles.navSection}>MENÚ</Text>

          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'admin' && styles.navItemActive]}
            onPress={() => setCurrentScreen('admin')}
          >
            <Text style={styles.navIcon}>▦</Text>
            <Text style={[styles.navLabel, currentScreen === 'admin' && styles.navLabelActive]}>
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'employees' && styles.navItemActive]}
            onPress={() => setCurrentScreen('employees')}
          >
            <Text style={styles.navIcon}>👤</Text>
            <Text style={[styles.navLabel, currentScreen === 'employees' && styles.navLabelActive]}>
              Empleados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'daysoff' && styles.navItemActive]}
            onPress={() => setCurrentScreen('daysoff')}
          >
            <Text style={styles.navIcon}>📅</Text>
            <Text style={[styles.navLabel, currentScreen === 'daysoff' && styles.navLabelActive]}>
              Días Libres
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'formula' && styles.navItemActive]}
            onPress={() => setCurrentScreen('formula')}
          >
            <Text style={styles.navIcon}>🧮</Text>
            <Text style={[styles.navLabel, currentScreen === 'formula' && styles.navLabelActive]}>
              Fórmula
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, currentScreen === 'display' && styles.navItemActive]}
            onPress={() => setCurrentScreen('display')}
          >
            <Text style={styles.navIcon}>⌚</Text>
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
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.topIcon}>☾</Text>
            </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F7F9FC',
  },
  sidebar: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingVertical: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoEmoji: {
    fontSize: 16,
  },
  logoText: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  nav: {
    paddingHorizontal: 12,
  },
  navSection: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
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
    backgroundColor: '#EEF2FF',
  },
  navIcon: {
    fontSize: 18,
    width: 24,
    marginRight: 12,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  navLabelActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 300,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchText: {
    fontSize: 14,
    color: '#9CA3AF',
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
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  topIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
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
    color: '#FFFFFF',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Montserrat, sans-serif',
  },
  content: {
    flex: 1,
  },
});
