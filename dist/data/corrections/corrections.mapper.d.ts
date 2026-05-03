import { StockCorrection as PrismaStockCorrection } from '@prisma/client';
import { StockCorrection } from '../../domain/corrections/correction.domain';
export declare class CorrectionsMapper {
    toDomain(p: PrismaStockCorrection): StockCorrection;
}
