import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Standard JWT bearer auth guard. Apply with `@UseGuards(JwtAuthGuard)`. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
