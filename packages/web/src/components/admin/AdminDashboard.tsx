/**
 * Modern Admin Dashboard - Premium Design
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const { data: employees } = useQuery({
    queryKey: ['employers'],
    queryFn: () => apiClient.getEmployers(),
  });

  const { data: todaySummaries } = useQuery({
    queryKey: ['today-summaries'],
    queryFn: () => apiClient.getTodaySummaries(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch today's check-ins for all employees
  const { data: checkInsData } = useQuery({
    queryKey: ['check-ins-today'],
    queryFn: () => apiClient.getCheckIns({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });


  return (
    <View style={styles.container}>
      {/* Page Title */}
      <Text style={styles.pageTitle}>Registros</Text>

      {/* Employee List */}
      <View style={styles.listCard}>
        {employees?.items?.map((emp: any) => {
          const summary = todaySummaries?.summaries?.find(
            (s: any) => s.employerId === emp.id
          );
          const lateMinutes = summary?.lateMinutes || 0;
          const penaltyMinutes = summary?.penaltyMinutes || 0;
          const deduction = summary?.latenessDeduction || 0;

          const lunchLateMinutes = summary?.lunchLateMinutes || 0;
          const lunchPenaltyMinutes = summary?.lunchPenaltyMinutes || 0;
          const lunchDeduction = summary?.lunchLatenessDeduction || 0;

          // Get check-ins for this employee
          const employeeCheckIns = checkInsData?.checkIns?.filter(
            (ci: any) => ci.employerId === emp.id
          ) || [];

          const entrada = employeeCheckIns.find((ci: any) => ci.eventType === 'ENTRADA');
          const salida = employeeCheckIns.find((ci: any) => ci.eventType === 'SALIDA');
          const almuerzo = employeeCheckIns.find((ci: any) => ci.eventType === 'ALMUERZO');

          const formatTime = (timestamp: string) => {
            return new Date(timestamp).toLocaleTimeString('es-PY', {
              hour: '2-digit',
              minute: '2-digit',
            });
          };

          return (
            <View key={emp.id} style={styles.employeeRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{emp.firstName?.charAt(0)}</Text>
              </View>
              <View style={styles.employeeMainInfo}>
                <Text style={styles.employeeName}>{emp.firstName}</Text>
                <Text style={styles.employeeSalary}>
                  ₲{(emp.salaryConfig?.baseSalaryPYG || 0).toLocaleString()}
                </Text>
              </View>

              {/* Check-in times */}
              <View style={styles.checkInTimes}>
                {entrada && (
                  <View style={styles.timeEntry}>
                    <Text style={styles.timeLabel}>Entrada:</Text>
                    <Text style={styles.timeValue}>{formatTime(entrada.timestamp)}</Text>
                  </View>
                )}
                {almuerzo && (
                  <View style={styles.timeEntry}>
                    <Text style={styles.timeLabel}>Almuerzo:</Text>
                    <Text style={styles.timeValue}>{formatTime(almuerzo.timestamp)}</Text>
                  </View>
                )}
                {salida && (
                  <View style={styles.timeEntry}>
                    <Text style={styles.timeLabel}>Salida:</Text>
                    <Text style={styles.timeValue}>{formatTime(salida.timestamp)}</Text>
                  </View>
                )}
                {!entrada && !salida && !almuerzo && (
                  <Text style={styles.noCheckIn}>Sin registros</Text>
                )}
              </View>

              {/* Deduction info */}
              <View style={styles.deductionInfo}>
                {lunchLateMinutes > 0 && (
                  <Text style={styles.latenessText}>
                    Atraso almuerzo: {lunchLateMinutes} min
                  </Text>
                )}
                {lunchDeduction > 0 && (
                  <Text style={styles.deductionText}>
                    Descuento: ₲{lunchDeduction.toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F7F8FA',
  },
  pageTitle: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeMainInfo: {
    flex: 0.3,
    minWidth: 150,
  },
  employeeName: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  employeeSalary: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkInTimes: {
    flex: 0.4,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  timeEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  noCheckIn: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  deductionInfo: {
    flex: 0.2,
    alignItems: 'flex-end',
    paddingLeft: 12,
  },
  latenessText: {
    fontSize: 11,
    color: '#F59E0B', // Orange for lateness
    marginBottom: 2,
  },
  penaltyText: {
    fontSize: 11,
    color: '#EF4444', // Red for penalty
    marginBottom: 2,
  },
  deductionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626', // Darker red for deduction amount
  },
});
