/**
 * HoursCalculator - Core business logic for calculating worked hours
 *
 * Handles:
 * - Daily work hours calculation
 * - Lunch break tracking (unpaid)
 * - Hours gained/lost vs baseline
 * - Edge cases (no SALIDA, multiple periods, forgotten RETURN)
 */

import {
  CheckIn,
  CheckInEventType,
  DailyHoursResult,
  EmployerState,
} from '@inploy/shared';
import {
  differenceInMinutes,
  isEndOfDay,
  getExpectedHoursForDate,
} from '@inploy/shared';

export class HoursCalculator {
  /**
   * Calculate work hours for a single day
   *
   * Logic:
   * 1. Sort check-ins by timestamp
   * 2. Use state machine to pair ENTRADA→SALIDA and ALMUERZO→RETURN
   * 3. Sum all work periods
   * 4. Subtract lunch time from work time (unpaid lunch)
   * 5. Handle edge cases (incomplete day, multiple periods)
   *
   * @param checkIns - All check-in events for a single day
   * @returns Daily hours calculation result
   */
  calculateDailyHours(checkIns: CheckIn[]): DailyHoursResult {
    if (!checkIns || checkIns.length === 0) {
      return {
        totalHoursWorked: 0,
        lunchHours: 0,
        isComplete: true,
      };
    }

    // Sort by timestamp to ensure chronological order
    const sorted = [...checkIns].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let totalWorkMinutes = 0;
    let totalLunchMinutes = 0;
    let lastEntrada: CheckIn | null = null;
    let lastAlmuerzo: CheckIn | null = null;

    for (const event of sorted) {
      switch (event.eventType) {
        case CheckInEventType.ENTRADA:
          // New work period starts
          lastEntrada = event;
          break;

        case CheckInEventType.SALIDA:
          // Work period ends
          if (lastEntrada) {
            const workMinutes = differenceInMinutes(
              new Date(event.timestamp),
              new Date(lastEntrada.timestamp)
            );
            totalWorkMinutes += workMinutes;
            lastEntrada = null; // Reset for next period
          }
          break;

        case CheckInEventType.ALMUERZO:
          // Lunch break starts
          lastAlmuerzo = event;
          break;

        case CheckInEventType.RETURN:
          // Lunch break ends
          if (lastAlmuerzo) {
            const lunchMinutes = differenceInMinutes(
              new Date(event.timestamp),
              new Date(lastAlmuerzo.timestamp)
            );
            totalLunchMinutes += lunchMinutes;
            lastAlmuerzo = null; // Reset for next lunch
          }
          break;
      }
    }

    // Edge case: Still checked in (no SALIDA) - calculate up to now
    if (lastEntrada && !isEndOfDay(new Date())) {
      const now = new Date();
      const workMinutes = differenceInMinutes(now, new Date(lastEntrada.timestamp));
      totalWorkMinutes += workMinutes;
    }

    // Edge case: On lunch without RETURN - calculate lunch up to now or SALIDA
    if (lastAlmuerzo) {
      // Find if there's a SALIDA after this ALMUERZO
      const salidaAfterLunch = sorted.find(
        (e) =>
          e.eventType === CheckInEventType.SALIDA &&
          new Date(e.timestamp) > new Date(lastAlmuerzo!.timestamp)
      );

      if (salidaAfterLunch) {
        // Lunch extends until SALIDA
        const lunchMinutes = differenceInMinutes(
          new Date(salidaAfterLunch.timestamp),
          new Date(lastAlmuerzo.timestamp)
        );
        totalLunchMinutes += lunchMinutes;
      } else if (!isEndOfDay(new Date())) {
        // Still on lunch - calculate up to now
        const now = new Date();
        const lunchMinutes = differenceInMinutes(now, new Date(lastAlmuerzo.timestamp));
        totalLunchMinutes += lunchMinutes;
      }
    }

    // Subtract lunch from work time (unpaid lunch)
    const netWorkMinutes = totalWorkMinutes - totalLunchMinutes;

    return {
      totalHoursWorked: Math.max(0, netWorkMinutes / 60), // Ensure non-negative
      lunchHours: totalLunchMinutes / 60,
      isComplete: lastEntrada === null && lastAlmuerzo === null,
    };
  }

  /**
   * Calculate hours gained/lost vs baseline
   *
   * @param actualHours - Hours worked
   * @param expectedHours - Expected hours based on baseline
   * @returns Hours gained and lost
   */
  calculateVariance(
    actualHours: number,
    expectedHours: number
  ): { hoursGained: number; hoursLost: number } {
    const variance = actualHours - expectedHours;

    return {
      hoursGained: variance > 0 ? variance : 0,
      hoursLost: variance < 0 ? Math.abs(variance) : 0,
    };
  }

  /**
   * Calculate expected hours for a specific date
   *
   * @param date - Date to check
   * @param baselineHoursPerWeek - Employee's baseline weekly hours
   * @returns Expected hours for that date
   */
  getExpectedHoursForDate(
    date: Date,
    baselineHoursPerWeek: number
  ): number {
    return getExpectedHoursForDate(date, baselineHoursPerWeek);
  }

  /**
   * Determine current state based on check-in history
   *
   * @param checkIns - Check-ins for the day (sorted by timestamp)
   * @returns Current employer state
   */
  determineCurrentState(checkIns: CheckIn[]): EmployerState {
    if (!checkIns || checkIns.length === 0) {
      return EmployerState.CHECKED_OUT;
    }

    // Sort by timestamp descending to get most recent event
    const sorted = [...checkIns].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const lastEvent = sorted[0];

    switch (lastEvent.eventType) {
      case CheckInEventType.SALIDA:
        return EmployerState.CHECKED_OUT;

      case CheckInEventType.ENTRADA:
        return EmployerState.CHECKED_IN;

      case CheckInEventType.ALMUERZO:
        return EmployerState.ON_LUNCH;

      case CheckInEventType.RETURN:
        return EmployerState.CHECKED_IN;

      default:
        return EmployerState.CHECKED_OUT;
    }
  }

  /**
   * Calculate total hours for multiple days
   *
   * @param dailyResults - Array of daily hour calculations
   * @returns Total hours across all days
   */
  calculateTotalHours(dailyResults: DailyHoursResult[]): {
    totalHoursWorked: number;
    totalLunchHours: number;
  } {
    return dailyResults.reduce(
      (acc, day) => ({
        totalHoursWorked: acc.totalHoursWorked + day.totalHoursWorked,
        totalLunchHours: acc.totalLunchHours + day.lunchHours,
      }),
      { totalHoursWorked: 0, totalLunchHours: 0 }
    );
  }
}

export const hoursCalculator = new HoursCalculator();
