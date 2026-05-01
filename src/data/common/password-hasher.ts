import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PasswordHasher } from '../../domain/common/password-hasher';

const ALPHABET_LOWER = 'abcdefghijkmnpqrstuvwxyz'; // omits l/o
const ALPHABET_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // omits I/O
const DIGITS = '23456789'; // omits 0/1
const SPECIAL = '!@#$%&*?';

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  private readonly logger = new Logger(BcryptPasswordHasher.name);
  private readonly rounds: number;

  constructor() {
    super();
    const raw = Number(process.env.BCRYPT_ROUNDS ?? 12);
    this.rounds = Number.isFinite(raw) && raw >= 10 && raw <= 14 ? raw : 12;
    this.logger.log(`bcrypt rounds = ${this.rounds}`);
  }

  hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.rounds);
  }

  verify(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }

  generateTemporary(): string {
    // 4 chars from each of the 4 alphabets — guaranteed mix.
    const groups = [ALPHABET_LOWER, ALPHABET_UPPER, DIGITS, SPECIAL];
    const out: string[] = [];
    for (const group of groups) {
      for (let i = 0; i < 3; i++) out.push(this.pick(group));
    }
    // Shuffle to remove the obvious group ordering.
    return this.shuffle(out).join('');
  }

  private pick(alphabet: string): string {
    const buf = randomBytes(1);
    return alphabet[buf[0] % alphabet.length];
  }

  private shuffle(arr: string[]): string[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randomBytes(1)[0] % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
