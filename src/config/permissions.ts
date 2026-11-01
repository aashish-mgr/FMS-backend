// Central permission matrix for workspace RBAC.
//
// Roles remain global rows because they describe capabilities, not tenants.
// A user's effective permissions are the union of the permissions granted by
// every role attached to that user.

export const PERMISSIONS = {
  INCOME_READ: "income:read",
  INCOME_CREATE: "income:create",
  INCOME_UPDATE: "income:update",
  INCOME_DELETE: "income:delete",

  EXPENSE_READ: "expense:read",
  EXPENSE_CREATE: "expense:create",
  EXPENSE_UPDATE: "expense:update",
  EXPENSE_DELETE: "expense:delete",

  NOTE_READ: "note:read",
  NOTE_CREATE: "note:create",
  NOTE_UPDATE: "note:update",
  NOTE_DELETE: "note:delete",

  REMINDER_READ: "reminder:read",
  REMINDER_CREATE: "reminder:create",
  REMINDER_UPDATE: "reminder:update",
  REMINDER_DELETE: "reminder:delete",

  CATEGORY_READ: "category:read",
  DASHBOARD_READ: "dashboard:read",
  REPORT_READ: "report:read",
  AUDIT_READ: "audit:read",

  ATTACHMENT_CREATE: "attachment:create",
  ATTACHMENT_DELETE: "attachment:delete",

  WORKSPACE_READ: "workspace:read",
  WORKSPACE_UPDATE: "workspace:update",

  MEMBER_READ: "member:read",
  MEMBER_INVITE: "member:invite",
  MEMBER_UPDATE: "member:update",
  MEMBER_REMOVE: "member:remove",

  INVITATION_READ: "invitation:read",
  INVITATION_REVOKE: "invitation:revoke",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

const ACCOUNTANT_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.INCOME_READ,
  PERMISSIONS.INCOME_CREATE,
  PERMISSIONS.INCOME_UPDATE,
  PERMISSIONS.EXPENSE_READ,
  PERMISSIONS.EXPENSE_CREATE,
  PERMISSIONS.EXPENSE_UPDATE,
  PERMISSIONS.NOTE_READ,
  PERMISSIONS.NOTE_CREATE,
  PERMISSIONS.NOTE_UPDATE,
  PERMISSIONS.NOTE_DELETE,
  PERMISSIONS.REMINDER_READ,
  PERMISSIONS.REMINDER_CREATE,
  PERMISSIONS.REMINDER_UPDATE,
  PERMISSIONS.REMINDER_DELETE,
  PERMISSIONS.CATEGORY_READ,
  PERMISSIONS.DASHBOARD_READ,
  PERMISSIONS.REPORT_READ,
  PERMISSIONS.ATTACHMENT_CREATE,
  PERMISSIONS.ATTACHMENT_DELETE,
  PERMISSIONS.WORKSPACE_READ,
  PERMISSIONS.MEMBER_READ,
];

export const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  superAdmin: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS,
  accountant: ACCOUNTANT_PERMISSIONS,
};

export function hasPermission(
  roles: readonly string[],
  permission: Permission,
): boolean {
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission) ?? false);
}

export function hasEveryPermission(
  roles: readonly string[],
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(roles, permission));
}
