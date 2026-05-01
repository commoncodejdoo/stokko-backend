import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { RefreshTokenCodec } from '../../domain/auth/refresh-token-codec';

@Injectable()
export class Sha256RefreshTokenCodec extends RefreshTokenCodec {
  generatePlaintext(): string {
    return randomBytes(32).toString('hex');
  }

  hash(plaintext: string): string {
    return createHash('sha256').update(plaintext).digest('hex');
  }
}
