export declare class Organization {
    readonly id: string;
    readonly name: string;
    readonly currency: string;
    readonly isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, name: string, currency: string, isActive: boolean, createdAt: Date, updatedAt: Date);
    toSnapshot(): Record<string, unknown>;
}
