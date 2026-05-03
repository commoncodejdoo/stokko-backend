import { TxClient } from '../../domain/common/transaction';
import { Procurement } from '../../domain/procurements/procurement.domain';
import { CreateProcurementInput, ListProcurementsFilter, PaginatedProcurements, ProcurementsRepository } from '../../domain/procurements/procurements.repository';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaProcurementsRepository extends ProcurementsRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    create(input: CreateProcurementInput, currency: string, tx?: TxClient): Promise<Procurement>;
    findById(id: string, currency: string, tx?: TxClient): Promise<Procurement | null>;
    countCreatedSince(organizationId: string, since: Date, tx?: TxClient): Promise<number>;
    list(filter: ListProcurementsFilter, currency: string, tx?: TxClient): Promise<PaginatedProcurements>;
}
