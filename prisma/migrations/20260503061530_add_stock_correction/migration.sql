-- CreateEnum
CREATE TYPE "CorrectionType" AS ENUM ('ABSOLUTE', 'DELTA');

-- CreateEnum
CREATE TYPE "CorrectionReason" AS ENUM ('COUNT', 'WRITE_OFF', 'INPUT_ERROR', 'OTHER');

-- CreateTable
CREATE TABLE "StockCorrection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "type" "CorrectionType" NOT NULL,
    "value" DECIMAL(12,3) NOT NULL,
    "reason" "CorrectionReason" NOT NULL,
    "note" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockCorrection_organizationId_createdAt_idx" ON "StockCorrection"("organizationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "StockCorrection_articleId_idx" ON "StockCorrection"("articleId");

-- CreateIndex
CREATE INDEX "StockCorrection_warehouseId_idx" ON "StockCorrection"("warehouseId");

-- AddForeignKey
ALTER TABLE "StockCorrection" ADD CONSTRAINT "StockCorrection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCorrection" ADD CONSTRAINT "StockCorrection_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCorrection" ADD CONSTRAINT "StockCorrection_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCorrection" ADD CONSTRAINT "StockCorrection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
