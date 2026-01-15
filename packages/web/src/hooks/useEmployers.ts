/**
 * React Query hooks for employers
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

/**
 * Hook to fetch all employers
 */
export const useEmployers = (params?: {
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['employers', params],
    queryFn: () => apiClient.getEmployers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch active employers only
 */
export const useActiveEmployers = () => {
  return useEmployers({ isActive: true, limit: 100 });
};

/**
 * Hook to fetch single employer
 */
export const useEmployer = (id: string) => {
  return useQuery({
    queryKey: ['employer', id],
    queryFn: () => apiClient.getEmployer(id),
    enabled: !!id,
  });
};
