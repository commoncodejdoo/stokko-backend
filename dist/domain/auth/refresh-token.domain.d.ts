export declare class RefreshTokenRecord {
    readonly id: string;
    readonly organizationId: string;
    readonly userId: string;
    readonly tokenHash: string;
    readonly expiresAt: Date;
    readonly revokedAt: Date | null;
    readonly createdAt: Date;
    constructor(id: string, organizationId: string, userId: string, tokenHash: string, expiresAt: Date, revokedAt: Date | null, createdAt: Date);
    isExpired(now?: Date): boolean;
    isRevoked(): boolean;
    isUsable(now?: Date): boolean;
}
