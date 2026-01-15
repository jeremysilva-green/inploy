/**
 * Employer-related TypeScript types
 */

export interface Employer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
  position?: string;
  department?: string;
  isActive: boolean;
  baselineHoursPerWeek: number;
  userId?: string;
  salaryConfig?: SalaryConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryConfig {
  id: string;
  employerId: string;
  salaryType: SalaryType;
  baseSalaryPYG: number;
  hourlyRatePYG?: number;
  deductionFormula: DeductionFormula;
  exchangeRate: number;
  scheduledStartTime?: string;
  latenessToleranceMinutes?: number;
  scheduledLunchStart?: string;
  scheduledLunchEnd?: string;
  lunchReturnToleranceMinutes?: number;
  expectedHoursPerDay?: number;
  expectedDaysPerMonth?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum SalaryType {
  MONTHLY = 'MONTHLY',
  HOURLY = 'HOURLY',
}

export type DeductionFormula =
  | { type: 'percentage'; value: number; applyToHoursLost?: boolean }
  | { type: 'fixed'; value: number }
  | { type: 'tiered'; value: Record<string, number> };

export interface CreateEmployerInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
  position?: string;
  department?: string;
  baselineHoursPerWeek?: number;
  salaryConfig: CreateSalaryConfigInput;
}

export interface CreateSalaryConfigInput {
  salaryType: SalaryType;
  baseSalaryPYG: number;
  hourlyRatePYG?: number;
  deductionFormula?: DeductionFormula;
  exchangeRate?: number;
}

export interface UpdateEmployerInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  employeeNumber?: string;
  position?: string;
  department?: string;
  baselineHoursPerWeek?: number;
  isActive?: boolean;
  salaryConfig?: Partial<CreateSalaryConfigInput>;
}

export interface EmployerWithMetrics extends Employer {
  totalHoursWorked: number;
  hoursGained: number;
  hoursLost: number;
  lunchHours: number;
  salaryDeduction: number;
}
