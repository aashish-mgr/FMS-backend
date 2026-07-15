// App-wide constants. Pulled out of prisma/seed.ts / individual modules so
// they have one home, per the folder structure's config/constants.ts.

export const ROLES = ["admin", "superAdmin", "accountant"] as const;

export const ACCESS_TOKEN_EXPIRES_IN = "15m";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";
export const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;


