import { TxClient } from '../../domain/common/transaction';
import { Warehouse } from '../../domain/warehouses/warehouse.domain';
import { CreateWarehouseInput, UpdateWarehouseInput, WarehousesRepository } from '../../domain/warehouses/warehouses.repository';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaWarehousesRepository extends WarehousesRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    create(input: CreateWarehouseInput, tx?: TxClient): Promise<Warehouse>;
    findById(id: string, tx?: TxClient): Promise<Warehouse | null>;
    listByOrg(organizationId: string, tx?: TxClient): Promise<Warehouse[]>;
    update(id: string, patch: UpdateWarehouseInput, tx?: TxClient): Promise<Warehouse>;
    softDelete(id: string, tx?: TxClient): Promise<Warehouse>;
}
