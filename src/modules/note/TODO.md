# Note module — not yet converted

No `noteController` / `noteRoute` existed in the Sequelize source — only
the `Note` model (`src/models/supporting model/notes.ts`) and its
relationship to `User` (`noteRelationship.ts`) were defined.

The `Note` model is fully defined in `prisma/schema.prisma` (title,
description, colorLabel, isPinned, isArchived, createdBy, soft delete via
deletedAt).

When you build this module, follow the pattern in `src/modules/income/`.
The SRS (Section 9) also expects two small toggle endpoints beyond standard
CRUD:

```
PATCH /notes/:id/pin       -> prisma.note.update({ data: { isPinned: true } })
PATCH /notes/:id/archive   -> prisma.note.update({ data: { isArchived: true } })
```
