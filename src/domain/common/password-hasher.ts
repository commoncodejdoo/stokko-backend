/**
 * Abstract password hasher — concrete implementation lives in `data/common/`.
 *
 * Domain talks to this interface so password handling can be swapped
 * (bcrypt → argon2, etc.) without touching domain code.
 */
export abstract class PasswordHasher {
  abstract hash(plaintext: string): Promise<string>;
  abstract verify(plaintext: string, hash: string): Promise<boolean>;

  /**
   * Generates a random 12-char password suitable for temporary credentials.
   * Includes lowercase, uppercase, digits, and at least one special char.
   */
  abstract generateTemporary(): string;
}
