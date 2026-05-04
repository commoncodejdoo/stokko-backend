import type { AuthContext } from '../../domain/common/auth-context';
import { SalesService } from '../../domain/sales/sales.service';
import { CloseShiftDto, ListShiftsQueryDto } from './sales.dto';
export declare class ShiftsController {
    private readonly service;
    constructor(service: SalesService);
    list(q: ListShiftsQueryDto, ctx: AuthContext): Promise<{
        items: {
            id: string;
            date: string;
            openedAt: string;
            closedAt: string | null;
            closedById: string | null;
            status: import("../../domain/sales/shift.domain").ShiftStatus;
            totalQuantity: string;
            totalRevenue: string;
            currency: string;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    detail(id: string, ctx: AuthContext): Promise<{
        sales: {
            id: string;
            shiftId: string;
            warehouseId: string;
            createdById: string;
            createdAt: string;
            currency: string;
            totalQuantity: string;
            totalRevenue: string;
            items: {
                id: string;
                articleId: string;
                quantity: string;
                unitPrice: string;
                lineTotal: string;
            }[];
        }[];
        id: string;
        date: string;
        openedAt: string;
        closedAt: string | null;
        closedById: string | null;
        status: import("../../domain/sales/shift.domain").ShiftStatus;
        totalQuantity: string;
        totalRevenue: string;
        currency: string;
    }>;
    close(body: CloseShiftDto, ctx: AuthContext): Promise<{
        sales: {
            id: string;
            shiftId: string;
            warehouseId: string;
            createdById: string;
            createdAt: string;
            currency: string;
            totalQuantity: string;
            totalRevenue: string;
            items: {
                id: string;
                articleId: string;
                quantity: string;
                unitPrice: string;
                lineTotal: string;
            }[];
        }[];
        id: string;
        date: string;
        openedAt: string;
        closedAt: string | null;
        closedById: string | null;
        status: import("../../domain/sales/shift.domain").ShiftStatus;
        totalQuantity: string;
        totalRevenue: string;
        currency: string;
    }>;
    remove(id: string, ctx: AuthContext): Promise<void>;
    private toShiftPublic;
    private toSalePublic;
}
