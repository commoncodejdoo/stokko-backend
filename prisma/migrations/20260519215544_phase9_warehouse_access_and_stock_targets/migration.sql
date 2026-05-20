-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'USER_WAREHOUSE_ACCESS_GRANTED';
ALTER TYPE "AuditAction" ADD VALUE 'USER_WAREHOUSE_ACCESS_REVOKED';
ALTER TYPE "AuditAction" ADD VALUE 'WAREHOUSE_STOCK_TARGET_UPDATED';

-- CreateTable
CREATE TABLE "UserWarehouseAccess" (
    "userId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWarehouseAccess_pkey" PRIMARY KEY ("userId","warehouseId")
);

-- CreateTable
CREATE TABLE "WarehouseStockTarget" (
    "warehouseId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "targetQty" DECIMAL(12,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarehouseStockTarget_pkey" PRIMARY KEY ("warehouseId","articleId")
);

-- CreateIndex
CREATE INDEX "UserWarehouseAccess_userId_idx" ON "UserWarehouseAccess"("userId");

-- CreateIndex
CREATE INDEX "UserWarehouseAccess_warehouseId_idx" ON "UserWarehouseAccess"("warehouseId");

-- CreateIndex
CREATE INDEX "WarehouseStockTarget_warehouseId_idx" ON "WarehouseStockTarget"("warehouseId");

-- CreateIndex
CREATE INDEX "WarehouseStockTarget_articleId_idx" ON "WarehouseStockTarget"("articleId");

-- AddForeignKey
ALTER TABLE "UserWarehouseAccess" ADD CONSTRAINT "UserWarehouseAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWarehouseAccess" ADD CONSTRAINT "UserWarehouseAccess_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseStockTarget" ADD CONSTRAINT "WarehouseStockTarget_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseStockTarget" ADD CONSTRAINT "WarehouseStockTarget_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
