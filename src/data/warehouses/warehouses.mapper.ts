import { Warehouse as PrismaWarehouse } from '@prisma/client';
import { Warehouse } from '../../domain/warehouses/warehouse.domain';

export class WarehousesMapper {
  toDomain(p: PrismaWarehouse): Warehouse {
    return new Warehouse(
      p.id,
      p.organizationId,
      p.name,
      p.color,
      p.deletedAt,
      p.createdAt,
      p.updatedAt,
    );
  }
}
