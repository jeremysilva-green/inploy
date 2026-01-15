/**
 * Validation utility functions
 */

import { CheckInEventType, EmployerState } from '../types/checkin';

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic validation)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate state transition
 */
export const isValidStateTransition = (
  currentState: EmployerState,
  eventType: CheckInEventType
): boolean => {
  const validTransitions: Record<EmployerState, CheckInEventType[]> = {
    [EmployerState.CHECKED_OUT]: [CheckInEventType.ENTRADA],
    [EmployerState.CHECKED_IN]: [
      CheckInEventType.SALIDA,
      CheckInEventType.ALMUERZO,
    ],
    [EmployerState.ON_LUNCH]: [CheckInEventType.RETURN],
  };

  return validTransitions[currentState]?.includes(eventType) ?? false;
};

/**
 * Get error message for invalid state transition
 */
export const getStateTransitionError = (
  currentState: EmployerState,
  eventType: CheckInEventType
): string => {
  const errors: Record<EmployerState, Record<CheckInEventType, string>> = {
    [EmployerState.CHECKED_OUT]: {
      [CheckInEventType.ENTRADA]: '',
      [CheckInEventType.SALIDA]: 'Cannot check out when already checked out',
      [CheckInEventType.ALMUERZO]: 'Must check in first before taking lunch',
      [CheckInEventType.RETURN]: 'Cannot return from lunch when not on lunch',
    },
    [EmployerState.CHECKED_IN]: {
      [CheckInEventType.ENTRADA]: 'Already checked in',
      [CheckInEventType.SALIDA]: '',
      [CheckInEventType.ALMUERZO]: '',
      [CheckInEventType.RETURN]: 'Cannot return from lunch when not on lunch',
    },
    [EmployerState.ON_LUNCH]: {
      [CheckInEventType.ENTRADA]: 'Cannot check in while on lunch',
      [CheckInEventType.SALIDA]:
        'Must return from lunch before checking out',
      [CheckInEventType.ALMUERZO]: 'Already on lunch break',
      [CheckInEventType.RETURN]: '',
    },
  };

  return errors[currentState]?.[eventType] || 'Invalid state transition';
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value > 0 && !isNaN(value);
};

/**
 * Validate non-negative number
 */
export const isNonNegativeNumber = (value: number): boolean => {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
