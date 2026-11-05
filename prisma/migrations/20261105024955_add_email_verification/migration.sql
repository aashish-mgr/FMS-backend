-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerifiedAt" TIMESTAMPTZ(6);

-- Existing accounts predate email verification. Grandfather them so the new
-- verification banner only appears for accounts created after this rollout.
UPDATE "users" SET "emailVerifiedAt" = CURRENT_TIMESTAMP WHERE "emailVerifiedAt" IS NULL;

-- CreateTable
CREATE TABLE "emailVerificationTokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "usedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emailVerificationTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emailVerificationTokens_tokenHash_key" ON "emailVerificationTokens"("tokenHash");

-- CreateIndex
CREATE INDEX "emailVerificationTokens_userId_idx" ON "emailVerificationTokens"("userId");

-- CreateIndex
CREATE INDEX "emailVerificationTokens_expiresAt_idx" ON "emailVerificationTokens"("expiresAt");

-- AddForeignKey
ALTER TABLE "emailVerificationTokens" ADD CONSTRAINT "emailVerificationTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
