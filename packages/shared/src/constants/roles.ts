/**
 * User roles and permissions
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYER = 'EMPLOYER',
}

export const ROLE_PERMISSIONS = {
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
} as const;

export const hasPermission = (
  role: UserRole,
  permission: string
): boolean => {
  const permissions = ROLE_PERMISSIONS[role] as readonly string[];
  return permissions?.includes(permission) ?? false;
};
