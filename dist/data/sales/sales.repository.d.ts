import { TxClient } from '../../domain/common/transaction';
import { Sale } from '../../domain/sales/sale.domain';
import { CloseShiftInput, CreateSaleInput, ListShiftsFilter, PaginatedShifts, SalesRepository, ShiftWithSales, UpsertShiftInput } from '../../domain/sales/sales.repository';
import { Shift } from '../../domain/sales/shift.domain';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaSalesRepository extends SalesRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    upsertShift(input: UpsertShiftInput, tx?: TxClient): Promise<Shift>;
    findShiftById(id: string, currency: string, tx?: TxClient): Promise<Shift | null>;
    findShiftWithSales(id: string, currency: string, tx?: TxClient): Promise<ShiftWithSales | null>;
    listShifts(filter: ListShiftsFilter, currency: string, tx?: TxClient): Promise<PaginatedShifts>;
    createSale(input: CreateSaleInput, currency: string, tx?: TxClient): Promise<Sale>;
    closeShift(input: CloseShiftInput, currency: string, tx?: TxClient): Promise<Shift>;
    deleteShift(id: string, tx?: TxClient): Promise<void>;
}
