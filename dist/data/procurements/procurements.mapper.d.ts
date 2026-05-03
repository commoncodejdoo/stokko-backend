import { Procurement as PrismaProcurement, ProcurementItem as PrismaProcurementItem } from '@prisma/client';
import { Procurement } from '../../domain/procurements/procurement.domain';
type WithItems = PrismaProcurement & {
    items: PrismaProcurementItem[];
};
export declare class ProcurementsMapper {
    toDomain(p: WithItems, currency: string): Procurement;
}
export {};
