import { TxClient } from '../common/transaction';
import { Category } from './category.domain';
export interface CreateCategoryInput {
    organizationId: string;
    name: string;
    isPredefined?: boolean;
}
export interface UpdateCategoryInput {
    name?: string;
}
export declare abstract class CategoriesRepository {
    abstract create(input: CreateCategoryInput, tx?: TxClient): Promise<Category>;
    abstract findById(id: string, tx?: TxClient): Promise<Category | null>;
    abstract listByOrg(organizationId: string, tx?: TxClient): Promise<Category[]>;
    abstract update(id: string, patch: UpdateCategoryInput, tx?: TxClient): Promise<Category>;
    abstract softDelete(id: string, tx?: TxClient): Promise<Category>;
}
