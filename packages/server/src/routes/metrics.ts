/**
 * Metrics API routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { Currency } from '@inploy/shared';
import { prisma } from '../config/database';
import { verifyAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';
import { asyncHandler } from '../middleware/errorHandler';
import { validateQuery } from '../middleware/validation';
import { salaryCalculator } from '../domain/calculators/SalaryCalculator';

const router = Router();

// Validation schemas
const metricsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  currency: z.nativeEnum(Currency).optional().default(Currency.PYG),
});

/**
 * GET /api/v1/metrics/global
 * Get global metrics across all employers
 */
router.get(
  '/global',
  verifyAuth,
  requireAdmin,
  validateQuery(metricsQuerySchema),
  asyncHandler(async (req, res) => {
    const { startDate, endDate, currency } = req.query as {
      startDate?: string;
      endDate?: string;
      currency: Currency;
    };

    const where: any = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get all daily summaries
    const summaries = await prisma.dailyWorkSummary.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            salaryConfig: true,
          },
        },
      },
    });

    // Calculate global totals
    const totals = summaries.reduce(
      (acc, summary) => ({
        totalHoursWorked: acc.totalHoursWorked + Number(summary.totalHoursWorked),
        totalLunchHours: acc.totalLunchHours + Number(summary.lunchHours),
        totalHoursGained: acc.totalHoursGained + Number(summary.hoursGained),
        totalHoursLost: acc.totalHoursLost + Number(summary.hoursLost),
        totalSalaryDeductions: acc.totalSalaryDeductions + Number(summary.salaryDeduction || 0),
      }),
      {
        totalHoursWorked: 0,
        totalLunchHours: 0,
        totalHoursGained: 0,
        totalHoursLost: 0,
        totalSalaryDeductions: 0,
      }
    );

    // Group by employer for per-employer metrics
    const employerMetrics = summaries.reduce((acc, summary) => {
      const employerId = summary.employerId;
      if (!acc[employerId]) {
        acc[employerId] = {
          employerId,
          employerName: `${summary.employer.firstName} ${summary.employer.lastName}`,
          hoursWorked: 0,
          hoursGained: 0,
          hoursLost: 0,
          salaryDeduction: 0,
        };
      }

      acc[employerId].hoursWorked += Number(summary.totalHoursWorked);
      acc[employerId].hoursGained += Number(summary.hoursGained);
      acc[employerId].hoursLost += Number(summary.hoursLost);
      acc[employerId].salaryDeduction += Number(summary.salaryDeduction || 0);

      return acc;
    }, {} as Record<string, any>);

    // Convert to USD if requested
    const exchangeRate = 7300; // TODO: Get from config or database
    let convertedTotals = totals;

    if (currency === Currency.USD) {
      convertedTotals = {
        ...totals,
        totalSalaryDeductions: totals.totalSalaryDeductions / exchangeRate,
      };

      Object.values(employerMetrics).forEach((metrics: any) => {
        metrics.salaryDeduction = metrics.salaryDeduction / exchangeRate;
      });
    }

    res.json({
      success: true,
      data: {
        ...convertedTotals,
        currency,
        employerMetrics: Object.values(employerMetrics),
      },
    });
  })
);

/**
 * GET /api/v1/metrics/employer/:employerId
 * Get detailed metrics for a single employer
 */
router.get(
  '/employer/:employerId',
  verifyAuth,
  requireAdmin,
  validateQuery(metricsQuerySchema),
  asyncHandler(async (req, res) => {
    const { employerId } = req.params;
    const { startDate, endDate, currency } = req.query as {
      startDate?: string;
      endDate?: string;
      currency: Currency;
    };

    const where: any = { employerId };
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get daily summaries
    const dailyBreakdown = await prisma.dailyWorkSummary.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    // Get employer with salary config
    const employer = await prisma.employer.findUnique({
      where: { id: employerId },
      include: { salaryConfig: true },
    });

    if (!employer) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Employer not found',
          code: 'NOT_FOUND',
          statusCode: 404,
        },
      });
    }

    // Calculate totals
    const totals = dailyBreakdown.reduce(
      (acc, day) => ({
        hoursWorked: acc.hoursWorked + Number(day.totalHoursWorked),
        lunchHours: acc.lunchHours + Number(day.lunchHours),
        hoursGained: acc.hoursGained + Number(day.hoursGained),
        hoursLost: acc.hoursLost + Number(day.hoursLost),
        expectedHours: acc.expectedHours + Number(day.expectedHours),
        salaryDeduction: acc.salaryDeduction + Number(day.salaryDeduction || 0),
      }),
      {
        hoursWorked: 0,
        lunchHours: 0,
        hoursGained: 0,
        hoursLost: 0,
        expectedHours: 0,
        salaryDeduction: 0,
      }
    );

    // Calculate expected and actual salary
    let expectedSalary = 0;
    let actualSalary = 0;

    if (employer.salaryConfig) {
      expectedSalary = Number(employer.salaryConfig.baseSalaryPYG);
      actualSalary = expectedSalary - totals.salaryDeduction;
    }

    // Calculate attendance rate
    const attendanceRate =
      totals.expectedHours > 0
        ? (totals.hoursWorked / totals.expectedHours) * 100
        : 0;

    // Convert to USD if requested
    const exchangeRate = Number(employer.salaryConfig?.exchangeRate || 7300);
    let convertedData = {
      ...totals,
      expectedSalary,
      actualSalary,
    };

    if (currency === Currency.USD) {
      convertedData = {
        ...totals,
        salaryDeduction: totals.salaryDeduction / exchangeRate,
        expectedSalary: expectedSalary / exchangeRate,
        actualSalary: actualSalary / exchangeRate,
      };
    }

    res.json({
      success: true,
      data: {
        employerId,
        ...convertedData,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        currency,
        dailyBreakdown,
      },
    });
  })
);

export default router;
