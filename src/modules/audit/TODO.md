# Audit module — not yet converted

Nothing existed for this in the Sequelize source — no `AuditLog` model was
ever defined. Scaffolded here per the SRS (Section 14), which specifies an
immutable `audit_logs` table:

```prisma
model AuditLog {
  id         String    @id @default(uuid()) @db.Uuid
  userId     String?   @map("user_id") @db.Uuid
  action     String    // e.g. "INCOME_CREATED", "USER_LOGIN"
  entityType String    @map("entity_type")
  entityId   String?   @map("entity_id") @db.Uuid
  oldValues  Json?     @map("old_values")
  newValues  Json?     @map("new_values")
  ipAddress  String?   @map("ip_address")
  createdAt  DateTime  @default(now()) @map("created_at")

  @@map("audit_logs")
}
```

See `src/services/audit.service.ts` for the (currently no-op) writer this
module's controllers/services should eventually call after every mutating
action.
