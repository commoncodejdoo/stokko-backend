import type { AuthContext } from '../../domain/common/auth-context';
import { DashboardService } from '../../domain/dashboard/dashboard.service';
export declare class DashboardController {
    private readonly service;
    constructor(service: DashboardService);
    overview(ctx: AuthContext): Promise<{
        counts: import("../../domain/dashboard/dashboard.service").DashboardCounts;
        perWarehouse: {
            warehouseId: string;
            name: string;
            color: string;
            initials: string;
            articleCount: number;
            totalQuantity: string;
            totalValue: string;
            currency: string;
        }[];
        recentActivity: {
            id: string;
            action: import("../../domain/common/audit-action").AuditAction;
            entityType: string;
            entityId: string;
            user: import("../../domain/dashboard/dashboard.service").DashboardActivityActor | null;
            before: unknown;
            after: unknown;
            createdAt: string;
        }[];
    }>;
    private toPublic;
    private warehouseToPublic;
    private activityToPublic;
}
