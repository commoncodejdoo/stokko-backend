import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenClaims, AccessTokenPayload, JwtTokenService, PasswordChangeTokenClaims, PasswordChangeTokenPayload } from '../../domain/auth/jwt-token.service';
export declare class NestJwtTokenService extends JwtTokenService {
    private readonly jwt;
    private readonly secret;
    private readonly accessTtl;
    private readonly passwordChangeTtl;
    constructor(jwt: JwtService, config: ConfigService);
    issueAccessToken(claims: AccessTokenClaims): Promise<string>;
    verifyAccessToken(token: string): Promise<AccessTokenPayload>;
    issuePasswordChangeToken(claims: PasswordChangeTokenClaims): Promise<string>;
    verifyPasswordChangeToken(token: string): Promise<PasswordChangeTokenPayload>;
}
