import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import { UsersService } from '../../domain/users/users.service';
import { InviteUserDto, UpdateUserDto } from './users.dto';
export declare class UsersManagementController {
    private readonly users;
    constructor(users: UsersService);
    list(ctx: AuthContext): Promise<{
        items: {
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
        }[];
    }>;
    invite(body: InviteUserDto, ctx: AuthContext): Promise<{
        user: {
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
        temporaryPassword: string;
    }>;
    update(id: string, body: UpdateUserDto, ctx: AuthContext): Promise<{
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
    }>;
    deactivate(id: string, ctx: AuthContext): Promise<{
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
    }>;
    reactivate(id: string, ctx: AuthContext): Promise<{
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
    }>;
    resetPassword(id: string, ctx: AuthContext): Promise<{
        user: {
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
        temporaryPassword: string;
    }>;
}
