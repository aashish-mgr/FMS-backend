// Scaffold only — there was no audit logging in the Sequelize source to
// convert (no audit_logs model/table existed). The SRS (Section 14) expects
// every mutating action to write an audit_logs row: { userId, action,
// entityType, entityId, oldValues, newValues, ipAddress, createdAt }.
//
// Suggested next step: add an AuditLog model to prisma/schema.prisma, then
// call `auditService.log(...)` from income.service.ts (and any future
// module's service) after each create/update/delete.

interface AuditLogInput {
  userId?: string | null;
  action: string; // e.g. "INCOME_CREATED"
  entityType: string; // e.g. "income"
  entityId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
}

class AuditService {
  async log(_input: AuditLogInput) {
    // TODO: implement once an AuditLog model exists in prisma/schema.prisma.
    return;
  }
}

export default new AuditService();
