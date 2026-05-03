import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthContext } from '../common/auth-context';
import { TxClient } from '../common/transaction';
import { Supplier } from './supplier.domain';
import { SuppliersRepository, UpdateSupplierInput } from './suppliers.repository';
export interface CreateSupplierCommand {
    name: string;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    note?: string | null;
}
export declare class SuppliersService {
    private readonly repo;
    private readonly auditLog;
    constructor(repo: SuppliersRepository, auditLog: AuditLogService);
    findById(id: string, tx?: TxClient): Promise<Supplier | null>;
    requireById(id: string, organizationId: string, tx?: TxClient): Promise<Supplier>;
    list(organizationId: string, tx?: TxClient): Promise<Supplier[]>;
    create(cmd: CreateSupplierCommand, ctx: AuthContext, tx?: TxClient): Promise<Supplier>;
    update(id: string, patch: UpdateSupplierInput, ctx: AuthContext, tx?: TxClient): Promise<Supplier>;
    softDelete(id: string, ctx: AuthContext, tx?: TxClient): Promise<void>;
}
