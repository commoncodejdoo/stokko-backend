export declare abstract class RefreshTokenCodec {
    abstract generatePlaintext(): string;
    abstract hash(plaintext: string): string;
}
