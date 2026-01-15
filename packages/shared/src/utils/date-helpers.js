"use strict";
/**
 * Date and time utility functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpectedHoursForMonth = exports.getExpectedHoursForDate = exports.isSameDay = exports.parseDate = exports.toLocalDateString = exports.isEndOfDay = exports.differenceInHours = exports.differenceInMinutes = exports.getTodayInTimezone = exports.getDateRange = exports.PARAGUAY_TIMEZONE = void 0;
exports.PARAGUAY_TIMEZONE = 'America/Asuncion';
/**
 * Get start and end of day in specified timezone
 */
const getDateRange = (date, timezone = exports.PARAGUAY_TIMEZONE) => {
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const start = new Date(localDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(localDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};
exports.getDateRange = getDateRange;
/**
 * Get today's date in specified timezone
 */
const getTodayInTimezone = (timezone = exports.PARAGUAY_TIMEZONE) => {
    const now = new Date();
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    return localNow;
};
exports.getTodayInTimezone = getTodayInTimezone;
/**
 * Calculate difference in minutes between two dates
 */
const differenceInMinutes = (later, earlier) => {
    return Math.floor((later.getTime() - earlier.getTime()) / (1000 * 60));
};
exports.differenceInMinutes = differenceInMinutes;
/**
 * Calculate difference in hours between two dates
 */
const differenceInHours = (later, earlier) => {
    return (0, exports.differenceInMinutes)(later, earlier) / 60;
};
exports.differenceInHours = differenceInHours;
/**
 * Check if date is end of day
 */
const isEndOfDay = (date) => {
    return date.getHours() === 23 && date.getMinutes() === 59;
};
exports.isEndOfDay = isEndOfDay;
/**
 * Format date to local date string (YYYY-MM-DD)
 */
const toLocalDateString = (date, timezone = exports.PARAGUAY_TIMEZONE) => {
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return localDate.toISOString().split('T')[0];
};
exports.toLocalDateString = toLocalDateString;
/**
 * Parse date string to Date object
 */
const parseDate = (dateString) => {
    return new Date(dateString);
};
exports.parseDate = parseDate;
/**
 * Check if two dates are on the same day
 */
const isSameDay = (date1, date2) => {
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
};
exports.isSameDay = isSameDay;
/**
 * Get expected working hours for a date based on baseline
 * Assumes 5-day work week (Monday-Friday)
 */
const getExpectedHoursForDate = (date, baselineHoursPerWeek) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    // Weekend - no expected hours
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 0;
    }
    // Weekday - divide weekly hours by 5
    return baselineHoursPerWeek / 5;
};
exports.getExpectedHoursForDate = getExpectedHoursForDate;
/**
 * Get expected working hours for a month
 */
const getExpectedHoursForMonth = (year, month, baselineHoursPerWeek) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let totalExpectedHours = 0;
    const currentDay = new Date(firstDay);
    while (currentDay <= lastDay) {
        totalExpectedHours += (0, exports.getExpectedHoursForDate)(currentDay, baselineHoursPerWeek);
        currentDay.setDate(currentDay.getDate() + 1);
    }
    return totalExpectedHours;
};
exports.getExpectedHoursForMonth = getExpectedHoursForMonth;
//# sourceMappingURL=date-helpers.js.map