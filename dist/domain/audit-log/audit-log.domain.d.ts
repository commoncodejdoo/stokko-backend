import { AuditAction } from '../common/audit-action';
export interface AuditLogInput {
    organizationId: string;
    userId: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    before?: unknown;
    after?: unknown;
}
export declare class AuditLogEntry {
    readonly id: string;
    readonly organizationId: string;
    readonly userId: string;
    readonly action: AuditAction;
    readonly entityType: string;
    readonly entityId: string;
    readonly before: unknown;
    readonly after: unknown;
    readonly createdAt: Date;
    constructor(id: string, organizationId: string, userId: string, action: AuditAction, entityType: string, entityId: string, before: unknown, after: unknown, createdAt: Date);
}
