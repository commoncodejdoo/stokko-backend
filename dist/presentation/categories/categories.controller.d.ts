import { CategoriesService } from '../../domain/categories/categories.service';
import type { AuthContext } from '../../domain/common/auth-context';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
export declare class CategoriesController {
    private readonly service;
    constructor(service: CategoriesService);
    list(ctx: AuthContext): Promise<{
        items: {
            id: string;
            name: string;
            isPredefined: boolean;
        }[];
    }>;
    create(body: CreateCategoryDto, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        isPredefined: boolean;
    }>;
    update(id: string, body: UpdateCategoryDto, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        isPredefined: boolean;
    }>;
    delete(id: string, ctx: AuthContext): Promise<void>;
    private toPublic;
}
