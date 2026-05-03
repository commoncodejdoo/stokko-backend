import { Category as PrismaCategory } from '@prisma/client';
import { Category } from '../../domain/categories/category.domain';
export declare class CategoriesMapper {
    toDomain(p: PrismaCategory): Category;
}
