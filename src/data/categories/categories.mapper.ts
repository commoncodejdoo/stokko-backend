import { Category as PrismaCategory } from '@prisma/client';
import { Category } from '../../domain/categories/category.domain';

export class CategoriesMapper {
  toDomain(p: PrismaCategory): Category {
    return new Category(
      p.id,
      p.organizationId,
      p.name,
      p.isPredefined,
      p.deletedAt,
      p.createdAt,
      p.updatedAt,
    );
  }
}
