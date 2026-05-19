-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('CRITICAL', 'WARNING', 'OK');

-- CreateEnum
CREATE TYPE "ShoppingListStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NarrativeKind" AS ENUM ('DAILY_DIGEST', 'ITEM_EXPLANATION', 'ANOMALY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'RECOMMENDATION_GENERATED';
ALTER TYPE "AuditAction" ADD VALUE 'SHOPPING_LIST_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'SHOPPING_LIST_COMPLETED';
ALTER TYPE "AuditAction" ADD VALUE 'SHOPPING_LIST_CANCELLED';
ALTER TYPE "AuditAction" ADD VALUE 'SHOPPING_LIST_ITEM_ADDED';
ALTER TYPE "AuditAction" ADD VALUE 'SHOPPING_LIST_ITEM_REMOVED';
ALTER TYPE "AuditAction" ADD VALUE 'SHOPPING_LIST_ITEM_UPDATED';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "defaultCoverageDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "defaultLeadTimeDays" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "defaultSafetyDays" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "PredictionSnapshot" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "currentStock" DECIMAL(12,3) NOT NULL,
    "avgDailyConsumption" DECIMAL(12,3),
    "daysOfSupply" DECIMAL(12,2),
    "shouldReorder" BOOLEAN NOT NULL DEFAULT false,
    "suggestedQty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "urgency" "Urgency" NOT NULL DEFAULT 'OK',
    "leadTimeDaysUsed" INTEGER NOT NULL,
    "safetyDaysUsed" INTEGER NOT NULL,
    "coverageDaysUsed" INTEGER NOT NULL,
    "signalWindowDays" INTEGER NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" "ShoppingListStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "totalEstimateCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "generatedFromSnapshotAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingListItem" (
    "id" TEXT NOT NULL,
    "shoppingListId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "suggestedQty" DECIMAL(12,3) NOT NULL,
    "customQty" DECIMAL(12,3),
    "supplierId" TEXT,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "addedManually" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "estimatedPriceCents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationNarrative" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kind" "NarrativeKind" NOT NULL,
    "body" TEXT NOT NULL,
    "articleId" TEXT,
    "warehouseId" TEXT,
    "modelUsed" TEXT NOT NULL,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "cachedTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(10,6) NOT NULL,
    "validForDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationNarrative_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PredictionSnapshot_organizationId_warehouseId_articleId_com_idx" ON "PredictionSnapshot"("organizationId", "warehouseId", "articleId", "computedAt" DESC);

-- CreateIndex
CREATE INDEX "PredictionSnapshot_organizationId_urgency_computedAt_idx" ON "PredictionSnapshot"("organizationId", "urgency", "computedAt" DESC);

-- CreateIndex
CREATE INDEX "ShoppingList_organizationId_status_idx" ON "ShoppingList"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ShoppingList_organizationId_createdAt_idx" ON "ShoppingList"("organizationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ShoppingListItem_shoppingListId_sortOrder_idx" ON "ShoppingListItem"("shoppingListId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingListItem_shoppingListId_articleId_warehouseId_key" ON "ShoppingListItem"("shoppingListId", "articleId", "warehouseId");

-- CreateIndex
CREATE INDEX "RecommendationNarrative_organizationId_kind_validForDate_idx" ON "RecommendationNarrative"("organizationId", "kind", "validForDate" DESC);

-- CreateIndex
CREATE INDEX "RecommendationNarrative_organizationId_articleId_warehouseI_idx" ON "RecommendationNarrative"("organizationId", "articleId", "warehouseId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "PredictionSnapshot" ADD CONSTRAINT "PredictionSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionSnapshot" ADD CONSTRAINT "PredictionSnapshot_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionSnapshot" ADD CONSTRAINT "PredictionSnapshot_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationNarrative" ADD CONSTRAINT "RecommendationNarrative_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationNarrative" ADD CONSTRAINT "RecommendationNarrative_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationNarrative" ADD CONSTRAINT "RecommendationNarrative_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
