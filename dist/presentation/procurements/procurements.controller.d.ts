import type { AuthContext } from '../../domain/common/auth-context';
import { ProcurementsService } from '../../domain/procurements/procurements.service';
import { CreateProcurementDto, ListProcurementsQueryDto } from './procurements.dto';
export declare class ProcurementsController {
    private readonly service;
    constructor(service: ProcurementsService);
    list(q: ListProcurementsQueryDto, ctx: AuthContext): Promise<{
        items: {
            id: string;
            supplierId: string;
            warehouseId: string;
            createdById: string;
            note: string | null;
            createdAt: string;
            currency: string;
            totalValue: string;
            items: {
                id: string;
                articleId: string;
                quantity: string;
                purchasePrice: string;
                lineTotal: string;
            }[];
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    detail(id: string, ctx: AuthContext): Promise<{
        id: string;
        supplierId: string;
        warehouseId: string;
        createdById: string;
        note: string | null;
        createdAt: string;
        currency: string;
        totalValue: string;
        items: {
            id: string;
            articleId: string;
            quantity: string;
            purchasePrice: string;
            lineTotal: string;
        }[];
    }>;
    create(body: CreateProcurementDto, ctx: AuthContext): Promise<{
        id: string;
        supplierId: string;
        warehouseId: string;
        createdById: string;
        note: string | null;
        createdAt: string;
        currency: string;
        totalValue: string;
        items: {
            id: string;
            articleId: string;
            quantity: string;
            purchasePrice: string;
            lineTotal: string;
        }[];
    }>;
    private toPublic;
}
