/**
 * Date and time utility functions
 */

export const PARAGUAY_TIMEZONE = 'America/Asuncion';

/**
 * Get start and end of day in specified timezone
 */
export const getDateRange = (
  date: Date,
  timezone: string = PARAGUAY_TIMEZONE
): { start: Date; end: Date } => {
  const localDate = new Date(
    date.toLocaleString('en-US', { timeZone: timezone })
  );

  const start = new Date(localDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(localDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Get today's date in specified timezone
 */
export const getTodayInTimezone = (
  timezone: string = PARAGUAY_TIMEZONE
): Date => {
  const now = new Date();
  const localNow = new Date(
    now.toLocaleString('en-US', { timeZone: timezone })
  );
  return localNow;
};

/**
 * Calculate difference in minutes between two dates
 */
export const differenceInMinutes = (later: Date, earlier: Date): number => {
  return Math.floor((later.getTime() - earlier.getTime()) / (1000 * 60));
};

/**
 * Calculate difference in hours between two dates
 */
export const differenceInHours = (later: Date, earlier: Date): number => {
  return differenceInMinutes(later, earlier) / 60;
};

/**
 * Check if date is end of day
 */
export const isEndOfDay = (date: Date): boolean => {
  return date.getHours() === 23 && date.getMinutes() === 59;
};

/**
 * Format date to local date string (YYYY-MM-DD)
 */
export const toLocalDateString = (
  date: Date,
  timezone: string = PARAGUAY_TIMEZONE
): string => {
  const localDate = new Date(
    date.toLocaleString('en-US', { timeZone: timezone })
  );
  return localDate.toISOString().split('T')[0];
};

/**
 * Parse date string to Date object
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Check if two dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get expected working hours for a date based on baseline
 * Assumes 5-day work week (Monday-Friday)
 */
export const getExpectedHoursForDate = (
  date: Date,
  baselineHoursPerWeek: number
): number => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Weekend - no expected hours
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 0;
  }

  // Weekday - divide weekly hours by 5
  return baselineHoursPerWeek / 5;
};

/**
 * Get expected working hours for a month
 */
export const getExpectedHoursForMonth = (
  year: number,
  month: number,
  baselineHoursPerWeek: number
): number => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let totalExpectedHours = 0;
  const currentDay = new Date(firstDay);

  while (currentDay <= lastDay) {
    totalExpectedHours += getExpectedHoursForDate(
      currentDay,
      baselineHoursPerWeek
    );
    currentDay.setDate(currentDay.getDate() + 1);
  }

  return totalExpectedHours;
};
