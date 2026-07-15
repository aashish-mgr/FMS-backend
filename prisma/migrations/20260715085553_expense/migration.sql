-- AlterTable
ALTER TABLE "auditlogs" ALTER COLUMN "entityId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
