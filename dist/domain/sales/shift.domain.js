"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shift = void 0;
class Shift {
    id;
    organizationId;
    date;
    openedAt;
    closedAt;
    closedById;
    status;
    totalQuantity;
    totalRevenue;
    constructor(id, organizationId, date, openedAt, closedAt, closedById, status, totalQuantity, totalRevenue) {
        this.id = id;
        this.organizationId = organizationId;
        this.date = date;
        this.openedAt = openedAt;
        this.closedAt = closedAt;
        this.closedById = closedById;
        this.status = status;
        this.totalQuantity = totalQuantity;
        this.totalRevenue = totalRevenue;
    }
    isClosed() {
        return this.status === 'CLOSED';
    }
    toSnapshot() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            date: this.date.toISOString(),
            openedAt: this.openedAt.toISOString(),
            closedAt: this.closedAt?.toISOString() ?? null,
            closedById: this.closedById,
            status: this.status,
            totalQuantity: this.totalQuantity.toFixed(3),
            totalRevenue: this.totalRevenue.toFixed(),
            currency: this.totalRevenue.currency,
        };
    }
}
exports.Shift = Shift;
//# sourceMappingURL=shift.domain.js.map