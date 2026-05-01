import { Role } from './role';
export interface AuthContext {
    userId: string;
    organizationId: string;
    role: Role;
}
