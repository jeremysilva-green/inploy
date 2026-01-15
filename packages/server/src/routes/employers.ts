/**
 * Employers API routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { SalaryType } from '@inploy/shared';
import { prisma } from '../config/database';
import { verifyAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateQuery, validateParams, schemas } from '../middleware/validation';

const router = Router();

// Validation schemas
const createEmployerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional().default(''),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  employeeNumber: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  baselineHoursPerWeek: z.number().positive().default(40),
  salaryConfig: z.object({
    salaryType: z.nativeEnum(SalaryType),
    baseSalaryPYG: z.number().positive(),
    hourlyRatePYG: z.number().positive().optional(),
    deductionFormula: z
      .object({
        type: z.enum(['percentage', 'fixed', 'tiered']),
        value: z.union([z.number(), z.record(z.number())]),
      })
      .optional(),
    exchangeRate: z.number().positive().optional(),
  }),
});

const updateEmployerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  employeeNumber: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  baselineHoursPerWeek: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  salaryConfig: z
    .object({
      salaryType: z.nativeEnum(SalaryType).optional(),
      baseSalaryPYG: z.number().positive().optional(),
      hourlyRatePYG: z.number().positive().optional(),
      deductionFormula: z
        .object({
          type: z.enum(['percentage', 'fixed', 'tiered']),
          value: z.union([z.number(), z.record(z.number())]),
        })
        .optional(),
      exchangeRate: z.number().positive().optional(),
    })
    .optional(),
});

const updateGlobalFormulaSchema = z.object({
  scheduledStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  scheduledLunchStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  scheduledLunchEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  latenessToleranceMinutes: z.number().min(0).max(120).optional(),
  lunchReturnToleranceMinutes: z.number().min(0).max(120).optional(),
  expectedHoursPerDay: z.number().positive().max(24).optional(),
  expectedDaysPerMonth: z.number().positive().max(31).optional(),
});

const getEmployersQuerySchema = z.object({
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val, 10), 100) : 50)),
  search: z.string().optional(),
});

/**
 * GET /api/v1/employers
 * List all employers with pagination
 */
router.get(
  '/',
  verifyAuth,
  validateQuery(getEmployersQuerySchema),
  asyncHandler(async (req, res) => {
    const { isActive, page, limit, search } = req.query as {
      isActive?: boolean;
      page: number;
      limit: number;
      search?: string;
    };

    const where: any = {};

    // By default, only show active employees
    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [employers, total] = await Promise.all([
      prisma.employer.findMany({
        where,
        include: {
          salaryConfig: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.employer.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: employers,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * PUT /api/v1/employers/formula/global
 * Update global formula configuration for all employees (Admin only)
 * NOTE: This must be BEFORE /:id route to avoid "formula" being interpreted as an ID
 */
router.put(
  '/formula/global',
  verifyAuth,
  requireAdmin,
  validateBody(updateGlobalFormulaSchema),
  asyncHandler(async (req, res) => {
    const updateData = req.body;

    // Update all salary configs with the new global settings
    await prisma.salaryConfig.updateMany({
      data: updateData,
    });

    res.json({
      success: true,
      data: { message: 'Global formula configuration updated successfully' },
    });
  })
);

/**
 * GET /api/v1/employers/:id
 * Get single employer with details
 */
router.get(
  '/:id',
  verifyAuth,
  validateParams(schemas.uuid),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employer = await prisma.employer.findUnique({
      where: { id },
      include: {
        salaryConfig: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
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

    res.json({
      success: true,
      data: { employer },
    });
  })
);

/**
 * POST /api/v1/employers
 * Create new employer (Admin only)
 */
router.post(
  '/',
  verifyAuth,
  requireAdmin,
  validateBody(createEmployerSchema),
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      employeeNumber,
      position,
      department,
      baselineHoursPerWeek,
      salaryConfig,
    } = req.body;

    const employer = await prisma.employer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        employeeNumber,
        position,
        department,
        baselineHoursPerWeek,
        salaryConfig: {
          create: {
            salaryType: salaryConfig.salaryType,
            baseSalaryPYG: salaryConfig.baseSalaryPYG,
            hourlyRatePYG: salaryConfig.hourlyRatePYG,
            deductionFormula: salaryConfig.deductionFormula || {
              type: 'fixed',
              value: 0,
            },
            exchangeRate: salaryConfig.exchangeRate || 7300,
          },
        },
      },
      include: {
        salaryConfig: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { employer },
    });
  })
);

/**
 * PUT /api/v1/employers/:id
 * Update employer (Admin only)
 */
router.put(
  '/:id',
  verifyAuth,
  requireAdmin,
  validateParams(schemas.uuid),
  validateBody(updateEmployerSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { salaryConfig, ...employerData } = req.body;

    // Update employer
    const employer = await prisma.employer.update({
      where: { id },
      data: {
        ...employerData,
        ...(salaryConfig && {
          salaryConfig: {
            update: salaryConfig,
          },
        }),
      },
      include: {
        salaryConfig: true,
      },
    });

    res.json({
      success: true,
      data: { employer },
    });
  })
);

/**
 * DELETE /api/v1/employers/:id
 * Soft delete employer (Admin only)
 */
router.delete(
  '/:id',
  verifyAuth,
  requireAdmin,
  validateParams(schemas.uuid),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.employer.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      data: { message: 'Employer deactivated successfully' },
    });
  })
);

export default router;
