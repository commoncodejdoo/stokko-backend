-- DropForeignKey
ALTER TABLE "Procurement" DROP CONSTRAINT "Procurement_supplierId_fkey";

-- AlterTable
ALTER TABLE "Procurement" ALTER COLUMN "supplierId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Procurement" ADD CONSTRAINT "Procurement_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
