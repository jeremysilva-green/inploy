/**
 * Salary calculation and deduction types
 */
export interface DayOff {
    id: string;
    employerId: string;
    date: Date;
    type: DayOffType;
    isPaid: boolean;
    deductionAmount?: number;
    reason?: string;
    approvedBy?: string;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum DayOffType {
    VACATION = "VACATION",
    SICK_LEAVE = "SICK_LEAVE",
    PERSONAL = "PERSONAL",
    UNPAID = "UNPAID",
    HOLIDAY = "HOLIDAY"
}
export interface CreateDayOffInput {
    employerId: string;
    date: Date | string;
    type: DayOffType;
    isPaid?: boolean;
    deductionAmount?: number;
    reason?: string;
}
export interface SalaryCalculationResult {
    expectedSalary: number;
    actualSalary: number;
    totalDeductions: number;
    hoursLostDeduction: number;
    daysOffDeduction: number;
    bonuses: number;
    currency: 'PYG' | 'USD';
}
export interface DeductionCalculation {
    type: 'hours_lost' | 'day_off';
    amount: number;
    description: string;
    date?: Date;
}
