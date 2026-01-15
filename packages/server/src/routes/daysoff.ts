/**
 * Days Off API routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { DayOffType } from '@inploy/shared';
import { prisma } from '../config/database';
import { verifyAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateQuery, validateParams, schemas } from '../middleware/validation';
import { salaryCalculator } from '../domain/calculators/SalaryCalculator';

const router = Router();

// Validation schemas
const createDayOffSchema = z.object({
  employerId: z.string().uuid(),
  date: z.string(),
  type: z.nativeEnum(DayOffType),
  isPaid: z.boolean().default(false),
  reason: z.string().optional(),
  deductionAmount: z.number().positive().optional(),
});

const updateDayOffSchema = z.object({
  employerId: z.string().uuid().optional(),
  date: z.string().optional(),
  type: z.nativeEnum(DayOffType).optional(),
  isPaid: z.boolean().optional(),
  reason: z.string().optional(),
  deductionAmount: z.number().positive().optional(),
});

const getDaysOffQuerySchema = z.object({
  employerId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * GET /api/v1/days-off
 * Get days off for date range
 */
router.get(
  '/',
  verifyAuth,
  requireAdmin,
  validateQuery(getDaysOffQuerySchema),
  asyncHandler(async (req, res) => {
    const { employerId, startDate, endDate } = req.query as {
      employerId?: string;
      startDate?: string;
      endDate?: string;
    };

    const where: any = {};

    if (employerId) {
      where.employerId = employerId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const daysOff = await prisma.dayOff.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json({
      success: true,
      data: { daysOff },
    });
  })
);

/**
 * POST /api/v1/days-off
 * Create a new day off record
 */
router.post(
  '/',
  verifyAuth,
  requireAdmin,
  validateBody(createDayOffSchema),
  asyncHandler(async (req, res) => {
    const { employerId, date, type, isPaid, reason, deductionAmount } = req.body;

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

    // Calculate deduction if not provided and not paid
    let finalDeductionAmount = deductionAmount;

    if (!isPaid && !deductionAmount && employer.salaryConfig) {
      finalDeductionAmount = salaryCalculator.calculateDayOffDeduction(
        employer.salaryConfig as any,
        isPaid
      );
    }

    // Create day off record
    const dayOff = await prisma.dayOff.create({
      data: {
        employerId,
        date: new Date(date),
        type,
        isPaid,
        reason,
        deductionAmount: finalDeductionAmount,
        approvedBy: 'admin', // TODO: Get from authenticated user
        approvedAt: new Date(),
      },
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { dayOff },
    });
  })
);

/**
 * PUT /api/v1/days-off/:id
 * Update a day off record
 */
router.put(
  '/:id',
  verifyAuth,
  requireAdmin,
  validateParams(schemas.uuid),
  validateBody(updateDayOffSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // If isPaid is being changed or other fields that affect deduction
    if ('isPaid' in updateData || 'employerId' in updateData) {
      const dayOff = await prisma.dayOff.findUnique({
        where: { id },
        include: { employer: { include: { salaryConfig: true } } },
      });

      if (!dayOff) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Day off not found',
            code: 'NOT_FOUND',
            statusCode: 404,
          },
        });
      }

      const isPaid = 'isPaid' in updateData ? updateData.isPaid : dayOff.isPaid;

      // Recalculate deduction if needed
      if (!isPaid && !updateData.deductionAmount && dayOff.employer.salaryConfig) {
        updateData.deductionAmount = salaryCalculator.calculateDayOffDeduction(
          dayOff.employer.salaryConfig as any,
          isPaid
        );
      } else if (isPaid) {
        updateData.deductionAmount = null;
      }
    }

    // Convert date string to Date if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const updatedDayOff = await prisma.dayOff.update({
      where: { id },
      data: updateData,
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: { dayOff: updatedDayOff },
    });
  })
);

/**
 * DELETE /api/v1/days-off/:id
 * Delete a day off record
 */
router.delete(
  '/:id',
  verifyAuth,
  requireAdmin,
  validateParams(schemas.uuid),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.dayOff.delete({
      where: { id },
    });

    res.json({
      success: true,
      data: { message: 'Day off deleted successfully' },
    });
  })
);

/**
 * GET /api/v1/days-off/employer/:employerId/summary
 * Get days off summary for an employer
 */
router.get(
  '/employer/:employerId/summary',
  verifyAuth,
  requireAdmin,
  validateParams(z.object({ employerId: z.string().uuid() })),
  validateQuery(
    z.object({
      year: z.string().optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    const { employerId } = req.params;
    const { year } = req.query as { year?: string };

    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);

    const daysOff = await prisma.dayOff.findMany({
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

    // Group by type
    const byType = daysOff.reduce((acc, day) => {
      if (!acc[day.type]) {
        acc[day.type] = {
          count: 0,
          paidCount: 0,
          unpaidCount: 0,
          totalDeduction: 0,
        };
      }

      acc[day.type].count++;
      if (day.isPaid) {
        acc[day.type].paidCount++;
      } else {
        acc[day.type].unpaidCount++;
        acc[day.type].totalDeduction += Number(day.deductionAmount || 0);
      }

      return acc;
    }, {} as Record<string, any>);

    const totalDays = daysOff.length;
    const totalPaid = daysOff.filter((d) => d.isPaid).length;
    const totalUnpaid = daysOff.filter((d) => !d.isPaid).length;
    const totalDeductions = daysOff.reduce(
      (sum, d) => sum + Number(d.deductionAmount || 0),
      0
    );

    res.json({
      success: true,
      data: {
        employerId,
        year: targetYear,
        totalDays,
        totalPaid,
        totalUnpaid,
        totalDeductions,
        byType,
        daysOff,
      },
    });
  })
);

export default router;
