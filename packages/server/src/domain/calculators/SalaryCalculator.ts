/**
 * SalaryCalculator - Salary deduction and calculation logic
 *
 * Handles:
 * - Hours lost deductions (monthly vs hourly employees)
 * - Configurable deduction formulas (percentage, fixed, tiered)
 * - Days off deductions
 * - Currency conversion (PYG ⟷ USD)
 */

import {
  SalaryConfig,
  SalaryType,
  DeductionFormula,
  SalaryCalculationResult,
  Currency,
  convertCurrency,
} from '@inploy/shared';
import { getExpectedHoursForMonth } from '@inploy/shared';

export class SalaryCalculator {
  /**
   * Calculate salary deduction for hours lost
   *
   * Monthly employees: Deduction = (monthly salary / expected monthly hours) * hours lost
   * Hourly employees: Deduction = hourly rate * hours lost
   *
   * @param salaryConfig - Employee's salary configuration
   * @param hoursLost - Number of hours lost
   * @param expectedMonthlyHours - Expected hours for the month
   * @returns Deduction amount in PYG
   */
  calculateHoursLostDeduction(
    salaryConfig: SalaryConfig,
    hoursLost: number,
    expectedMonthlyHours: number
  ): number {
    if (hoursLost <= 0) return 0;

    if (salaryConfig.salaryType === SalaryType.HOURLY) {
      // Hourly employee: deduct at hourly rate
      return Number(salaryConfig.hourlyRatePYG || 0) * hoursLost;
    }

    // Monthly employee: calculate hourly equivalent and deduct
    const hourlyEquivalent =
      Number(salaryConfig.baseSalaryPYG) / expectedMonthlyHours;
    return hourlyEquivalent * hoursLost;
  }

  /**
   * Apply custom deduction formula from configuration
   *
   * Supports:
   * - percentage: deduct X% of base salary
   * - fixed: deduct fixed amount
   * - tiered: different deduction rates for different hour thresholds
   *
   * @param formula - Deduction formula configuration
   * @param baseSalary - Base salary amount
   * @param hoursLost - Number of hours lost (if applicable)
   * @returns Deduction amount
   */
  applyDeductionFormula(
    formula: DeductionFormula,
    baseSalary: number,
    hoursLost: number = 0
  ): number {
    switch (formula.type) {
      case 'percentage':
        return baseSalary * (formula.value / 100);

      case 'fixed':
        return formula.value;

      case 'tiered':
        return this.applyTieredDeduction(formula.value, hoursLost);

      default:
        return 0;
    }
  }

  /**
   * Apply tiered deduction based on hours lost thresholds
   *
   * Example formula.value:
   * {
   *   "0-5": 10000,    // 0-5 hours lost: ₲10,000 deduction
   *   "5-10": 25000,   // 5-10 hours lost: ₲25,000 deduction
   *   "10+": 50000     // 10+ hours lost: ₲50,000 deduction
   * }
   *
   * @param tiers - Tier configuration
   * @param hoursLost - Number of hours lost
   * @returns Deduction amount for the tier
   */
  private applyTieredDeduction(
    tiers: Record<string, number>,
    hoursLost: number
  ): number {
    for (const [range, amount] of Object.entries(tiers)) {
      if (range.includes('-')) {
        const [min, max] = range.split('-').map(Number);
        if (hoursLost >= min && hoursLost < max) {
          return amount;
        }
      } else if (range.endsWith('+')) {
        const min = Number(range.replace('+', ''));
        if (hoursLost >= min) {
          return amount;
        }
      }
    }

    return 0;
  }

  /**
   * Calculate total salary with all deductions
   *
   * @param salaryConfig - Employee's salary configuration
   * @param hoursWorked - Total hours worked in period
   * @param hoursLost - Total hours lost vs baseline
   * @param daysOffDeduction - Deduction from days off
   * @param expectedHours - Expected hours for period
   * @param currency - Currency to return result in
   * @returns Complete salary calculation
   */
  calculateSalary(
    salaryConfig: SalaryConfig,
    hoursWorked: number,
    hoursLost: number,
    daysOffDeduction: number,
    expectedHours: number,
    currency: Currency = Currency.PYG
  ): SalaryCalculationResult {
    const baseSalary = Number(salaryConfig.baseSalaryPYG);

    // Calculate hours lost deduction
    const hoursLostDeduction = this.calculateHoursLostDeduction(
      salaryConfig,
      hoursLost,
      expectedHours
    );

    // Total deductions
    const totalDeductions = hoursLostDeduction + daysOffDeduction;

    // Calculate actual salary
    let actualSalary = baseSalary;

    if (salaryConfig.salaryType === SalaryType.HOURLY) {
      // Hourly: calculate based on hours worked
      actualSalary = Number(salaryConfig.hourlyRatePYG || 0) * hoursWorked;
    } else {
      // Monthly: base salary minus deductions
      actualSalary = baseSalary - totalDeductions;
    }

    // Ensure non-negative
    actualSalary = Math.max(0, actualSalary);

    const result: SalaryCalculationResult = {
      expectedSalary: baseSalary,
      actualSalary,
      totalDeductions,
      hoursLostDeduction,
      daysOffDeduction,
      bonuses: 0, // Future feature: bonuses for extra hours
      currency: Currency.PYG,
    };

    // Convert to requested currency if needed
    if (currency === Currency.USD) {
      const rate = Number(salaryConfig.exchangeRate);
      return {
        expectedSalary: convertCurrency(
          result.expectedSalary,
          Currency.PYG,
          Currency.USD,
          rate
        ),
        actualSalary: convertCurrency(
          result.actualSalary,
          Currency.PYG,
          Currency.USD,
          rate
        ),
        totalDeductions: convertCurrency(
          result.totalDeductions,
          Currency.PYG,
          Currency.USD,
          rate
        ),
        hoursLostDeduction: convertCurrency(
          result.hoursLostDeduction,
          Currency.PYG,
          Currency.USD,
          rate
        ),
        daysOffDeduction: convertCurrency(
          result.daysOffDeduction,
          Currency.PYG,
          Currency.USD,
          rate
        ),
        bonuses: 0,
        currency: Currency.USD,
      };
    }

    return result;
  }

  /**
   * Calculate deduction for a single day off
   *
   * @param salaryConfig - Employee's salary configuration
   * @param isPaid - Whether the day off is paid
   * @returns Deduction amount in PYG
   */
  calculateDayOffDeduction(
    salaryConfig: SalaryConfig,
    isPaid: boolean
  ): number {
    if (isPaid) return 0;

    const baseSalary = Number(salaryConfig.baseSalaryPYG);

    if (salaryConfig.salaryType === SalaryType.MONTHLY) {
      // Monthly salary: deduct 1/30th of monthly salary
      return baseSalary / 30;
    }

    // Hourly: deduct expected daily hours
    const baselineHoursPerDay = 40 / 5; // Assuming 40h week, 5 days
    return Number(salaryConfig.hourlyRatePYG || 0) * baselineHoursPerDay;
  }

  /**
   * Get expected monthly hours based on baseline weekly hours
   *
   * @param year - Year
   * @param month - Month (0-11)
   * @param baselineHoursPerWeek - Baseline weekly hours
   * @returns Expected hours for the month
   */
  getExpectedMonthlyHours(
    year: number,
    month: number,
    baselineHoursPerWeek: number
  ): number {
    return getExpectedHoursForMonth(year, month, baselineHoursPerWeek);
  }
}

export const salaryCalculator = new SalaryCalculator();
