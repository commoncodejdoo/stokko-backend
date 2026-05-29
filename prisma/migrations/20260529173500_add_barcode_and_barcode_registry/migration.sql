-- AlterTable
ALTER TABLE "Article" ADD COLUMN "barcode" TEXT;

-- CreateTable
CREATE TABLE "BarcodeRegistry" (
    "barcode" TEXT NOT NULL,
    "suggestedName" TEXT NOT NULL,
    "suggestedBrand" TEXT,
    "suggestedCategoryName" TEXT,
    "suggestedUnit" "Unit" NOT NULL,
    "firstSeenOrgId" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "usingOrgIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "BarcodeRegistry_pkey" PRIMARY KEY ("barcode")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_organizationId_barcode_key" ON "Article"("organizationId", "barcode");

-- CreateIndex
CREATE INDEX "Article_organizationId_barcode_idx" ON "Article"("organizationId", "barcode");

-- CreateIndex
CREATE INDEX "BarcodeRegistry_firstSeenOrgId_idx" ON "BarcodeRegistry"("firstSeenOrgId");

-- AddForeignKey
ALTER TABLE "BarcodeRegistry" ADD CONSTRAINT "BarcodeRegistry_firstSeenOrgId_fkey" FOREIGN KEY ("firstSeenOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
