import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthContext } from '../common/auth-context';
import { TxClient } from '../common/transaction';
import { Warehouse, WarehouseKind } from './warehouse.domain';
import { UpdateWarehouseInput, WarehousesRepository } from './warehouses.repository';
export declare class WarehousesService {
    private readonly repo;
    private readonly auditLog;
    constructor(repo: WarehousesRepository, auditLog: AuditLogService);
    list(organizationId: string, tx?: TxClient): Promise<Warehouse[]>;
    findById(id: string, tx?: TxClient): Promise<Warehouse | null>;
    requireById(id: string, organizationId: string, tx?: TxClient): Promise<Warehouse>;
    create(input: {
        name: string;
        color: string;
        kind?: WarehouseKind;
    }, ctx: AuthContext, tx?: TxClient): Promise<Warehouse>;
    update(id: string, patch: UpdateWarehouseInput, ctx: AuthContext, tx?: TxClient): Promise<Warehouse>;
    softDelete(id: string, ctx: AuthContext, tx?: TxClient): Promise<void>;
}
