import { prisma } from "../config/database";

interface AuditLogInput {
  tenantId?: string | null;
  userId?: string | null;
  action: string; // e.g. "INCOME_CREATED"
  entityType: string; // e.g. "income"
  entityId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
}

export async function writeLog(input: AuditLogInput) {
  await prisma.auditLogs.create({
    data: {
      tenantId: input.tenantId ?? null,
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      oldValues: input.oldValues ? JSON.parse(JSON.stringify(input.oldValues)) : null,
      newValues: input.newValues ? JSON.parse(JSON.stringify(input.newValues)) : null,
    },
  });
  return;
}
