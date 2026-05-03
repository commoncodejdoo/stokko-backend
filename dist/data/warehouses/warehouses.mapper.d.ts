import { Warehouse as PrismaWarehouse } from '@prisma/client';
import { Warehouse } from '../../domain/warehouses/warehouse.domain';
export declare class WarehousesMapper {
    toDomain(p: PrismaWarehouse): Warehouse;
}
