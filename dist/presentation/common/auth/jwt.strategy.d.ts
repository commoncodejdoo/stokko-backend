import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { AuthContext } from '../../../domain/common/auth-context';
import { Role } from '../../../domain/common/role';
interface RawJwtPayload {
    sub: string;
    userId: string;
    organizationId: string;
    role: Role;
    type?: string;
    iat: number;
    exp: number;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: RawJwtPayload): AuthContext;
}
export {};
