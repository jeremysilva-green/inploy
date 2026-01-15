/**
 * Check-in event types and state management
 */
export interface CheckIn {
    id: string;
    employerId: string;
    eventType: CheckInEventType;
    timestamp: Date;
    date: Date;
    pairedEventId?: string;
    notes?: string;
    ipAddress?: string;
    voiceGreetingPlayed: boolean;
    createdAt: Date;
}
export declare enum CheckInEventType {
    ENTRADA = "ENTRADA",
    SALIDA = "SALIDA",
    ALMUERZO = "ALMUERZO",
    RETURN = "RETURN"
}
export declare enum EmployerState {
    CHECKED_OUT = "CHECKED_OUT",
    CHECKED_IN = "CHECKED_IN",
    ON_LUNCH = "ON_LUNCH"
}
export interface CreateCheckInInput {
    employerId: string;
    eventType: CheckInEventType;
    voiceGreeting?: boolean;
    notes?: string;
}
export interface CheckInResponse {
    checkIn: CheckIn;
    newState: EmployerState;
}
export interface TodayCheckInsResponse {
    checkIns: CheckIn[];
    currentState: EmployerState;
}
export interface DailyHoursResult {
    totalHoursWorked: number;
    lunchHours: number;
    isComplete: boolean;
}
export interface MonthlyCheckInSummary {
    employerId: string;
    totalHoursWorked: number;
    lunchHours: number;
    hoursGained: number;
    hoursLost: number;
    expectedHours: number;
    dailySummaries: DailyWorkSummary[];
}
export interface DailyWorkSummary {
    id: string;
    employerId: string;
    date: Date;
    totalHoursWorked: number;
    lunchHours: number;
    expectedHours: number;
    hoursGained: number;
    hoursLost: number;
    salaryDeduction?: number;
    salaryBonus?: number;
    isComplete: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface StateValidationResult {
    valid: boolean;
    currentState: EmployerState;
    error?: string;
}
export type ButtonState = 'active' | 'disabled' | 'pending';
export interface CheckInButtonStates {
    entrada: ButtonState;
    salida: ButtonState;
    almuerzo: ButtonState;
}
