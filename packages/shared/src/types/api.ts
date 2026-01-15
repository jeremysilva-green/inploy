/**
 * API request/response types
 */

import { Employer } from './employer';
import { CheckIn, MonthlyCheckInSummary } from './checkin';
import { DayOff } from './salary';

export type { EmployerWithMetrics } from './employer';

// Common API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, any>;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Employer endpoints
export interface GetEmployersQuery {
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetEmployersResponse extends PaginatedResponse<Employer> {}

// Check-in endpoints
export interface GetCheckInsQuery {
  employerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetCheckInsResponse {
  checkIns: CheckIn[];
}

// Metrics endpoints
export interface GetGlobalMetricsQuery {
  startDate?: string;
  endDate?: string;
  currency?: 'PYG' | 'USD';
}

export interface GlobalMetrics {
  totalHoursWorked: number;
  totalLunchHours: number;
  totalHoursGained: number;
  totalHoursLost: number;
  totalSalaryDeductions: number;
  currency: 'PYG' | 'USD';
  employerMetrics: EmployerMetricsSummary[];
}

export interface EmployerMetricsSummary {
  employerId: string;
  employerName: string;
  hoursWorked: number;
  hoursGained: number;
  hoursLost: number;
  salaryDeduction: number;
}

export interface GetEmployerMetricsQuery {
  startDate?: string;
  endDate?: string;
  currency?: 'PYG' | 'USD';
}

export interface EmployerMetrics {
  employerId: string;
  hoursWorked: number;
  lunchHours: number;
  hoursGained: number;
  hoursLost: number;
  salaryDeduction: number;
  expectedSalary: number;
  actualSalary: number;
  attendanceRate: number;
  currency: 'PYG' | 'USD';
  dailyBreakdown: MonthlyCheckInSummary['dailySummaries'];
}

// Days off endpoints
export interface GetDaysOffQuery {
  employerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetDaysOffResponse {
  daysOff: DayOff[];
}

// Exchange rate endpoints
export interface ExchangeRateResponse {
  rate: number;
  updatedAt: Date;
}

export interface UpdateExchangeRateInput {
  rate: number;
}

// SSE event types
export interface SSEEvent {
  type: 'checkin-created' | 'employer-updated' | 'daily-summary-updated';
  data: any;
  timestamp: Date;
}
