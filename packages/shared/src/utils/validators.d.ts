/**
 * Validation utility functions
 */
import { CheckInEventType, EmployerState } from '../types/checkin';
/**
 * Validate email format
 */
export declare const isValidEmail: (email: string) => boolean;
/**
 * Validate phone number (basic validation)
 */
export declare const isValidPhone: (phone: string) => boolean;
/**
 * Validate state transition
 */
export declare const isValidStateTransition: (currentState: EmployerState, eventType: CheckInEventType) => boolean;
/**
 * Get error message for invalid state transition
 */
export declare const getStateTransitionError: (currentState: EmployerState, eventType: CheckInEventType) => string;
/**
 * Validate positive number
 */
export declare const isPositiveNumber: (value: number) => boolean;
/**
 * Validate non-negative number
 */
export declare const isNonNegativeNumber: (value: number) => boolean;
/**
 * Validate UUID format
 */
export declare const isValidUUID: (uuid: string) => boolean;
