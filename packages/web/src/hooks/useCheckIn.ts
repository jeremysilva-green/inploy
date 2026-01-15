/**
 * React Query hooks for check-ins
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateCheckInInput, CheckInEventType } from '@inploy/shared';
import { apiClient } from '../services/api';
import { ttsService } from '../services/tts';

/**
 * Hook to get today's check-ins and current state
 */
export const useTodayCheckIns = (employerId: string) => {
  return useQuery({
    queryKey: ['check-ins', 'today', employerId],
    queryFn: () => apiClient.getTodayCheckIns(employerId),
    enabled: !!employerId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to create a check-in with optimistic updates
 */
export const useCreateCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCheckInInput & { employerName?: string }) => {
      const { employerName, ...checkInInput } = input;

      // Play voice greeting for ENTRADA events
      if (
        input.eventType === CheckInEventType.ENTRADA &&
        input.voiceGreeting &&
        employerName
      ) {
        // Play greeting asynchronously (don't wait)
        ttsService.welcomeEmployer(employerName).catch((err) => {
          console.error('Voice greeting failed:', err);
        });
      }

      return apiClient.createCheckIn(checkInInput);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch today's check-ins
      queryClient.invalidateQueries({
        queryKey: ['check-ins', 'today', variables.employerId],
      });

      // Invalidate employers list to update any aggregated data
      queryClient.invalidateQueries({
        queryKey: ['employers'],
      });
    },
    onError: (error) => {
      console.error('Check-in failed:', error);
    },
  });
};

/**
 * Hook to get check-ins for date range
 */
export const useCheckIns = (params: {
  employerId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['check-ins', params],
    queryFn: () => apiClient.getCheckIns(params),
    enabled: !!(params.employerId || (params.startDate && params.endDate)),
  });
};
