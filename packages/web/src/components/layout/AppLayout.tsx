/**
 * App Layout with Sidebar
 * Matches premium dashboard design
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../styles/theme';

interface AppLayoutProps {
  children: React.ReactNode;
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentScreen, onNavigate }) => {
  const menuItems = [
    { id: 'employees', label: 'Empleados', icon: '👥', category: 'main' },
    { id: 'admin', label: 'Dashboard', icon: '📊', category: 'main' },
    { id: 'daysoff', label: 'Días Libres', icon: '🏖️', category: 'main' },
  ];

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>💼</Text>
          </View>
          <Text style={styles.logoText}>InPloy</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                currentScreen === item.id && styles.menuItemActive,
              ]}
              onPress={() => onNavigate(item.id)}
            >
              <Text
                style={[
                  styles.menuLabel,
                  currentScreen === item.id && styles.menuLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search (Ctrl+/)</Text>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.topBarIcon}>🌙</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.topBarIcon}>🔔</Text>
            </TouchableOpacity>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>A</Text>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <ScrollView style={styles.content}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F7F8FA',
  },
  sidebar: {
    width: 240,
    backgroundColor: theme.colors.white,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingVertical: theme.spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  logoEmoji: {
    fontSize: 18,
  },
  logoText: {
    fontFamily: theme.fonts.heading,
    fontSize: 20,
    fontWeight: theme.fontWeight.bold as any,
    color: '#1F2937',
  },
  menu: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    marginHorizontal: theme.spacing.sm,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  menuLabel: {
    fontFamily: theme.fonts.heading,
    fontSize: 14,
    fontWeight: '500' as any,
    color: '#6B7280',
  },
  menuLabelActive: {
    color: '#6366F1',
    fontWeight: theme.fontWeight.semibold as any,
  },
  main: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    minWidth: 300,
    gap: theme.spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  topBarIcon: {
    fontSize: 18,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  userAvatarText: {
    fontFamily: theme.fonts.heading,
    fontSize: 14,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.white,
  },
  content: {
    flex: 1,
  },
});
