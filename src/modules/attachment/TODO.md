# Attachment module — not yet converted

Nothing existed for this in the Sequelize source — no `Attachment` model
was ever defined, so there's no `prisma.attachment` in `schema.prisma` yet
either. Scaffolded here per the SRS (Section 13), which specifies a
polymorphic `attachments` table:

```prisma
model Attachment {
  id          String    @id @default(uuid()) @db.Uuid
  entityType  String    @map("entity_type") // "income" | "expense" | "reminder"
  entityId    String    @map("entity_id") @db.Uuid
  fileName    String    @map("file_name")
  fileSize    BigInt    @map("file_size")
  mimeType    String    @map("mime_type")
  storageKey  String    @map("storage_key")
  storageUrl  String    @map("storage_url")
  provider    String
  uploadedBy  String?   @map("uploaded_by") @db.Uuid
  createdAt   DateTime  @default(now()) @map("created_at")
  deletedAt   DateTime? @map("deleted_at")

  @@map("attachments")
  @@index([entityType, entityId])
}
```

Note this is intentionally polymorphic at the *application* level
(`entityType` + `entityId`), not enforced with a DB foreign key — the same
approach already used elsewhere in this project for polymorphic relations,
per your existing architecture notes. Pair this with the `StorageService`
factory scaffolded in `src/providers/storage/`.
