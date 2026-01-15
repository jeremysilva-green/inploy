"use strict";
/**
 * Check-in event types and state management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerState = exports.CheckInEventType = void 0;
var CheckInEventType;
(function (CheckInEventType) {
    CheckInEventType["ENTRADA"] = "ENTRADA";
    CheckInEventType["SALIDA"] = "SALIDA";
    CheckInEventType["ALMUERZO"] = "ALMUERZO";
    CheckInEventType["RETURN"] = "RETURN";
})(CheckInEventType || (exports.CheckInEventType = CheckInEventType = {}));
var EmployerState;
(function (EmployerState) {
    EmployerState["CHECKED_OUT"] = "CHECKED_OUT";
    EmployerState["CHECKED_IN"] = "CHECKED_IN";
    EmployerState["ON_LUNCH"] = "ON_LUNCH";
})(EmployerState || (exports.EmployerState = EmployerState = {}));
//# sourceMappingURL=checkin.js.map