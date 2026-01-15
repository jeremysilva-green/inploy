/**
 * API Client for InPloy backend
 */

import {
  ApiResponse,
  CreateCheckInInput,
  CheckInResponse,
  TodayCheckInsResponse,
  GetEmployersResponse,
  Employer,
} from '@inploy/shared';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE = `${API_URL}/api/v1`;

/**
 * API Client class
 */
class ApiClient {
  private authToken: string | null = null;

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Get default headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed');
      }

      return data.data as T;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ========== Employers ==========

  /**
   * Get all employers
   */
  async getEmployers(params?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<GetEmployersResponse> {
    const queryParams = new URLSearchParams();

    if (params?.isActive !== undefined) {
      queryParams.append('isActive', String(params.isActive));
    }
    if (params?.page) {
      queryParams.append('page', String(params.page));
    }
    if (params?.limit) {
      queryParams.append('limit', String(params.limit));
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const query = queryParams.toString();
    return this.fetch<GetEmployersResponse>(
      `/employers${query ? `?${query}` : ''}`
    );
  }

  /**
   * Get single employer by ID
   */
  async getEmployer(id: string): Promise<{ employer: Employer }> {
    return this.fetch<{ employer: Employer }>(`/employers/${id}`);
  }

  /**
   * Create a new employer
   */
  async createEmployer(data: {
    firstName: string;
    lastName: string;
    email: string;
    position?: string;
    salaryConfig: {
      salaryType: string;
      baseSalaryPYG: number;
      expectedHoursPerDay: number;
      expectedDaysPerMonth: number;
    };
  }): Promise<{ employer: Employer }> {
    return this.fetch<{ employer: Employer }>('/employers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an employer
   */
  async updateEmployer(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      position?: string;
      salaryConfig?: {
        salaryType?: string;
        baseSalaryPYG?: number;
        expectedHoursPerDay?: number;
        expectedDaysPerMonth?: number;
      };
    }
  ): Promise<{ employer: Employer }> {
    return this.fetch<{ employer: Employer }>(`/employers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete an employer (soft delete)
   */
  async deleteEmployer(id: string): Promise<any> {
    const response = await this.fetch(`/employers/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  /**
   * Update global formula configuration for all employees
   */
  async updateGlobalFormula(data: {
    scheduledStartTime?: string;
    scheduledLunchStart?: string;
    scheduledLunchEnd?: string;
    latenessToleranceMinutes?: number;
    lunchReturnToleranceMinutes?: number;
    expectedHoursPerDay?: number;
    expectedDaysPerMonth?: number;
  }): Promise<{ message: string }> {
    return this.fetch<{ message: string }>('/employers/formula/global', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ========== Check-ins ==========

  /**
   * Create a new check-in event
   */
  async createCheckIn(input: CreateCheckInInput): Promise<CheckInResponse> {
    return this.fetch<CheckInResponse>('/check-ins', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  /**
   * Get today's check-ins and current state for an employer
   */
  async getTodayCheckIns(employerId: string): Promise<TodayCheckInsResponse> {
    return this.fetch<TodayCheckInsResponse>(
      `/check-ins/today?employerId=${employerId}`
    );
  }

  /**
   * Get today's summaries for all employees
   */
  async getTodaySummaries(): Promise<{ summaries: any[] }> {
    return this.fetch<{ summaries: any[] }>('/check-ins/today-summaries');
  }

  /**
   * Get check-ins for date range
   */
  async getCheckIns(params: {
    employerId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();

    if (params.employerId) {
      queryParams.append('employerId', params.employerId);
    }
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    const query = queryParams.toString();
    return this.fetch(`/check-ins${query ? `?${query}` : ''}`);
  }

  // ========== Metrics ==========

  /**
   * Get global metrics across all employers
   */
  async getGlobalMetrics(params?: {
    startDate?: string;
    endDate?: string;
    currency?: string;
  }) {
    const queryParams = new URLSearchParams();

    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    if (params?.currency) {
      queryParams.append('currency', params.currency);
    }

    const query = queryParams.toString();
    return this.fetch(`/metrics/global${query ? `?${query}` : ''}`);
  }

  /**
   * Get metrics for a specific employer
   */
  async getEmployerMetrics(
    employerId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      currency?: string;
    }
  ) {
    const queryParams = new URLSearchParams();

    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    if (params?.currency) {
      queryParams.append('currency', params.currency);
    }

    const query = queryParams.toString();
    return this.fetch(
      `/metrics/employer/${employerId}${query ? `?${query}` : ''}`
    );
  }

  // ========== Days Off ==========

  /**
   * Get days off
   */
  async getDaysOff(params: {
    employerId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();

    if (params.employerId) {
      queryParams.append('employerId', params.employerId);
    }
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    const query = queryParams.toString();
    return this.fetch(`/days-off${query ? `?${query}` : ''}`);
  }

  /**
   * Create a day off
   */
  async createDayOff(data: {
    employerId: string;
    date: string;
    type: string;
    isPaid: boolean;
    reason?: string;
    deductionAmount?: number;
  }) {
    return this.fetch('/days-off', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a day off
   */
  async updateDayOff(id: string, data: {
    employerId?: string;
    date?: string;
    type?: string;
    isPaid?: boolean;
    reason?: string;
  }) {
    return this.fetch(`/days-off/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDayOff(id: string) {
    return this.fetch(`/days-off/${id}`, {
      method: 'DELETE',
    });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
