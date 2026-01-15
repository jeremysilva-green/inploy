/**
 * EmployerCard Component
 * Displays individual employer with check-in buttons
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Employer, CheckInEventType, EmployerState } from '@inploy/shared';
import { CheckInButtons } from './CheckInButtons';
import { useTodayCheckIns, useCreateCheckIn } from '../../hooks/useCheckIn';
import { theme } from '../../styles/theme';

interface EmployerCardProps {
  employer: Employer;
}

/**
 * Get status badge color based on current state
 */
const getStatusColor = (state: EmployerState): string => {
  const colors = {
    [EmployerState.CHECKED_OUT]: theme.colors.gray400,
    [EmployerState.CHECKED_IN]: theme.colors.entrada,
    [EmployerState.ON_LUNCH]: theme.colors.almuerzo,
  };
  return colors[state];
};

/**
 * Get status label
 */
const getStatusLabel = (state: EmployerState): string => {
  const labels = {
    [EmployerState.CHECKED_OUT]: 'Fuera',
    [EmployerState.CHECKED_IN]: 'Trabajando',
    [EmployerState.ON_LUNCH]: 'Almuerzo',
  };
  return labels[state];
};

export const EmployerCard: React.FC<EmployerCardProps> = ({ employer }) => {
  const { data: todayData, isLoading: isLoadingState } = useTodayCheckIns(employer.id);
  const createCheckIn = useCreateCheckIn();

  const currentState = todayData?.currentState || EmployerState.CHECKED_OUT;

  const handleCheckIn = (eventType: CheckInEventType) => {
    createCheckIn.mutate({
      employerId: employer.id,
      eventType,
      voiceGreeting: eventType === CheckInEventType.ENTRADA,
      employerName: employer.firstName,
    });
  };

  return (
    <View style={styles.card}>
      {/* Employer Info */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employer.firstName.charAt(0)}
            {employer.lastName.charAt(0)}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>
            {employer.firstName} {employer.lastName}
          </Text>
          {employer.position && (
            <Text style={styles.position}>{employer.position}</Text>
          )}

          {/* Status Badge */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(currentState) },
              ]}
            >
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{getStatusLabel(currentState)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Check-in Buttons */}
      <View style={styles.buttonsContainer}>
        <CheckInButtons
          employerId={employer.id}
          employerName={employer.firstName}
          currentState={currentState}
          onCheckIn={handleCheckIn}
          isLoading={createCheckIn.isPending}
        />
      </View>

      {/* Error Message */}
      {createCheckIn.isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {(createCheckIn.error as Error)?.message || 'Error al registrar entrada/salida'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray900,
    marginBottom: 2,
  },
  position: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  buttonsContainer: {
    width: '100%',
  },
  errorContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
});
