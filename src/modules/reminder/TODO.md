# Reminder module — not yet converted

No `remainderController` / `remainderRoute` existed in the Sequelize
source — only the `Remainder` model
(`src/models/supporting model/remainder.ts`) and its relationship to `User`
(`remainderRelationship.ts`) were defined.

The `Remainder` model is fully defined in `prisma/schema.prisma`, with
`priority` / `status` / `repeat` converted to native Prisma enums
(`ReminderPriority`, `ReminderStatus`, `ReminderRepeat`) matching the
Sequelize `DataType.ENUM(...)` columns.

When you build this module, follow the pattern in `src/modules/income/`.
The SRS (Section 10) also expects a status-toggle endpoint beyond standard
CRUD:

```
PATCH /reminders/:id/complete -> prisma.remainder.update({ data: { status: "COMPLETED" } })
```

Note the Sequelize model was named `Remainder` (misspelled from
"reminder") and the table `remainders` — kept as-is here for a faithful
1:1 conversion, but worth renaming to `Reminder`/`reminders` while nothing
depends on the old name yet.
