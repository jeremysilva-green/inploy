/**
 * Check-in API routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { CheckInEventType } from '@inploy/shared';
import { CheckInService } from '../services/checkin.service';
import { prisma } from '../config/database';
import { verifyAuth } from '../middleware/auth';
import { requireSelfOrAdmin } from '../middleware/roleCheck';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateQuery, validateParams, schemas } from '../middleware/validation';

const router = Router();
const checkInService = new CheckInService(prisma);

// Validation schemas
const createCheckInSchema = z.object({
  employerId: z.string().uuid(),
  eventType: z.nativeEnum(CheckInEventType),
  voiceGreeting: z.boolean().optional(),
  notes: z.string().optional(),
});

const getCheckInsQuerySchema = z.object({
  employerId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const todayCheckInsQuerySchema = z.object({
  employerId: z.string().uuid(),
});

/**
 * POST /api/v1/check-ins
 * Create a new check-in event
 */
router.post(
  '/',
  verifyAuth,
  validateBody(createCheckInSchema),
  asyncHandler(async (req, res) => {
    const { employerId, eventType, voiceGreeting, notes } = req.body;

    // Get client IP address
    const ipAddress =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress;

    const result = await checkInService.createCheckIn(
      { employerId, eventType, voiceGreeting, notes },
      ipAddress
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/v1/check-ins
 * Get check-ins for date range
 */
router.get(
  '/',
  verifyAuth,
  validateQuery(getCheckInsQuerySchema),
  asyncHandler(async (req, res) => {
    const { employerId, startDate, endDate } = req.query as {
      employerId?: string;
      startDate?: string;
      endDate?: string;
    };

    const checkIns = await checkInService.getCheckIns(
      employerId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.json({
      success: true,
      data: { checkIns },
    });
  })
);

/**
 * GET /api/v1/check-ins/today
 * Get today's check-ins and current state for an employer
 */
router.get(
  '/today',
  verifyAuth,
  validateQuery(todayCheckInsQuerySchema),
  asyncHandler(async (req, res) => {
    const { employerId } = req.query as { employerId: string };

    const result = await checkInService.getTodayCheckInsWithState(employerId);

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/v1/check-ins/today-summaries
 * Get today's summaries for all employees
 */
router.get(
  '/today-summaries',
  verifyAuth,
  asyncHandler(async (req, res) => {
    const { toLocalDateString, getTodayInTimezone, PARAGUAY_TIMEZONE } = await import('@inploy/shared');
    const today = getTodayInTimezone(PARAGUAY_TIMEZONE);
    const dateString = toLocalDateString(today, PARAGUAY_TIMEZONE);

    const summaries = await prisma.dailyWorkSummary.findMany({
      where: {
        date: new Date(dateString),
      },
      include: {
        employer: {
          include: {
            salaryConfig: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: { summaries },
    });
  })
);

/**
 * GET /api/v1/check-ins/employer/:employerId/summary
 * Get monthly summary for an employer
 */
router.get(
  '/employer/:employerId/summary',
  verifyAuth,
  requireSelfOrAdmin,
  validateParams(z.object({ employerId: z.string().uuid() })),
  validateQuery(
    z.object({
      month: z.string().optional(),
      year: z.string().optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    const { employerId } = req.params;
    const { month, year } = req.query as { month?: string; year?: string };

    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    // Get first and last day of month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // Get all check-ins for the month
    const checkIns = await checkInService.getCheckIns(
      employerId,
      startDate,
      endDate
    );

    // Get daily summaries
    const dailySummaries = await prisma.dailyWorkSummary.findMany({
      where: {
        employerId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate totals
    const totals = dailySummaries.reduce(
      (acc, summary) => ({
        totalHoursWorked:
          acc.totalHoursWorked + Number(summary.totalHoursWorked),
        lunchHours: acc.lunchHours + Number(summary.lunchHours),
        hoursGained: acc.hoursGained + Number(summary.hoursGained),
        hoursLost: acc.hoursLost + Number(summary.hoursLost),
        expectedHours: acc.expectedHours + Number(summary.expectedHours),
        lateMinutes: acc.lateMinutes + (summary.lateMinutes || 0),
        penaltyMinutes: acc.penaltyMinutes + (summary.penaltyMinutes || 0),
        latenessDeduction: acc.latenessDeduction + Number(summary.latenessDeduction || 0),
      }),
      {
        totalHoursWorked: 0,
        lunchHours: 0,
        hoursGained: 0,
        hoursLost: 0,
        expectedHours: 0,
        lateMinutes: 0,
        penaltyMinutes: 0,
        latenessDeduction: 0,
      }
    );

    res.json({
      success: true,
      data: {
        employerId,
        ...totals,
        dailySummaries,
      },
    });
  })
);

export default router;
