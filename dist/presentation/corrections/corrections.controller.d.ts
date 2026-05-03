import type { AuthContext } from '../../domain/common/auth-context';
import { CorrectionsService } from '../../domain/corrections/corrections.service';
import { CreateCorrectionDto, ListCorrectionsQueryDto } from './corrections.dto';
export declare class CorrectionsController {
    private readonly service;
    constructor(service: CorrectionsService);
    list(q: ListCorrectionsQueryDto, ctx: AuthContext): Promise<{
        items: {
            id: string;
            articleId: string;
            warehouseId: string;
            type: import("../../domain/corrections/correction.domain").CorrectionType;
            value: string;
            reason: import("../../domain/corrections/correction.domain").CorrectionReason;
            note: string | null;
            createdById: string;
            createdAt: string;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    detail(id: string, ctx: AuthContext): Promise<{
        id: string;
        articleId: string;
        warehouseId: string;
        type: import("../../domain/corrections/correction.domain").CorrectionType;
        value: string;
        reason: import("../../domain/corrections/correction.domain").CorrectionReason;
        note: string | null;
        createdById: string;
        createdAt: string;
    }>;
    create(body: CreateCorrectionDto, ctx: AuthContext): Promise<{
        id: string;
        articleId: string;
        warehouseId: string;
        type: import("../../domain/corrections/correction.domain").CorrectionType;
        value: string;
        reason: import("../../domain/corrections/correction.domain").CorrectionReason;
        note: string | null;
        createdById: string;
        createdAt: string;
    }>;
    private toPublic;
}
