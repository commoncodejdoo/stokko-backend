import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthContext } from '../../domain/common/auth-context';
import { NarrativesService } from '../../domain/narratives/narratives.service';
import { RecommendationNarrative } from '../../domain/narratives/recommendation-narrative.domain';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { ExplainBodyDto, GetDigestQueryDto } from './narratives.dto';

@Controller('narratives')
@UseGuards(JwtAuthGuard)
export class NarrativesController {
  constructor(private readonly service: NarrativesService) {}

  @Get('digest')
  async digest(
    @Query() q: GetDigestQueryDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const date = q.date ? parseDate(q.date) : undefined;
    const narrative = await this.service.getOrGenerateDailyDigest(
      ctx.organizationId,
      date,
    );
    return this.toPublic(narrative);
  }

  @Post('explain')
  async explain(@Body() body: ExplainBodyDto, @CurrentUser() ctx: AuthContext) {
    const narrative = await this.service.explainItem(
      body.articleId,
      body.warehouseId,
      ctx,
    );
    return this.toPublic(narrative);
  }

  private toPublic(n: RecommendationNarrative) {
    return {
      id: n.id,
      kind: n.kind,
      body: n.body,
      articleId: n.articleId,
      warehouseId: n.warehouseId,
      modelUsed: n.modelUsed,
      tokensIn: n.tokensIn,
      tokensOut: n.tokensOut,
      cachedTokens: n.cachedTokens,
      costUsd: n.costUsd.toFixed(6),
      validForDate: n.validForDate?.toISOString().slice(0, 10) ?? null,
      createdAt: n.createdAt.toISOString(),
    };
  }
}

function parseDate(yyyymmdd: string): Date {
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
