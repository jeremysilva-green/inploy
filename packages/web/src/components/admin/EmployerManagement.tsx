/**
 * EmployerManagement Component
 * Admin interface for managing employers
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Employer, formatCurrency, Currency } from '@inploy/shared';
import { useEmployers } from '../../hooks/useEmployers';
import { useCurrencyStore } from '../../store/currencyStore';
import { theme } from '../../styles/theme';

interface EmployerRowProps {
  employer: Employer;
}

const EmployerRow: React.FC<EmployerRowProps> = ({ employer }) => {
  const currency = useCurrencyStore((state) => state.currency);

  const salary = employer.salaryConfig
    ? formatCurrency(Number(employer.salaryConfig.baseSalaryPYG), currency)
    : 'N/A';

  const salaryType = employer.salaryConfig?.salaryType || 'N/A';

  return (
    <View style={styles.row}>
      <View style={styles.nameColumn}>
        <Text style={styles.employerName}>
          {employer.firstName} {employer.lastName}
        </Text>
        {employer.position && (
          <Text style={styles.employerPosition}>{employer.position}</Text>
        )}
      </View>

      <View style={styles.detailsColumn}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Tipo:</Text>
          <Text style={styles.detailValue}>{salaryType}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Salario:</Text>
          <Text style={styles.detailValue}>{salary}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Horas/Sem:</Text>
          <Text style={styles.detailValue}>
            {Number(employer.baselineHoursPerWeek)}h
          </Text>
        </View>
      </View>

      <View style={styles.statusColumn}>
        <View
          style={[
            styles.statusBadge,
            employer.isActive
              ? styles.statusActiveBackground
              : styles.statusInactiveBackground,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              employer.isActive ? styles.statusActiveText : styles.statusInactiveText,
            ]}
          >
            {employer.isActive ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const EmployerManagement: React.FC = () => {
  const { data, isLoading, isError, error } = useEmployers({ limit: 100 });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando empleados...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Error: {(error as Error)?.message || 'Error al cargar empleados'}
        </Text>
      </View>
    );
  }

  const employers = data?.items || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Empleados</Text>
        <Text style={styles.subtitle}>
          {employers.length} {employers.length === 1 ? 'empleado' : 'empleados'}
        </Text>
      </View>

      {employers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay empleados registrados</Text>
          <Text style={styles.emptySubtext}>
            Usa el botón "Agregar Empleado" para crear uno nuevo
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.tableContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.table}>
            {employers.map((employer) => (
              <EmployerRow key={employer.id} employer={employer} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray600,
  },
  tableContainer: {
    flex: 1,
  },
  table: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  row: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    alignItems: 'center',
  },
  nameColumn: {
    flex: 2,
  },
  employerName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray900,
    marginBottom: 2,
  },
  employerPosition: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray600,
  },
  detailsColumn: {
    flex: 3,
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray600,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gray900,
  },
  statusColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  statusActiveBackground: {
    backgroundColor: '#D1FAE5',
  },
  statusInactiveBackground: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  statusActiveText: {
    color: '#065F46',
  },
  statusInactiveText: {
    color: '#991B1B',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.gray600,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray700,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray600,
    textAlign: 'center',
  },
});
