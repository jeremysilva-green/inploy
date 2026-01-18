/**
 * Modern Admin Dashboard - Premium Design
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { data: employees } = useQuery({
    queryKey: ['employers'],
    queryFn: () => apiClient.getEmployers(),
  });

  // Fetch check-ins for the selected month
  const { data: checkInsData } = useQuery({
    queryKey: ['check-ins-month', selectedMonth],
    queryFn: () => {
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

      return apiClient.getCheckIns({
        startDate,
        endDate,
      });
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Group check-ins by date
  const groupCheckInsByDate = (checkIns: any[]) => {
    const grouped: Record<string, any[]> = {};
    checkIns?.forEach((ci: any) => {
      const date = new Date(ci.timestamp).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(ci);
    });
    return grouped;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-PY', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-PY', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  const calculateSalary = (baseSalary: number, deduction: number) => {
    return baseSalary - deduction;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Page Title */}
      <Text style={styles.pageTitle}>Registros - {selectedMonth}</Text>

      {/* Employee List */}
      {employees?.items?.map((emp: any) => {
        const baseSalary = emp.salaryConfig?.baseSalaryPYG || 0;
        const groupedCheckIns = groupCheckInsByDate(
          checkInsData?.checkIns?.filter((ci: any) => ci.employerId === emp.id) || []
        );
        const dates = Object.keys(groupedCheckIns).sort().reverse(); // Most recent first

        return (
          <View key={emp.id} style={styles.employeeSection}>
            {/* Employee Header */}
            <View style={styles.employeeHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{emp.firstName?.charAt(0)}</Text>
              </View>
              <View style={styles.employeeMainInfo}>
                <Text style={styles.employeeName}>{emp.firstName}</Text>
                <Text style={styles.employeeSalary}>
                  Salario Base: ₲{baseSalary.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Daily Records */}
            <View style={styles.recordsContainer}>
              {dates.length === 0 ? (
                <Text style={styles.noRecords}>No hay registros este mes</Text>
              ) : (
                dates.map((date) => {
                  const dayCheckIns = groupedCheckIns[date];
                  const entrada = dayCheckIns.find((ci: any) => ci.eventType === 'ENTRADA');
                  const salida = dayCheckIns.find((ci: any) => ci.eventType === 'SALIDA');
                  const almuerzo = dayCheckIns.find((ci: any) => ci.eventType === 'ALMUERZO');
                  const returnFromLunch = dayCheckIns.find((ci: any) => ci.eventType === 'RETURN');

                  // Calculate lunch lateness (example: 1 hour lunch break, tolerance 15 min)
                  let lunchLateMinutes = 0;
                  let lunchDeduction = 0;

                  if (almuerzo && returnFromLunch) {
                    const lunchStart = new Date(almuerzo.timestamp);
                    const lunchEnd = new Date(returnFromLunch.timestamp);
                    const lunchDuration = (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60);
                    const tolerance = 15; // 15 minutes tolerance
                    const expectedLunch = 60; // 60 minutes expected

                    if (lunchDuration > expectedLunch + tolerance) {
                      lunchLateMinutes = Math.floor(lunchDuration - expectedLunch - tolerance);
                      // Calculate deduction: (baseSalary / 22 days / 8 hours / 60 min) * late minutes
                      const perMinuteRate = baseSalary / 22 / 8 / 60;
                      lunchDeduction = Math.floor(perMinuteRate * lunchLateMinutes);
                    }
                  }

                  const finalSalary = calculateSalary(baseSalary, lunchDeduction);

                  return (
                    <View key={date} style={styles.dayRecord}>
                      {/* Date Header */}
                      <Text style={styles.dateLabel}>{formatDate(date)}</Text>

                      {/* Check-in times */}
                      <View style={styles.checkInTimesGrid}>
                        <View style={styles.timeBox}>
                          <Text style={styles.timeLabel}>Entrada</Text>
                          <Text style={entrada ? styles.timeValue : styles.timeValueEmpty}>
                            {entrada ? formatTime(entrada.timestamp) : '--:--'}
                          </Text>
                        </View>

                        <View style={styles.timeBox}>
                          <Text style={styles.timeLabel}>Almuerzo</Text>
                          <Text style={almuerzo ? styles.timeValue : styles.timeValueEmpty}>
                            {almuerzo ? formatTime(almuerzo.timestamp) : '--:--'}
                          </Text>
                        </View>

                        <View style={styles.timeBox}>
                          <Text style={styles.timeLabel}>Regreso</Text>
                          <Text style={returnFromLunch ? styles.timeValue : styles.timeValueEmpty}>
                            {returnFromLunch ? formatTime(returnFromLunch.timestamp) : '--:--'}
                          </Text>
                        </View>

                        <View style={styles.timeBox}>
                          <Text style={styles.timeLabel}>Salida</Text>
                          <Text style={salida ? styles.timeValue : styles.timeValueEmpty}>
                            {salida ? formatTime(salida.timestamp) : '--:--'}
                          </Text>
                        </View>
                      </View>

                      {/* Deduction and Salary Info */}
                      <View style={styles.deductionInfo}>
                        {(lunchLateMinutes > 0 || lunchDeduction > 0) && (
                          <View style={styles.deductionRow}>
                            {lunchLateMinutes > 0 && (
                              <Text style={styles.latenessText}>
                                Atraso: {lunchLateMinutes} min
                              </Text>
                            )}
                            {lunchDeduction > 0 && (
                              <Text style={styles.deductionText}>
                                Descuento: -₲{lunchDeduction.toLocaleString()}
                              </Text>
                            )}
                          </View>
                        )}
                        <Text style={styles.finalSalaryText}>
                          Salario: ₲{finalSalary.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
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
    marginBottom: 20,
  },
  employeeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employeeMainInfo: {
    flex: 1,
  },
  employeeName: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  employeeSalary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  recordsContainer: {
    gap: 12,
  },
  noRecords: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    paddingVertical: 20,
  },
  dayRecord: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  checkInTimesGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  timeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 75,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  timeValueEmpty: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  deductionInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deductionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  latenessText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  deductionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  finalSalaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981', // Green for final salary
    marginTop: 4,
  },
});
