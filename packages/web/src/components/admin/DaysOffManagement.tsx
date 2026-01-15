/**
 * DaysOffManagement Component
 * Admin interface for managing employee days off
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { DayOffType, Employer, formatCurrency } from '@inploy/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { useEmployers } from '../../hooks/useEmployers';
import { useCurrencyStore } from '../../store/currencyStore';
import { theme } from '../../styles/theme';

interface DayOffFormData {
  employerId: string;
  date: string;
  type: DayOffType;
  isPaid: boolean;
  reason: string;
}

const DAY_OFF_TYPES = [
  { value: DayOffType.VACATION, label: 'Vacaciones' },
  { value: DayOffType.SICK_LEAVE, label: 'Licencia Médica' },
  { value: DayOffType.PERSONAL, label: 'Personal' },
  { value: DayOffType.UNPAID, label: 'Sin Goce de Sueldo' },
  { value: DayOffType.HOLIDAY, label: 'Feriado' },
];

// Helper functions for date conversion
const formatDateForDisplay = (isoDate: string): string => {
  // Convert yyyy-mm-dd to dd/mm/yyyy
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const formatDateForStorage = (displayDate: string): string => {
  // Convert dd/mm/yyyy to yyyy-mm-dd
  const [day, month, year] = displayDate.split('/');
  return `${year}-${month}-${day}`;
};

export const DaysOffManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const currency = useCurrencyStore((state) => state.currency);
  const { data: employersData } = useEmployers({ limit: 100 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<DayOffFormData>({
    employerId: '',
    date: formatDateForDisplay(new Date().toISOString().split('T')[0]),
    type: DayOffType.VACATION,
    isPaid: false,
    reason: '',
  });

  // Fetch days off
  const { data: daysOffData, isLoading } = useQuery({
    queryKey: ['days-off'],
    queryFn: () => apiClient.getDaysOff({}),
  });

  // Create day off mutation
  const createDayOff = useMutation({
    mutationFn: (data: any) => apiClient.createDayOff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['days-off'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      setModalVisible(false);
      resetForm();
    },
  });

  // Update day off mutation
  const updateDayOff = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateDayOff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['days-off'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      setModalVisible(false);
      setEditingId(null);
      resetForm();
    },
  });

  // Delete day off mutation
  const deleteDayOff = useMutation({
    mutationFn: (id: string) => apiClient.deleteDayOff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['days-off'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const resetForm = () => {
    setFormData({
      employerId: '',
      date: formatDateForDisplay(new Date().toISOString().split('T')[0]),
      type: DayOffType.VACATION,
      isPaid: false,
      reason: '',
    });
  };

  const handleEdit = (dayOff: any) => {
    setEditingId(dayOff.id);
    setFormData({
      employerId: dayOff.employerId,
      date: formatDateForDisplay(new Date(dayOff.date).toISOString().split('T')[0]),
      type: dayOff.type,
      isPaid: dayOff.isPaid,
      reason: dayOff.reason || '',
    });
    setModalVisible(true);
  };

  const handleSubmit = () => {
    // Convert date from dd/mm/yyyy to yyyy-mm-dd for API
    const dataToSend = {
      ...formData,
      date: formatDateForStorage(formData.date),
    };

    if (editingId) {
      updateDayOff.mutate({ id: editingId, data: dataToSend });
    } else {
      createDayOff.mutate(dataToSend);
    }
  };

  const employers = employersData?.items || [];
  const daysOff = daysOffData?.daysOff || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Días Libres</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Agregar Día Libre</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : daysOff.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay días libres registrados</Text>
        </View>
      ) : (
        <ScrollView style={styles.table}>
          {daysOff.map((dayOff: any) => (
            <View key={dayOff.id} style={styles.row}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateText}>
                  {new Date(dayOff.date).toLocaleDateString('es-PY')}
                </Text>
              </View>

              <View style={styles.employerColumn}>
                <Text style={styles.employerText}>
                  {dayOff.employer?.firstName} {dayOff.employer?.lastName}
                </Text>
              </View>

              <View style={styles.typeColumn}>
                <Text style={styles.typeText}>
                  {DAY_OFF_TYPES.find((t) => t.value === dayOff.type)?.label || dayOff.type}
                </Text>
              </View>

              <View style={styles.statusColumn}>
                <View
                  style={[
                    styles.statusBadge,
                    dayOff.isPaid ? styles.paidBadge : styles.unpaidBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {dayOff.isPaid ? 'Pagado' : 'No Pagado'}
                  </Text>
                </View>
              </View>

              {!dayOff.isPaid && dayOff.deductionAmount && (
                <View style={styles.deductionColumn}>
                  <Text style={styles.deductionText}>
                    -{formatCurrency(Number(dayOff.deductionAmount), currency)}
                  </Text>
                </View>
              )}

              <View style={styles.actionsColumn}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(dayOff)}
                >
                  <Text style={styles.editButtonText}>✎</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteDayOff.mutate(dayOff.id)}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add/Edit Day Off Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setEditingId(null);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Editar Día Libre' : 'Agregar Día Libre'}
            </Text>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Empleado</Text>
                <View style={styles.selectContainer}>
                  <select
                    style={styles.select}
                    value={formData.employerId}
                    onChange={(e: any) => setFormData({ ...formData, employerId: e.target.value })}
                  >
                    <option value="">Seleccionar empleado...</option>
                    {employers.map((emp: Employer) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </View>
              </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha</Text>
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={(date) => setFormData({ ...formData, date })}
                placeholder="dd/mm/yyyy"
                maxLength={10}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo</Text>
              <View style={styles.selectContainer}>
                <select
                  style={styles.select}
                  value={formData.type}
                  onChange={(e: any) => setFormData({ ...formData, type: e.target.value as DayOffType })}
                >
                  {DAY_OFF_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </View>
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setFormData({ ...formData, isPaid: !formData.isPaid })}
              >
                <View style={[styles.checkboxBox, formData.isPaid && styles.checkboxBoxChecked]}>
                  {formData.isPaid && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Día Pagado</Text>
              </TouchableOpacity>
            </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Razón (Opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.reason}
                  onChangeText={(reason) => setFormData({ ...formData, reason })}
                  placeholder="Motivo del día libre"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
                disabled={(createDayOff.isPending || updateDayOff.isPending) || !formData.employerId}
              >
                <Text style={styles.submitButtonText}>
                  {(createDayOff.isPending || updateDayOff.isPending) ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray900,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  table: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  row: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    alignItems: 'center',
  },
  dateColumn: { flex: 1 },
  employerColumn: { flex: 2 },
  typeColumn: { flex: 2 },
  statusColumn: { flex: 1 },
  deductionColumn: { flex: 1 },
  actionsColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gray700,
  },
  employerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray900,
  },
  typeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray700,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  paidBadge: { backgroundColor: '#D1FAE5' },
  unpaidBadge: { backgroundColor: '#FEE2E2' },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  deductionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    fontWeight: theme.fontWeight.semibold,
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  editButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  deleteButtonText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.lg,
  },
  loadingContainer: {
    padding: theme.spacing.xxxl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray600,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalScrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.gray900,
  },
  formGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray700,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
  },
  select: {
    width: '100%',
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontFamily: theme.fonts.body,
    color: theme.colors.gray900,
  } as any,
  pickerContainer: {
    maxHeight: 150,
  },
  pickerOption: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: 4,
  },
  pickerOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  pickerOptionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray700,
  },
  pickerOptionTextSelected: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.gray400,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray700,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  cancelButton: {
    backgroundColor: theme.colors.gray200,
  },
  cancelButtonText: {
    color: theme.colors.gray700,
    fontWeight: theme.fontWeight.semibold,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
  },
});
