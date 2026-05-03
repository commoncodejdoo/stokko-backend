export declare class Warehouse {
    readonly id: string;
    readonly organizationId: string;
    readonly name: string;
    readonly color: string;
    readonly deletedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, organizationId: string, name: string, color: string, deletedAt: Date | null, createdAt: Date, updatedAt: Date);
    initials(): string;
    isDeleted(): boolean;
    toSnapshot(): Record<string, unknown>;
}
