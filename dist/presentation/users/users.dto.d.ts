import { Role } from '../../domain/common/role';
export declare class InviteUserDto {
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    role?: Role;
}
