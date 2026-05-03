import { CorrectionReason, CorrectionType } from '../../domain/corrections/correction.domain';
export declare class CreateCorrectionDto {
    articleId: string;
    warehouseId: string;
    type: CorrectionType;
    value: string;
    reason: CorrectionReason;
    note?: string;
}
export declare class ListCorrectionsQueryDto {
    articleId?: string;
    warehouseId?: string;
    page?: string;
    pageSize?: string;
}
