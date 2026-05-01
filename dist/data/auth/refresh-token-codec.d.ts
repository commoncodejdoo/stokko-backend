import { RefreshTokenCodec } from '../../domain/auth/refresh-token-codec';
export declare class Sha256RefreshTokenCodec extends RefreshTokenCodec {
    generatePlaintext(): string;
    hash(plaintext: string): string;
}
