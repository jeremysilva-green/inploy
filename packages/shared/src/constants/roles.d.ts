/**
 * User roles and permissions
 */
export declare enum UserRole {
    ADMIN = "ADMIN",
    EMPLOYER = "EMPLOYER"
}
export declare const ROLE_PERMISSIONS: {
    readonly ADMIN: readonly ["employers:read", "employers:create", "employers:update", "employers:delete", "check-ins:read", "check-ins:create", "metrics:read", "days-off:read", "days-off:create", "days-off:delete", "exchange-rate:read", "exchange-rate:update"];
    readonly EMPLOYER: readonly ["check-ins:create:own", "check-ins:read:own", "employers:read:own"];
};
export declare const hasPermission: (role: UserRole, permission: string) => boolean;
