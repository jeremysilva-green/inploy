/**
 * Lateness Calculation Service
 * Calculates deductions based on lateness with tolerance
 */

import { Decimal } from '@prisma/client/runtime/library';

interface LatenessCalculationInput {
  scheduledTime: Date; // Hora de entrada pactada
  checkInTime: Date; // Hora de entrada real
  monthlySalary: number; // Salario mensual en PYG
  toleranceMinutes?: number; // Tolerancia en minutos (default: 15)
}

interface LatenessResult {
  lateMinutes: number; // Minutos de atraso
  penaltyMinutes: number; // Minutos sancionables (después de tolerancia)
  deductionAmount: number; // Monto a descontar en PYG
  isLate: boolean; // Si llegó tarde
}

export class LatenessService {
  private static readonly HOURS_PER_MONTH = 220; // Horas mensuales estándar
  private static readonly MINUTES_PER_MONTH = 220 * 60; // 13,200 minutos
  private static readonly DEFAULT_TOLERANCE = 15; // 15 minutos de tolerancia

  /**
   * Calculate lateness deduction
   *
   * Formula:
   * 1. Calcular diferencia en minutos entre hora pactada y hora real
   * 2. Restar tolerancia (15 min por defecto)
   * 3. Si es negativo → 0 (no hay atraso)
   * 4. Multiplicar por valor por minuto
   *
   * Valor por minuto = SalarioMensual / (220 × 60)
   */
  static calculateLateness(input: LatenessCalculationInput): LatenessResult {
    const {
      scheduledTime,
      checkInTime,
      monthlySalary,
      toleranceMinutes = this.DEFAULT_TOLERANCE,
    } = input;

    // 1. Calcular diferencia en minutos
    const diffMs = checkInTime.getTime() - scheduledTime.getTime();
    const lateMinutes = Math.floor(diffMs / (1000 * 60));

    // Si llegó temprano o a tiempo, no hay atraso
    if (lateMinutes <= 0) {
      return {
        lateMinutes: 0,
        penaltyMinutes: 0,
        deductionAmount: 0,
        isLate: false,
      };
    }

    // 2. Restar tolerancia
    const penaltyMinutes = Math.max(0, lateMinutes - toleranceMinutes);

    // Si está dentro de la tolerancia, no hay descuento
    if (penaltyMinutes === 0) {
      return {
        lateMinutes,
        penaltyMinutes: 0,
        deductionAmount: 0,
        isLate: true, // Llegó tarde pero dentro de tolerancia
      };
    }

    // 3. Calcular valor por minuto
    const valuePerMinute = monthlySalary / this.MINUTES_PER_MONTH;

    // 4. Calcular descuento
    const deductionAmount = Math.round(penaltyMinutes * valuePerMinute);

    return {
      lateMinutes,
      penaltyMinutes,
      deductionAmount,
      isLate: true,
    };
  }

  /**
   * Calculate value per minute for a given monthly salary
   */
  static getValuePerMinute(monthlySalary: number): number {
    return monthlySalary / this.MINUTES_PER_MONTH;
  }

  /**
   * Calculate value per hour for a given monthly salary
   */
  static getValuePerHour(monthlySalary: number): number {
    return monthlySalary / this.HOURS_PER_MONTH;
  }

  /**
   * Example calculation for documentation
   *
   * Salario mensual: 5.000.000 Gs
   * Entrada pactada: 08:00
   * Entrada real: 08:28
   *
   * Atraso real = 28 min
   * Minutos sancionables = 28 − 15 = 13 min
   * Valor minuto = 5.000.000 / 13.200 ≈ 378,78 Gs
   * Descuento ≈ 4.924 Gs
   */
  static example(): LatenessResult {
    const scheduledTime = new Date('2024-01-11T08:00:00');
    const checkInTime = new Date('2024-01-11T08:28:00');
    const monthlySalary = 5000000;

    return this.calculateLateness({
      scheduledTime,
      checkInTime,
      monthlySalary,
    });
  }
}
