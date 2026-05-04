import { Sale as PrismaSale, SaleItem as PrismaSaleItem, Shift as PrismaShift } from '@prisma/client';
import { Sale } from '../../domain/sales/sale.domain';
import { Shift } from '../../domain/sales/shift.domain';
type SaleWithItems = PrismaSale & {
    items: PrismaSaleItem[];
};
export declare class SalesMapper {
    toShift(p: PrismaShift, currency: string): Shift;
    toSale(p: SaleWithItems, currency: string): Sale;
}
export {};
