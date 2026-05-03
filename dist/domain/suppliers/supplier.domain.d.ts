export declare class Supplier {
    readonly id: string;
    readonly organizationId: string;
    readonly name: string;
    readonly contactPerson: string | null;
    readonly phone: string | null;
    readonly email: string | null;
    readonly note: string | null;
    readonly deletedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, organizationId: string, name: string, contactPerson: string | null, phone: string | null, email: string | null, note: string | null, deletedAt: Date | null, createdAt: Date, updatedAt: Date);
    isDeleted(): boolean;
    toSnapshot(): Record<string, unknown>;
}
