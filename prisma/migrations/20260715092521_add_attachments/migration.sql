-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "storageKey" VARCHAR(500) NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "uploadedBy" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachments_entityType_entityId_idx" ON "attachments"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "attachments_deleted_at_idx" ON "attachments"("deleted_at");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
