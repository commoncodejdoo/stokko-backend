import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { ArticlesService } from '../articles/articles.service';
import { AuthContext } from '../common/auth-context';
import { TxClient } from '../common/transaction';
import { OrganizationsService } from '../organizations/organizations.service';
import { PredictionsService } from '../predictions/predictions.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { LlmClient } from './llm-client';
import { NarrativesRepository } from './narratives.repository';
import {
  buildDigestUserMessage,
  buildExplainUserMessage,
  SYSTEM_PROMPT_DIGEST,
  SYSTEM_PROMPT_EXPLAIN,
} from './prompts';
import { RecommendationNarrative } from './recommendation-narrative.domain';

/** Per-item explanation cache TTL — 6 hours. */
const EXPLAIN_CACHE_TTL_HOURS = 6;
/** "All clear" fallback when no recommendations exist — skips an LLM call. */
const ALL_CLEAR_BODY = 'Sve zalihe izgledaju u redu. Nema artikala koje treba naručiti.';

@Injectable()
export class NarrativesService {
  private readonly logger = new Logger(NarrativesService.name);

  constructor(
    private readonly repo: NarrativesRepository,
    private readonly llm: LlmClient,
    private readonly orgs: OrganizationsService,
    private readonly articles: ArticlesService,
    private readonly warehouses: WarehousesService,
    private readonly predictions: PredictionsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Returns today's (or a chosen day's) digest. Computes it on demand if
   * missing — usually pre-warmed by the daily cron.
   */
  async getOrGenerateDailyDigest(
    organizationId: string,
    date?: Date,
    tx?: TxClient,
  ): Promise<RecommendationNarrative> {
    await this.orgs.requireById(organizationId, tx);
    const target = date ?? todayUtc();
    const existing = await this.repo.findDigestByDate(organizationId, target, tx);
    if (existing) return existing;
    return this.generateDigestForOrg(organizationId, target);
  }

  /**
   * Generate (and persist) the daily digest narrative for one org.
   * Skips the LLM call entirely when there are no actionable items.
   */
  async generateDigestForOrg(
    organizationId: string,
    date?: Date,
  ): Promise<RecommendationNarrative> {
    const org = await this.orgs.requireById(organizationId);
    const target = date ?? todayUtc();

    const snapshots = await this.predictions.listLatest({ organizationId });
    const criticalSnaps = snapshots.filter((s) => s.urgency === 'CRITICAL');
    const warningSnaps = snapshots.filter((s) => s.urgency === 'WARNING');
    const okSnaps = snapshots.filter((s) => s.urgency === 'OK');
    const shouldReorderCount = snapshots.filter((s) => s.shouldReorder).length;

    // No actionable items — store a fixed string, no LLM call.
    if (criticalSnaps.length === 0 && warningSnaps.length === 0) {
      return this.repo.create({
        organizationId,
        kind: 'DAILY_DIGEST',
        body: ALL_CLEAR_BODY,
        modelUsed: 'fixed-string',
        tokensIn: 0,
        tokensOut: 0,
        cachedTokens: 0,
        costUsd: new Decimal(0),
        validForDate: target,
      });
    }

    const topCritical = await this.resolveTopArticles(
      organizationId,
      criticalSnaps.slice(0, 3),
    );

    const userMessage = buildDigestUserMessage({
      orgName: org.name,
      date: target.toISOString().slice(0, 10),
      criticalCount: criticalSnaps.length,
      warningCount: warningSnaps.length,
      okCount: okSnaps.length,
      shouldReorderCount,
      topCritical,
      anomalies: [], // anomaly-detector integration deferred
    });

    const model = process.env.ANTHROPIC_DAILY_DIGEST_MODEL ?? 'claude-sonnet-4-6';
    const result = await this.llm.complete({
      systemPrompt: SYSTEM_PROMPT_DIGEST,
      userMessage,
      model,
      temperature: 0.3,
      maxTokens: 400,
      cacheSystemPrompt: true,
    });

    return this.repo.create({
      organizationId,
      kind: 'DAILY_DIGEST',
      body: result.body,
      modelUsed: result.modelUsed,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cachedTokens: result.cachedTokens,
      costUsd: result.costUsd,
      validForDate: target,
    });
  }

  /**
   * Per-item explanation. Read-through cache: returns a recent narrative if
   * one exists within EXPLAIN_CACHE_TTL_HOURS, otherwise calls the LLM.
   */
  async explainItem(
    articleId: string,
    warehouseId: string,
    ctx: AuthContext,
  ): Promise<RecommendationNarrative> {
    await this.orgs.requireById(ctx.organizationId);
    const article = await this.articles.requireById(
      articleId,
      ctx.organizationId,
    );
    const warehouse = await this.warehouses.requireById(
      warehouseId,
      ctx.organizationId,
    );
    const snapshot = await this.predictions.findLatestFor(
      ctx.organizationId,
      articleId,
      warehouseId,
    );

    const cutoff = new Date(Date.now() - EXPLAIN_CACHE_TTL_HOURS * 60 * 60 * 1000);
    const cached = await this.repo.findRecentExplanation(
      ctx.organizationId,
      articleId,
      warehouseId,
      cutoff,
    );
    if (cached) return cached;

    const userMessage = buildExplainUserMessage({
      articleName: article.name,
      warehouseName: warehouse.name,
      currentStock: snapshot.currentStock.toFixed(3),
      unit: article.unit,
      avgDailyConsumption: snapshot.avgDailyConsumption?.toFixed(3) ?? null,
      daysOfSupply: snapshot.daysOfSupply?.toFixed(1) ?? null,
      suggestedQty: snapshot.suggestedQty.toFixed(3),
      urgency: snapshot.urgency,
    });

    const model = process.env.ANTHROPIC_EXPLAIN_MODEL ?? 'claude-haiku-4-5-20251001';
    const result = await this.llm.complete({
      systemPrompt: SYSTEM_PROMPT_EXPLAIN,
      userMessage,
      model,
      temperature: 0.2,
      maxTokens: 150,
      cacheSystemPrompt: true,
    });

    return this.repo.create({
      organizationId: ctx.organizationId,
      kind: 'ITEM_EXPLANATION',
      body: result.body,
      articleId,
      warehouseId,
      modelUsed: result.modelUsed,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      cachedTokens: result.cachedTokens,
      costUsd: result.costUsd,
    });
  }

  /**
   * Cron entry — generate today's digest for every active org. Errors per org
   * are logged but do not block the rest.
   */
  async generateDailyDigestForAllOrgs(): Promise<{
    orgsProcessed: number;
    failed: number;
  }> {
    const orgs = await this.prisma.organization.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    let failed = 0;
    for (const org of orgs) {
      try {
        await this.generateDigestForOrg(org.id);
      } catch (err) {
        failed += 1;
        this.logger.error(`Digest failed for org ${org.id}`, err as Error);
      }
    }
    return { orgsProcessed: orgs.length, failed };
  }

  // ─── helpers ───

  private async resolveTopArticles(
    organizationId: string,
    snapshots: Array<{
      articleId: string;
      warehouseId: string;
      currentStock: Decimal;
      daysOfSupply: Decimal | null;
      suggestedQty: Decimal;
    }>,
  ) {
    const out: ReturnType<typeof zip>[] = [];
    for (const s of snapshots) {
      const [article, warehouse] = await Promise.all([
        this.articles.requireById(s.articleId, organizationId),
        this.warehouses.requireById(s.warehouseId, organizationId),
      ]);
      out.push({
        articleName: article.name,
        warehouseName: warehouse.name,
        currentStock: s.currentStock.toFixed(3),
        unit: article.unit,
        daysOfSupply: s.daysOfSupply?.toFixed(1) ?? null,
        suggestedQty: s.suggestedQty.toFixed(3),
      });
    }
    return out;
  }
}

function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

// Helper-only type re-export for the array element shape.
function zip() {
  return {} as {
    articleName: string;
    warehouseName: string;
    currentStock: string;
    unit: string;
    daysOfSupply: string | null;
    suggestedQty: string;
  };
}
