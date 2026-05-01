import { AuthService } from '../../domain/auth/auth.service';
import type { AuthContext } from '../../domain/common/auth-context';
import { ChangePasswordDto, ForcedPasswordChangeDto, LoginDto, RefreshDto } from './auth.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    login(body: LoginDto): Promise<{
        requirePasswordChange: true;
        passwordChangeToken: string;
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
        accessToken?: undefined;
        refreshToken?: undefined;
    } | {
        requirePasswordChange: false;
        accessToken: string;
        refreshToken: string;
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
        passwordChangeToken?: undefined;
    }>;
    refresh(body: RefreshDto): Promise<import("../../domain/auth/auth.service").SessionTokens>;
    forcedPasswordChange(body: ForcedPasswordChangeDto): Promise<{
        accessToken: string;
        refreshToken: string;
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
    }>;
    changePassword(body: ChangePasswordDto, ctx: AuthContext): Promise<void>;
}
