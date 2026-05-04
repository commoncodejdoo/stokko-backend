import type { AuthContext } from '../../domain/common/auth-context';
import { TransfersService } from '../../domain/transfers/transfers.service';
import { CreateTransferDto, ListTransfersQueryDto } from './transfers.dto';
export declare class TransfersController {
    private readonly service;
    constructor(service: TransfersService);
    list(q: ListTransfersQueryDto, ctx: AuthContext): Promise<{
        items: {
            id: string;
            sourceWarehouseId: string;
            destinationWarehouseId: string;
            createdById: string;
            note: string | null;
            createdAt: string;
            items: {
                id: string;
                articleId: string;
                quantity: string;
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
        sourceWarehouseId: string;
        destinationWarehouseId: string;
        createdById: string;
        note: string | null;
        createdAt: string;
        items: {
            id: string;
            articleId: string;
            quantity: string;
        }[];
    }>;
    create(body: CreateTransferDto, ctx: AuthContext): Promise<{
        id: string;
        sourceWarehouseId: string;
        destinationWarehouseId: string;
        createdById: string;
        note: string | null;
        createdAt: string;
        items: {
            id: string;
            articleId: string;
            quantity: string;
        }[];
    }>;
    private toPublic;
}
