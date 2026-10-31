import type { Tenant, TenantStatus } from "@prisma/client";

const BLOCKED_TENANT_STATUSES: TenantStatus[] = ["SUSPENDED", "CANCELLED"];

/**
 * A workspace is usable only while it exists (not soft-deleted) and has not
 * been suspended or cancelled. `TRIAL` and `ACTIVE` are both allowed.
 */
export function isTenantActive(
  tenant: Pick<Tenant, "status" | "deletedAt"> | null | undefined,
): boolean {
  if (!tenant || tenant.deletedAt) return false;
  return !BLOCKED_TENANT_STATUSES.includes(tenant.status);
}
