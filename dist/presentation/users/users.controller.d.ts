import type { AuthContext } from '../../domain/common/auth-context';
import { OrganizationsService } from '../../domain/organizations/organizations.service';
import { UsersService } from '../../domain/users/users.service';
export declare class UsersController {
    private readonly users;
    private readonly orgs;
    constructor(users: UsersService, orgs: OrganizationsService);
    me(ctx: AuthContext): Promise<{
        user: {
            id: string;
            organizationId: string;
            email: string;
            role: import("../../domain/common/role").Role;
            firstName: string;
            lastName: string;
            fullName: string;
            initials: string;
            mustChangePassword: boolean;
            isActive: boolean;
        };
        organization: {
            id: string;
            name: string;
            currency: string;
        };
    }>;
}
