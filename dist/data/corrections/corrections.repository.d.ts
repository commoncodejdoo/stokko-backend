import { StockCorrection } from '../../domain/corrections/correction.domain';
import { CorrectionsRepository, CreateCorrectionInput, ListCorrectionsFilter, PaginatedCorrections } from '../../domain/corrections/corrections.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaCorrectionsRepository extends CorrectionsRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    create(input: CreateCorrectionInput, tx?: TxClient): Promise<StockCorrection>;
    findById(id: string, tx?: TxClient): Promise<StockCorrection | null>;
    list(filter: ListCorrectionsFilter, tx?: TxClient): Promise<PaginatedCorrections>;
}
