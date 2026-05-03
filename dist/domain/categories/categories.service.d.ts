import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthContext } from '../common/auth-context';
import { TxClient } from '../common/transaction';
import { Category } from './category.domain';
import { CategoriesRepository, UpdateCategoryInput } from './categories.repository';
export declare class CategoriesService {
    private readonly repo;
    private readonly auditLog;
    constructor(repo: CategoriesRepository, auditLog: AuditLogService);
    list(organizationId: string, tx?: TxClient): Promise<Category[]>;
    findById(id: string, tx?: TxClient): Promise<Category | null>;
    requireById(id: string, organizationId: string, tx?: TxClient): Promise<Category>;
    create(name: string, ctx: AuthContext, tx?: TxClient): Promise<Category>;
    update(id: string, patch: UpdateCategoryInput, ctx: AuthContext, tx?: TxClient): Promise<Category>;
    softDelete(id: string, ctx: AuthContext, tx?: TxClient): Promise<void>;
    seedPredefined(organizationId: string, actorUserId: string, tx: TxClient): Promise<Category[]>;
}
