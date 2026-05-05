import { Injectable } from '@nestjs/common';
import { JwtTokenService } from '../auth/jwt-token.service';
import { PasswordHasher } from '../common/password-hasher';
import { AdminInvalidCredentialsError } from './admin.errors';
import { AdminUsersRepository } from './admin-users.repository';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly repo: AdminUsersRepository,
    private readonly hasher: PasswordHasher,
    private readonly jwt: JwtTokenService,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const admin = await this.repo.findByEmail(email);
    if (!admin) throw new AdminInvalidCredentialsError();

    const valid = await this.hasher.verify(password, admin.passwordHash);
    if (!valid) throw new AdminInvalidCredentialsError();

    const accessToken = await this.jwt.issueAdminToken({ adminId: admin.id });
    return { accessToken };
  }
}
