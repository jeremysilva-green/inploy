"use strict";
/**
 * Validation utility functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUUID = exports.isNonNegativeNumber = exports.isPositiveNumber = exports.getStateTransitionError = exports.isValidStateTransition = exports.isValidPhone = exports.isValidEmail = void 0;
const checkin_1 = require("../types/checkin");
/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
/**
 * Validate phone number (basic validation)
 */
const isValidPhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
/**
 * Validate state transition
 */
const isValidStateTransition = (currentState, eventType) => {
    const validTransitions = {
        [checkin_1.EmployerState.CHECKED_OUT]: [checkin_1.CheckInEventType.ENTRADA],
        [checkin_1.EmployerState.CHECKED_IN]: [
            checkin_1.CheckInEventType.SALIDA,
            checkin_1.CheckInEventType.ALMUERZO,
        ],
        [checkin_1.EmployerState.ON_LUNCH]: [checkin_1.CheckInEventType.RETURN],
    };
    return validTransitions[currentState]?.includes(eventType) ?? false;
};
exports.isValidStateTransition = isValidStateTransition;
/**
 * Get error message for invalid state transition
 */
const getStateTransitionError = (currentState, eventType) => {
    const errors = {
        [checkin_1.EmployerState.CHECKED_OUT]: {
            [checkin_1.CheckInEventType.ENTRADA]: '',
            [checkin_1.CheckInEventType.SALIDA]: 'Cannot check out when already checked out',
            [checkin_1.CheckInEventType.ALMUERZO]: 'Must check in first before taking lunch',
            [checkin_1.CheckInEventType.RETURN]: 'Cannot return from lunch when not on lunch',
        },
        [checkin_1.EmployerState.CHECKED_IN]: {
            [checkin_1.CheckInEventType.ENTRADA]: 'Already checked in',
            [checkin_1.CheckInEventType.SALIDA]: '',
            [checkin_1.CheckInEventType.ALMUERZO]: '',
            [checkin_1.CheckInEventType.RETURN]: 'Cannot return from lunch when not on lunch',
        },
        [checkin_1.EmployerState.ON_LUNCH]: {
            [checkin_1.CheckInEventType.ENTRADA]: 'Cannot check in while on lunch',
            [checkin_1.CheckInEventType.SALIDA]: 'Must return from lunch before checking out',
            [checkin_1.CheckInEventType.ALMUERZO]: 'Already on lunch break',
            [checkin_1.CheckInEventType.RETURN]: '',
        },
    };
    return errors[currentState]?.[eventType] || 'Invalid state transition';
};
exports.getStateTransitionError = getStateTransitionError;
/**
 * Validate positive number
 */
const isPositiveNumber = (value) => {
    return typeof value === 'number' && value > 0 && !isNaN(value);
};
exports.isPositiveNumber = isPositiveNumber;
/**
 * Validate non-negative number
 */
const isNonNegativeNumber = (value) => {
    return typeof value === 'number' && value >= 0 && !isNaN(value);
};
exports.isNonNegativeNumber = isNonNegativeNumber;
/**
 * Validate UUID format
 */
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
exports.isValidUUID = isValidUUID;
//# sourceMappingURL=validators.js.map