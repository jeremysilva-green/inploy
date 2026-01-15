/**
 * Date and time utility functions
 */
export declare const PARAGUAY_TIMEZONE = "America/Asuncion";
/**
 * Get start and end of day in specified timezone
 */
export declare const getDateRange: (date: Date, timezone?: string) => {
    start: Date;
    end: Date;
};
/**
 * Get today's date in specified timezone
 */
export declare const getTodayInTimezone: (timezone?: string) => Date;
/**
 * Calculate difference in minutes between two dates
 */
export declare const differenceInMinutes: (later: Date, earlier: Date) => number;
/**
 * Calculate difference in hours between two dates
 */
export declare const differenceInHours: (later: Date, earlier: Date) => number;
/**
 * Check if date is end of day
 */
export declare const isEndOfDay: (date: Date) => boolean;
/**
 * Format date to local date string (YYYY-MM-DD)
 */
export declare const toLocalDateString: (date: Date, timezone?: string) => string;
/**
 * Parse date string to Date object
 */
export declare const parseDate: (dateString: string) => Date;
/**
 * Check if two dates are on the same day
 */
export declare const isSameDay: (date1: Date, date2: Date) => boolean;
/**
 * Get expected working hours for a date based on baseline
 * Assumes 5-day work week (Monday-Friday)
 */
export declare const getExpectedHoursForDate: (date: Date, baselineHoursPerWeek: number) => number;
/**
 * Get expected working hours for a month
 */
export declare const getExpectedHoursForMonth: (year: number, month: number, baselineHoursPerWeek: number) => number;
