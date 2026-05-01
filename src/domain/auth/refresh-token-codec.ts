/**
 * Generates and hashes refresh-token plaintext.
 *
 * Uses a sha256 hash for storage (not bcrypt) — the plaintext is already
 * 32 bytes of cryptographically-random hex, so a fast hash is appropriate
 * and avoids the bcrypt cost on every refresh request.
 */
export abstract class RefreshTokenCodec {
  /** Produces a new plaintext token (hex, 64 characters). */
  abstract generatePlaintext(): string;
  /** Returns the storage hash for a given plaintext. */
  abstract hash(plaintext: string): string;
}
