import { PasswordHasher } from '../../domain/common/password-hasher';
export declare class BcryptPasswordHasher extends PasswordHasher {
    private readonly logger;
    private readonly rounds;
    constructor();
    hash(plaintext: string): Promise<string>;
    verify(plaintext: string, hash: string): Promise<boolean>;
    generateTemporary(): string;
    private pick;
    private shuffle;
}
