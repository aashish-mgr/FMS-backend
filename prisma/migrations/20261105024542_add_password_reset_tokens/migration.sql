-- CreateTable
CREATE TABLE "passwordResetTokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "usedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passwordResetTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "passwordResetTokens_tokenHash_key" ON "passwordResetTokens"("tokenHash");

-- CreateIndex
CREATE INDEX "passwordResetTokens_userId_idx" ON "passwordResetTokens"("userId");

-- CreateIndex
CREATE INDEX "passwordResetTokens_expiresAt_idx" ON "passwordResetTokens"("expiresAt");

-- AddForeignKey
ALTER TABLE "passwordResetTokens" ADD CONSTRAINT "passwordResetTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
