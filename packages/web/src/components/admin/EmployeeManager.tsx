/**
 * Employee Management Component
 * Compact UI for adding and editing employees
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../styles/theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';

export const EmployeeManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state - name, salary, and scheduled start time
  const [formData, setFormData] = useState({
    firstName: '',
    baseSalaryPYG: '',
    scheduledStartTime: '08:00', // Default to 8:00 AM
  });

  // Fetch employees
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employers'],
    queryFn: () => apiClient.getEmployers(),
  });

  // Add employee mutation
  const addMutation = useMutation({
    mutationFn: (data: any) => apiClient.createEmployer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employers'] });
      resetForm();
      setIsAdding(false);
    },
  });

  // Update employee mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateEmployer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employers'] });
      resetForm();
      setEditingId(null);
    },
  });

  // Delete employee mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteEmployer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employers'] });
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      baseSalaryPYG: '',
      scheduledStartTime: '08:00',
    });
  };

  const handleSubmit = () => {
    const employeeData = {
      firstName: formData.firstName,
      lastName: '', // Empty last name
      position: 'Empleado',
      salaryConfig: {
        salaryType: 'MONTHLY',
        baseSalaryPYG: parseFloat(formData.baseSalaryPYG) || 0,
        scheduledStartTime: formData.scheduledStartTime,
        latenessToleranceMinutes: 15,
        expectedHoursPerDay: 8,
        expectedDaysPerMonth: 22,
      },
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: employeeData });
    } else {
      addMutation.mutate(employeeData);
    }
  };

  const handleEdit = (employee: any) => {
    setEditingId(employee.id);
    setFormData({
      firstName: employee.firstName,
      baseSalaryPYG: employee.salaryConfig?.baseSalaryPYG?.toString() || '',
      scheduledStartTime: employee.salaryConfig?.scheduledStartTime || '08:00',
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    resetForm();
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Eliminar a ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Empleados</Text>
          {!isAdding && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAdding(true)}
            >
              <Text style={styles.addButtonText}>+ Agregar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Add/Edit Form */}
        {isAdding && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId ? 'Editar' : 'Nuevo Empleado'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Empleado/a *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData({ ...formData, firstName: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Salario (₲) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 3500000"
                keyboardType="numeric"
                value={formData.baseSalaryPYG}
                onChangeText={(text) =>
                  setFormData({ ...formData, baseSalaryPYG: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Hora de Entrada Pactada</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM (Ej: 08:00)"
                value={formData.scheduledStartTime}
                onChangeText={(text) =>
                  setFormData({ ...formData, scheduledStartTime: text })
                }
              />
              <Text style={styles.helperText}>
                Tolerancia: 15 minutos. Los atrasos superiores serán descontados.
              </Text>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSubmit}
                disabled={!formData.firstName || !formData.baseSalaryPYG}
              >
                <Text style={styles.saveButtonText}>
                  {editingId ? 'Guardar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Employee List */}
        <View style={styles.listContainer}>
          {employees?.items?.map((employee: any) => (
            <View key={employee.id} style={styles.employeeCard}>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>
                  {employee.firstName}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(employee)}
                >
                  <Text style={styles.editButtonText}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(employee.id, employee.firstName)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  loading: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray500,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 16,
    fontWeight: '600' as '600',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.white,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  formTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray900,
    fontFamily: theme.fonts.body,
  },
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.gray100,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.gray700,
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.white,
  },
  listContainer: {
    gap: theme.spacing.sm,
  },
  employeeCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.xs,
  },
  employeeSalary: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.gray600,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  editButton: {
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  editButtonText: {
    fontSize: 16,
    color: theme.colors.gray700,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#DC2626',
    lineHeight: 20,
  },
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray500,
    marginTop: theme.spacing.xs,
  },
});
