/**
 * GlobalMetricsPanel Component
 * Displays global metrics across all employers
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { formatCurrency } from '@inploy/shared';
import { useGlobalMetrics } from '../../hooks/useMetrics';
import { useCurrencyStore } from '../../store/currencyStore';
import { theme } from '../../styles/theme';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  color = theme.colors.primary,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );
};

export const GlobalMetricsPanel: React.FC = () => {
  const { data, isLoading, isError } = useGlobalMetrics();
  const currency = useCurrencyStore((state) => state.currency);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error al cargar métricas</Text>
      </View>
    );
  }

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Métricas Globales</Text>

      <View style={styles.grid}>
        <MetricCard
          title="Horas Trabajadas"
          value={formatHours(data.totalHoursWorked)}
          color={theme.colors.entrada}
        />

        <MetricCard
          title="Horas Ganadas"
          value={formatHours(data.totalHoursGained)}
          subtitle="Por encima del horario"
          color={theme.colors.success}
        />

        <MetricCard
          title="Horas Perdidas"
          value={formatHours(data.totalHoursLost)}
          subtitle="Por debajo del horario"
          color={theme.colors.error}
        />

        <MetricCard
          title="Horas de Almuerzo"
          value={formatHours(data.totalLunchHours)}
          color={theme.colors.almuerzo}
        />

        <MetricCard
          title="Deducciones Salariales"
          value={formatCurrency(data.totalSalaryDeductions, currency)}
          color={theme.colors.error}
        />

        <MetricCard
          title="Empleados Activos"
          value={data.employerMetrics?.length || 0}
          color={theme.colors.info}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    minWidth: 180,
    flex: 1,
    ...theme.shadows.md,
  },
  cardTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.xs,
  },
  cardValue: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray500,
  },
  loadingContainer: {
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
  },
});
