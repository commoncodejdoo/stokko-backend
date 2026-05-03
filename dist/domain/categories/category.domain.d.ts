export declare class Category {
    readonly id: string;
    readonly organizationId: string;
    readonly name: string;
    readonly isPredefined: boolean;
    readonly deletedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, organizationId: string, name: string, isPredefined: boolean, deletedAt: Date | null, createdAt: Date, updatedAt: Date);
    isDeleted(): boolean;
    toSnapshot(): Record<string, unknown>;
}
