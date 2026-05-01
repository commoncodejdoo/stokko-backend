export declare abstract class PasswordHasher {
    abstract hash(plaintext: string): Promise<string>;
    abstract verify(plaintext: string, hash: string): Promise<boolean>;
    abstract generateTemporary(): string;
}
