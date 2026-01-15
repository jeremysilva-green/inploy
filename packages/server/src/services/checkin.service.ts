/**
 * CheckInService - Orchestrates check-in operations with state validation
 *
 * Responsibilities:
 * - Validate state transitions before allowing check-ins
 * - Create check-in events with proper timestamps
 * - Calculate and update daily work summaries
 * - Emit events for real-time dashboard updates
 */

import { PrismaClient } from '@prisma/client';
import {
  CheckIn,
  CheckInEventType,
  EmployerState,
  CreateCheckInInput,
  CheckInResponse,
  TodayCheckInsResponse,
  StateValidationResult,
  isValidStateTransition,
  getStateTransitionError,
  toLocalDateString,
  getTodayInTimezone,
  PARAGUAY_TIMEZONE,
} from '@inploy/shared';
import { hoursCalculator } from '../domain/calculators/HoursCalculator';
import { LatenessService } from './lateness.service';

export class CheckInService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new check-in event
   *
   * Steps:
   * 1. Validate state transition
   * 2. Create check-in record with server timestamp
   * 3. Update daily work summary
   * 4. Return new state
   *
   * @param input - Check-in creation input
   * @param ipAddress - Client IP address for audit
   * @returns Check-in response with new state
   */
  async createCheckIn(
    input: CreateCheckInInput,
    ipAddress?: string
  ): Promise<CheckInResponse> {
    // Validate state transition
    const validation = await this.validateCheckIn(
      input.employerId,
      input.eventType
    );

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Server-side timestamp to prevent manipulation
    const timestamp = new Date();
    const date = toLocalDateString(timestamp, PARAGUAY_TIMEZONE);

    // Create check-in event
    const checkIn = await this.prisma.checkIn.create({
      data: {
        employerId: input.employerId,
        eventType: input.eventType,
        timestamp,
        date: new Date(date),
        notes: input.notes,
        ipAddress,
        voiceGreetingPlayed: input.voiceGreeting || false,
      },
    });

    // Determine new state
    const newState = await this.getCurrentState(input.employerId);

    // Update daily work summary asynchronously
    this.updateDailyWorkSummary(input.employerId, new Date(date)).catch(
      (error) => {
        console.error('Failed to update daily work summary:', error);
      }
    );

    return {
      checkIn: this.mapToCheckIn(checkIn),
      newState,
    };
  }

  /**
   * Validate if a check-in event is allowed based on current state
   *
   * @param employerId - Employer ID
   * @param eventType - Type of check-in event
   * @returns Validation result
   */
  async validateCheckIn(
    employerId: string,
    eventType: CheckInEventType
  ): Promise<StateValidationResult> {
    const currentState = await this.getCurrentState(employerId);

    const isValid = isValidStateTransition(currentState, eventType);

    if (!isValid) {
      return {
        valid: false,
        currentState,
        error: getStateTransitionError(currentState, eventType),
      };
    }

    return {
      valid: true,
      currentState,
    };
  }

  /**
   * Get current state for an employer
   *
   * @param employerId - Employer ID
   * @returns Current state
   */
  async getCurrentState(employerId: string): Promise<EmployerState> {
    const todayCheckIns = await this.getTodayCheckIns(employerId);
    return hoursCalculator.determineCurrentState(todayCheckIns);
  }

  /**
   * Get today's check-ins for an employer
   *
   * @param employerId - Employer ID
   * @returns Today's check-ins and current state
   */
  async getTodayCheckIns(employerId: string): Promise<CheckIn[]> {
    const today = getTodayInTimezone(PARAGUAY_TIMEZONE);
    const dateString = toLocalDateString(today, PARAGUAY_TIMEZONE);

    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        employerId,
        date: new Date(dateString),
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return checkIns.map(this.mapToCheckIn);
  }

  /**
   * Get today's check-ins with current state
   *
   * @param employerId - Employer ID
   * @returns Response with check-ins and state
   */
  async getTodayCheckInsWithState(
    employerId: string
  ): Promise<TodayCheckInsResponse> {
    const checkIns = await this.getTodayCheckIns(employerId);
    const currentState = hoursCalculator.determineCurrentState(checkIns);

    return {
      checkIns,
      currentState,
    };
  }

  /**
   * Get check-ins for a date range
   *
   * @param employerId - Employer ID (optional, null for all)
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Array of check-ins
   */
  async getCheckIns(
    employerId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CheckIn[]> {
    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        ...(employerId && { employerId }),
        ...(startDate && endDate && {
          date: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return checkIns.map(this.mapToCheckIn);
  }

  /**
   * Update or create daily work summary
   *
   * Calculates hours worked, lunch hours, variance, lateness, and salary impact
   *
   * @param employerId - Employer ID
   * @param date - Date to update
   */
  private async updateDailyWorkSummary(
    employerId: string,
    date: Date
  ): Promise<void> {
    // Get all check-ins for this day
    const dateString = toLocalDateString(date, PARAGUAY_TIMEZONE);
    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        employerId,
        date: new Date(dateString),
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Calculate hours
    const mappedCheckIns = checkIns.map(this.mapToCheckIn);
    const dailyHours = hoursCalculator.calculateDailyHours(mappedCheckIns);

    // Get employer's baseline and salary config to calculate expected hours and lateness
    const employer = await this.prisma.employer.findUnique({
      where: { id: employerId },
      select: {
        baselineHoursPerWeek: true,
        salaryConfig: true,
      },
    });

    if (!employer) {
      throw new Error('Employer not found');
    }

    const expectedHours = hoursCalculator.getExpectedHoursForDate(
      date,
      Number(employer.baselineHoursPerWeek)
    );

    // Calculate variance
    const variance = hoursCalculator.calculateVariance(
      dailyHours.totalHoursWorked,
      expectedHours
    );

    // Calculate lateness if there's an ENTRADA check-in
    let latenessResult = null;
    const firstEntrada = checkIns.find(c => c.eventType === 'ENTRADA');

    if (firstEntrada && employer.salaryConfig) {
      const scheduledStartTime = employer.salaryConfig.scheduledStartTime || '08:00';
      const toleranceMinutes = employer.salaryConfig.latenessToleranceMinutes || 15;

      // Parse scheduled time (format: "HH:MM")
      const [hours, minutes] = scheduledStartTime.split(':').map(Number);
      const scheduledTime = new Date(firstEntrada.timestamp);
      scheduledTime.setHours(hours, minutes, 0, 0);

      latenessResult = LatenessService.calculateLateness({
        scheduledTime,
        checkInTime: firstEntrada.timestamp,
        monthlySalary: Number(employer.salaryConfig.baseSalaryPYG),
        toleranceMinutes,
      });
    }

    // Calculate lunch lateness if there's a RETURN from lunch
    let lunchLatenessResult = null;
    const firstReturn = checkIns.find(c => c.eventType === 'RETURN');

    if (firstReturn && employer.salaryConfig) {
      const scheduledLunchEnd = employer.salaryConfig.scheduledLunchEnd || '13:00';
      const toleranceMinutes = employer.salaryConfig.lunchReturnToleranceMinutes || 15;

      // Parse scheduled lunch end time (format: "HH:MM")
      const [hours, minutes] = scheduledLunchEnd.split(':').map(Number);
      const scheduledReturnTime = new Date(firstReturn.timestamp);
      scheduledReturnTime.setHours(hours, minutes, 0, 0);

      lunchLatenessResult = LatenessService.calculateLateness({
        scheduledTime: scheduledReturnTime,
        checkInTime: firstReturn.timestamp,
        monthlySalary: Number(employer.salaryConfig.baseSalaryPYG),
        toleranceMinutes,
      });
    }

    // Upsert daily work summary
    await this.prisma.dailyWorkSummary.upsert({
      where: {
        employerId_date: {
          employerId,
          date: new Date(dateString),
        },
      },
      create: {
        employerId,
        date: new Date(dateString),
        totalHoursWorked: dailyHours.totalHoursWorked,
        lunchHours: dailyHours.lunchHours,
        expectedHours,
        hoursGained: variance.hoursGained,
        hoursLost: variance.hoursLost,
        isComplete: dailyHours.isComplete,
        ...(latenessResult && {
          lateMinutes: latenessResult.lateMinutes,
          penaltyMinutes: latenessResult.penaltyMinutes,
          latenessDeduction: latenessResult.deductionAmount,
        }),
        ...(lunchLatenessResult && {
          lunchLateMinutes: lunchLatenessResult.lateMinutes,
          lunchPenaltyMinutes: lunchLatenessResult.penaltyMinutes,
          lunchLatenessDeduction: lunchLatenessResult.deductionAmount,
        }),
      },
      update: {
        totalHoursWorked: dailyHours.totalHoursWorked,
        lunchHours: dailyHours.lunchHours,
        expectedHours,
        hoursGained: variance.hoursGained,
        hoursLost: variance.hoursLost,
        isComplete: dailyHours.isComplete,
        ...(latenessResult && {
          lateMinutes: latenessResult.lateMinutes,
          penaltyMinutes: latenessResult.penaltyMinutes,
          latenessDeduction: latenessResult.deductionAmount,
        }),
        ...(lunchLatenessResult && {
          lunchLateMinutes: lunchLatenessResult.lateMinutes,
          lunchPenaltyMinutes: lunchLatenessResult.penaltyMinutes,
          lunchLatenessDeduction: lunchLatenessResult.deductionAmount,
        }),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Map Prisma CheckIn to domain CheckIn
   */
  private mapToCheckIn(prismaCheckIn: any): CheckIn {
    return {
      id: prismaCheckIn.id,
      employerId: prismaCheckIn.employerId,
      eventType: prismaCheckIn.eventType as CheckInEventType,
      timestamp: prismaCheckIn.timestamp,
      date: prismaCheckIn.date,
      pairedEventId: prismaCheckIn.pairedEventId,
      notes: prismaCheckIn.notes,
      ipAddress: prismaCheckIn.ipAddress,
      voiceGreetingPlayed: prismaCheckIn.voiceGreetingPlayed,
      createdAt: prismaCheckIn.createdAt,
    };
  }
}
