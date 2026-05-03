import { Supplier as PrismaSupplier } from '@prisma/client';
import { Supplier } from '../../domain/suppliers/supplier.domain';

export class SuppliersMapper {
  toDomain(p: PrismaSupplier): Supplier {
    return new Supplier(
      p.id,
      p.organizationId,
      p.name,
      p.contactPerson,
      p.phone,
      p.email,
      p.note,
      p.deletedAt,
      p.createdAt,
      p.updatedAt,
    );
  }
}
