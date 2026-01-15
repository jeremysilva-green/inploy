/**
 * React Query hooks for metrics
 */

import { useQuery } from '@tanstack/react-query';
import { Currency } from '@inploy/shared';
import { apiClient } from '../services/api';
import { useCurrencyStore } from '../store/currencyStore';

/**
 * Hook to fetch global metrics
 */
export const useGlobalMetrics = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const currency = useCurrencyStore((state) => state.currency);

  return useQuery({
    queryKey: ['metrics', 'global', params, currency],
    queryFn: () =>
      apiClient.getGlobalMetrics({
        ...params,
        currency,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch employer-specific metrics
 */
export const useEmployerMetrics = (
  employerId: string,
  params?: {
    startDate?: string;
    endDate?: string;
  }
) => {
  const currency = useCurrencyStore((state) => state.currency);

  return useQuery({
    queryKey: ['metrics', 'employer', employerId, params, currency],
    queryFn: () =>
      apiClient.getEmployerMetrics(employerId, {
        ...params,
        currency,
      }),
    enabled: !!employerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
