import type { AuthContext } from '../../domain/common/auth-context';
import { WarehousesService } from '../../domain/warehouses/warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './warehouses.dto';
export declare class WarehousesController {
    private readonly service;
    constructor(service: WarehousesService);
    list(ctx: AuthContext): Promise<{
        items: {
            id: string;
            name: string;
            color: string;
            initials: string;
        }[];
    }>;
    detail(id: string, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        color: string;
        initials: string;
    }>;
    create(body: CreateWarehouseDto, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        color: string;
        initials: string;
    }>;
    update(id: string, body: UpdateWarehouseDto, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        color: string;
        initials: string;
    }>;
    delete(id: string, ctx: AuthContext): Promise<void>;
    private toPublic;
}
