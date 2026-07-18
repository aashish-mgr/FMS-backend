// Scaffold only — there was no audit logging in the Sequelize source to
// convert (no audit_logs model/table existed). The SRS (Section 14) expects
// every mutating action to write an audit_logs row: { userId, action,
// entityType, entityId, oldValues, newValues, ipAddress, createdAt }.
//
// Suggested next step: add an AuditLog model to prisma/schema.prisma, then
// call `auditService.log(...)` from income.service.ts (and any future
// module's service) after each create/update/delete.

import { prisma } from "../config/database";

interface AuditLogInput {
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
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        oldValues: input.oldValues ? JSON.parse(JSON.stringify(input.oldValues)) : null,
        newValues: input.newValues ? JSON.parse(JSON.stringify(input.newValues)) : null,

      }
     })
    return;
  }



