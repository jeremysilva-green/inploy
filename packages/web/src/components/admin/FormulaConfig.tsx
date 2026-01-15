/**
 * Formula Configuration Component
 * Allows administrators to configure salary calculation formulas
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../styles/theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';

export const FormulaConfig: React.FC = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    latenessToleranceMinutes: '15',
    lunchReturnToleranceMinutes: '15',
    scheduledStartTime: '08:00',
    scheduledLunchStart: '12:00',
    scheduledLunchEnd: '13:00',
    expectedHoursPerDay: '8',
    expectedDaysPerMonth: '22',
  });

  // Fetch employees to get formula config
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employers'],
    queryFn: () => apiClient.getEmployers(),
  });

  // Get first employee's config as template (or create UI to manage global defaults)
  const sampleEmployee = employees?.items?.[0];
  const salaryConfig = sampleEmployee?.salaryConfig;

  React.useEffect(() => {
    if (salaryConfig) {
      setFormData({
        latenessToleranceMinutes: salaryConfig.latenessToleranceMinutes?.toString() || '15',
        lunchReturnToleranceMinutes: salaryConfig.lunchReturnToleranceMinutes?.toString() || '15',
        scheduledStartTime: salaryConfig.scheduledStartTime || '08:00',
        scheduledLunchStart: salaryConfig.scheduledLunchStart || '12:00',
        scheduledLunchEnd: salaryConfig.scheduledLunchEnd || '13:00',
        expectedHoursPerDay: salaryConfig.expectedHoursPerDay?.toString() || '8',
        expectedDaysPerMonth: salaryConfig.expectedDaysPerMonth?.toString() || '22',
      });
    }
  }, [salaryConfig]);

  const updateFormulaMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateGlobalFormula(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employers'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Error updating formula:', error);
      alert('Error al actualizar la fórmula: ' + error.message);
    },
  });

  const handleSave = () => {
    updateFormulaMutation.mutate({
      latenessToleranceMinutes: parseInt(formData.latenessToleranceMinutes),
      lunchReturnToleranceMinutes: parseInt(formData.lunchReturnToleranceMinutes),
      scheduledStartTime: formData.scheduledStartTime,
      scheduledLunchStart: formData.scheduledLunchStart,
      scheduledLunchEnd: formData.scheduledLunchEnd,
      expectedHoursPerDay: parseFloat(formData.expectedHoursPerDay),
      expectedDaysPerMonth: parseInt(formData.expectedDaysPerMonth),
    });
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
          <Text style={styles.title}>Fórmulas de Cálculo</Text>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>✎ Editar</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Work Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Horario de Trabajo</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Hora de Entrada Pactada</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.scheduledStartTime}
              onChangeText={(text) => setFormData({ ...formData, scheduledStartTime: text })}
              editable={isEditing}
              placeholder="HH:MM"
            />
            <Text style={styles.helperText}>
              Hora a la que los empleados deben ingresar (formato 24h)
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Inicio de Almuerzo</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.scheduledLunchStart}
              onChangeText={(text) => setFormData({ ...formData, scheduledLunchStart: text })}
              editable={isEditing}
              placeholder="HH:MM"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Fin de Almuerzo</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.scheduledLunchEnd}
              onChangeText={(text) => setFormData({ ...formData, scheduledLunchEnd: text })}
              editable={isEditing}
              placeholder="HH:MM"
            />
            <Text style={styles.helperText}>
              Hora máxima para retornar del almuerzo
            </Text>
          </View>
        </View>

        {/* Tolerance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Tolerancia de Atrasos</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tolerancia de Entrada (minutos)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.latenessToleranceMinutes}
              onChangeText={(text) => setFormData({ ...formData, latenessToleranceMinutes: text })}
              editable={isEditing}
              keyboardType="numeric"
              placeholder="15"
            />
            <Text style={styles.helperText}>
              Minutos de gracia antes de aplicar descuento por atraso de entrada
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tolerancia de Retorno de Almuerzo (minutos)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.lunchReturnToleranceMinutes}
              onChangeText={(text) => setFormData({ ...formData, lunchReturnToleranceMinutes: text })}
              editable={isEditing}
              keyboardType="numeric"
              placeholder="15"
            />
            <Text style={styles.helperText}>
              Minutos de gracia antes de aplicar descuento por atraso de almuerzo
            </Text>
          </View>
        </View>

        {/* Expected Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Horas Esperadas</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Horas por Día</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.expectedHoursPerDay}
              onChangeText={(text) => setFormData({ ...formData, expectedHoursPerDay: text })}
              editable={isEditing}
              keyboardType="numeric"
              placeholder="8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Días por Mes</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.expectedDaysPerMonth}
              onChangeText={(text) => setFormData({ ...formData, expectedDaysPerMonth: text })}
              editable={isEditing}
              keyboardType="numeric"
              placeholder="22"
            />
          </View>
        </View>

        {/* Formula Explanation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧮 Fórmulas de Cálculo</Text>

          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Descuento por Atraso</Text>
            <Text style={styles.formulaText}>
              Descuento = (Salario Mensual / Horas Mensuales) × Minutos Sancionables / 60
            </Text>
            <Text style={styles.formulaDetail}>
              Horas Mensuales = {formData.expectedHoursPerDay} horas/día × {formData.expectedDaysPerMonth} días = {parseInt(formData.expectedHoursPerDay) * parseInt(formData.expectedDaysPerMonth)} horas
            </Text>
            <Text style={styles.formulaDetail}>
              Minutos Sancionables = Minutos de atraso - {formData.latenessToleranceMinutes} minutos (tolerancia)
            </Text>
          </View>

          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Descuento por Atraso de Almuerzo</Text>
            <Text style={styles.formulaText}>
              Descuento = (Salario Mensual / Horas Mensuales) × Minutos Sancionables / 60
            </Text>
            <Text style={styles.formulaDetail}>
              Minutos Sancionables = Minutos de atraso - {formData.lunchReturnToleranceMinutes} minutos (tolerancia)
            </Text>
          </View>

          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Horas Extras / Faltantes</Text>
            <Text style={styles.formulaText}>
              Horas Trabajadas vs. Horas Esperadas ({formData.expectedHoursPerDay}h/día)
            </Text>
            <Text style={styles.formulaDetail}>
              • Horas Ganadas: cuando trabaja más de {formData.expectedHoursPerDay}h
            </Text>
            <Text style={styles.formulaDetail}>
              • Horas Perdidas: cuando trabaja menos de {formData.expectedHoursPerDay}h
            </Text>
          </View>
        </View>

        {/* Example Calculation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Ejemplo de Cálculo</Text>

          <View style={styles.exampleCard}>
            <Text style={styles.exampleTitle}>Empleado con salario mensual de ₲3,500,000</Text>
            <Text style={styles.exampleText}>
              • Horas mensuales esperadas: {parseInt(formData.expectedHoursPerDay) * parseInt(formData.expectedDaysPerMonth)}h
            </Text>
            <Text style={styles.exampleText}>
              • Valor por hora: ₲{Math.round(3500000 / (parseInt(formData.expectedHoursPerDay) * parseInt(formData.expectedDaysPerMonth))).toLocaleString()}
            </Text>
            <Text style={styles.exampleText}>
              • Llega 30 minutos tarde (tolerancia: {formData.latenessToleranceMinutes} min)
            </Text>
            <Text style={styles.exampleText}>
              • Minutos sancionables: 30 - {formData.latenessToleranceMinutes} = {30 - parseInt(formData.latenessToleranceMinutes)} min
            </Text>
            <Text style={styles.exampleResult}>
              • Descuento: ₲{Math.round((3500000 / (parseInt(formData.expectedHoursPerDay) * parseInt(formData.expectedDaysPerMonth))) * (30 - parseInt(formData.latenessToleranceMinutes)) / 60).toLocaleString()}
            </Text>
          </View>
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
    maxWidth: 900,
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
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.gray900,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  editButtonText: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  cancelButtonText: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.gray700,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  saveButtonText: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.white,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
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
  inputDisabled: {
    backgroundColor: theme.colors.gray100,
    color: theme.colors.gray600,
  },
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray500,
    marginTop: theme.spacing.xs,
  },
  formulaCard: {
    backgroundColor: theme.colors.gray50,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  formulaTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.xs,
  },
  formulaText: {
    fontFamily: 'Courier New, monospace',
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray800,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  formulaDetail: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray600,
    marginTop: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
  },
  exampleCard: {
    backgroundColor: '#FEF3C7',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  exampleTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.sm,
  },
  exampleText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray700,
    marginBottom: theme.spacing.xs,
  },
  exampleResult: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: '#DC2626',
    marginTop: theme.spacing.sm,
  },
});
