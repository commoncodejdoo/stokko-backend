import { Supplier as PrismaSupplier } from '@prisma/client';
import { Supplier } from '../../domain/suppliers/supplier.domain';
export declare class SuppliersMapper {
    toDomain(p: PrismaSupplier): Supplier;
}
