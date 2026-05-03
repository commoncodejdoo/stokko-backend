import type { AuthContext } from '../../domain/common/auth-context';
import { SuppliersService } from '../../domain/suppliers/suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './suppliers.dto';
export declare class SuppliersController {
    private readonly service;
    constructor(service: SuppliersService);
    list(ctx: AuthContext): Promise<{
        items: {
            id: string;
            name: string;
            contactPerson: string | null;
            phone: string | null;
            email: string | null;
            note: string | null;
        }[];
    }>;
    detail(id: string, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        contactPerson: string | null;
        phone: string | null;
        email: string | null;
        note: string | null;
    }>;
    create(body: CreateSupplierDto, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        contactPerson: string | null;
        phone: string | null;
        email: string | null;
        note: string | null;
    }>;
    update(id: string, body: UpdateSupplierDto, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        contactPerson: string | null;
        phone: string | null;
        email: string | null;
        note: string | null;
    }>;
    delete(id: string, ctx: AuthContext): Promise<void>;
    private toPublic;
}
