import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService, LoginResult } from '../../domain/auth/auth.service';
import type { AuthContext } from '../../domain/common/auth-context';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import {
  ChangePasswordDto,
  ForcedPasswordChangeDto,
  LoginDto,
  RefreshDto,
} from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    const result: LoginResult = await this.auth.login(body.email, body.password);
    if (result.requirePasswordChange) {
      return {
        requirePasswordChange: true as const,
        passwordChangeToken: result.passwordChangeToken,
        user: result.user.toPublic(),
      };
    }
    return {
      requirePasswordChange: false as const,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user.toPublic(),
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: RefreshDto) {
    const tokens = await this.auth.refresh(body.refreshToken);
    return tokens;
  }

  @Post('forced-password-change')
  @HttpCode(200)
  async forcedPasswordChange(@Body() body: ForcedPasswordChangeDto) {
    const result = await this.auth.forcedPasswordChange(
      body.passwordChangeToken,
      body.newPassword,
    );
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user.toPublic(),
    };
  }

  @Post('change-password')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: ChangePasswordDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<void> {
    await this.auth.changePassword(ctx.userId, body.currentPassword, body.newPassword);
  }
}
