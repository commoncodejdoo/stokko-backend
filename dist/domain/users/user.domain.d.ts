import { Role } from '../common/role';
export declare class User {
    readonly id: string;
    readonly organizationId: string;
    readonly email: string;
    readonly passwordHash: string;
    readonly role: Role;
    readonly firstName: string;
    readonly lastName: string;
    readonly mustChangePassword: boolean;
    readonly isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, organizationId: string, email: string, passwordHash: string, role: Role, firstName: string, lastName: string, mustChangePassword: boolean, isActive: boolean, createdAt: Date, updatedAt: Date);
    fullName(): string;
    initials(): string;
    toSnapshot(): Record<string, unknown>;
    toPublic(): {
        id: string;
        organizationId: string;
        email: string;
        role: Role;
        firstName: string;
        lastName: string;
        fullName: string;
        initials: string;
        mustChangePassword: boolean;
        isActive: boolean;
    };
}
