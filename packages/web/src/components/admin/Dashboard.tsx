/**
 * Dashboard Component
 * Main admin dashboard with metrics and employer management
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { GlobalMetricsPanel } from './GlobalMetricsPanel';
import { EmployerManagement } from './EmployerManagement';
import { CurrencyToggle } from './CurrencyToggle';
import { theme } from '../../styles/theme';

export const Dashboard: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header with Currency Toggle */}
      <View style={styles.header}>
        <CurrencyToggle />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Global Metrics Panel */}
        <GlobalMetricsPanel />

        {/* Employer Management Table */}
        <EmployerManagement />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    ...theme.shadows.sm,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
});
