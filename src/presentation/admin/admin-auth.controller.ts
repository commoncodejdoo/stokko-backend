import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AdminAuthService } from '../../domain/admin/admin-auth.service';
import { AdminLoginDto } from './admin.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuth: AdminAuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: AdminLoginDto) {
    const { accessToken } = await this.adminAuth.login(body.email, body.password);
    return { accessToken };
  }
}
