-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'ADMIN_IMPERSONATED';
ALTER TYPE "AuditAction" ADD VALUE 'ADMIN_USER_PASSWORD_RESET';
ALTER TYPE "AuditAction" ADD VALUE 'ADMIN_USER_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'ADMIN_USER_DEACTIVATED';
ALTER TYPE "AuditAction" ADD VALUE 'ADMIN_USER_REACTIVATED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoginAt" TIMESTAMP(3);
