import { Category } from '../../domain/categories/category.domain';
import { CategoriesRepository, CreateCategoryInput, UpdateCategoryInput } from '../../domain/categories/categories.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaCategoriesRepository extends CategoriesRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    create(input: CreateCategoryInput, tx?: TxClient): Promise<Category>;
    findById(id: string, tx?: TxClient): Promise<Category | null>;
    listByOrg(organizationId: string, tx?: TxClient): Promise<Category[]>;
    update(id: string, patch: UpdateCategoryInput, tx?: TxClient): Promise<Category>;
    softDelete(id: string, tx?: TxClient): Promise<Category>;
}
