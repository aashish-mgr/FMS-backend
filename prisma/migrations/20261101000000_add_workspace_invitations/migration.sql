-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "workspaceInvitations" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "roleId" UUID NOT NULL,
    "invitedBy" UUID,
    "tokenHash" VARCHAR(255) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "acceptedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "workspaceInvitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaceInvitations_tokenHash_key" ON "workspaceInvitations"("tokenHash");

-- CreateIndex
CREATE INDEX "workspaceInvitations_tenantId_email_idx" ON "workspaceInvitations"("tenantId", "email");

-- CreateIndex
CREATE INDEX "workspaceInvitations_tenantId_status_idx" ON "workspaceInvitations"("tenantId", "status");

-- CreateIndex
CREATE INDEX "workspaceInvitations_expiresAt_idx" ON "workspaceInvitations"("expiresAt");

-- CreateIndex
CREATE INDEX "workspaceInvitations_roleId_idx" ON "workspaceInvitations"("roleId");

-- CreateIndex
CREATE INDEX "workspaceInvitations_invitedBy_idx" ON "workspaceInvitations"("invitedBy");

-- AddForeignKey
ALTER TABLE "workspaceInvitations" ADD CONSTRAINT "workspaceInvitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceInvitations" ADD CONSTRAINT "workspaceInvitations_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaceInvitations" ADD CONSTRAINT "workspaceInvitations_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
