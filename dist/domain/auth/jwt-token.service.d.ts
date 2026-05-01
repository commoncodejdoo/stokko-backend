import { Role } from '../common/role';
export interface AccessTokenClaims {
    userId: string;
    organizationId: string;
    role: Role;
}
export interface AccessTokenPayload extends AccessTokenClaims {
    type: 'access';
    iat: number;
    exp: number;
}
export interface PasswordChangeTokenClaims {
    userId: string;
    organizationId: string;
}
export interface PasswordChangeTokenPayload extends PasswordChangeTokenClaims {
    type: 'pwd-change';
    iat: number;
    exp: number;
}
export declare abstract class JwtTokenService {
    abstract issueAccessToken(claims: AccessTokenClaims): Promise<string>;
    abstract verifyAccessToken(token: string): Promise<AccessTokenPayload>;
    abstract issuePasswordChangeToken(claims: PasswordChangeTokenClaims): Promise<string>;
    abstract verifyPasswordChangeToken(token: string): Promise<PasswordChangeTokenPayload>;
}
