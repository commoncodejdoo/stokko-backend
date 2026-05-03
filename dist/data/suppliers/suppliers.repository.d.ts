import { TxClient } from '../../domain/common/transaction';
import { Supplier } from '../../domain/suppliers/supplier.domain';
import { CreateSupplierInput, SuppliersRepository, UpdateSupplierInput } from '../../domain/suppliers/suppliers.repository';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaSuppliersRepository extends SuppliersRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    create(input: CreateSupplierInput, tx?: TxClient): Promise<Supplier>;
    findById(id: string, tx?: TxClient): Promise<Supplier | null>;
    listByOrg(organizationId: string, tx?: TxClient): Promise<Supplier[]>;
    update(id: string, patch: UpdateSupplierInput, tx?: TxClient): Promise<Supplier>;
    softDelete(id: string, tx?: TxClient): Promise<Supplier>;
}
