"use strict";
/**
 * User roles and permissions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.ROLE_PERMISSIONS = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["EMPLOYER"] = "EMPLOYER";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.ROLE_PERMISSIONS = {
    [UserRole.ADMIN]: [
        'employers:read',
        'employers:create',
        'employers:update',
        'employers:delete',
        'check-ins:read',
        'check-ins:create',
        'metrics:read',
        'days-off:read',
        'days-off:create',
        'days-off:delete',
        'exchange-rate:read',
        'exchange-rate:update',
    ],
    [UserRole.EMPLOYER]: [
        'check-ins:create:own',
        'check-ins:read:own',
        'employers:read:own',
    ],
};
const hasPermission = (role, permission) => {
    const permissions = exports.ROLE_PERMISSIONS[role];
    return permissions?.includes(permission) ?? false;
};
exports.hasPermission = hasPermission;
//# sourceMappingURL=roles.js.map