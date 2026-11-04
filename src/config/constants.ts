// App-wide constants. Pulled out of prisma/seed.ts / individual modules so
// they have one home, per the folder structure's config/constants.ts.

export const ROLES = ["admin", "superAdmin", "accountant"] as const;

// Roles that can be assigned through workspace membership. `superAdmin` is a
// platform-level role and must never be granted by a workspace admin.
export const ASSIGNABLE_ROLES = ["admin", "accountant"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const INVITATION_EXPIRES_IN_DAYS = 7;
export const INVITATION_EXPIRES_IN_MS =
  INVITATION_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;

// Keep expired invitations visible for a while so admins can resend them
// instead of having to recreate the invitation from scratch.
export const INVITATION_EXPIRED_RETENTION_DAYS = 30;
export const INVITATION_EXPIRED_RETENTION_MS =
  INVITATION_EXPIRED_RETENTION_DAYS * 24 * 60 * 60 * 1000;

// The migration creates this workspace to own all pre-existing single-tenant
// data. Keeping the values in one place lets the seed and onboarding code
// agree on the same default.
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_TENANT_SLUG = "default";
export const DEFAULT_TENANT_NAME = "Default Workspace";

// New workspaces and the backfilled default workspace start with these
// settings. Kept here so seed and onboarding cannot drift apart.
export const DEFAULT_WORKSPACE_SETTINGS = {
  currency: "NPR",
  timezone: "Asia/Kathmandu",
};

export const ACCESS_TOKEN_EXPIRES_IN = "15m";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";
export const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;


