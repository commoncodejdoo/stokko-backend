import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Article } from '../../domain/articles/article.domain';
import { ArticlesService } from '../../domain/articles/articles.service';
import { AuditLogService } from '../../domain/audit-log/audit-log.service';
import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import { StockStatus } from '../../domain/common/stock-status';
import { StockEntry } from '../../domain/stock/stock-entry.domain';
import { StockService } from '../../domain/stock/stock.service';
import { UsersService } from '../../domain/users/users.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CreateArticleDto, ListArticlesQueryDto, UpdateArticleDto } from './articles.dto';

@Controller('articles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArticlesController {
  constructor(
    private readonly service: ArticlesService,
    private readonly stock: StockService,
    private readonly auditLog: AuditLogService,
    private readonly users: UsersService,
  ) {}

  @Get()
  async list(@Query() q: ListArticlesQueryDto, @CurrentUser() ctx: AuthContext) {
    const articles = await this.service.list({
      organizationId: ctx.organizationId,
      search: q.q,
      categoryId: q.categoryId,
      supplierId: q.supplierId,
    });

    // Attach stock for each article.
    const result = [];
    for (const a of articles) {
      const stock = await this.stock.getByArticle(a.id);
      const overall = this.overallStatus(a, stock);
      if (q.status === 'low' && overall === StockStatus.OK) continue;
      result.push(this.toListItem(a, stock, overall));
    }

    return { items: result };
  }

  @Get(':id')
  async detail(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const { article, stock } = await this.service.getWithStock(id, ctx.organizationId);
    return this.toDetail(article, stock);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(@Body() body: CreateArticleDto, @CurrentUser() ctx: AuthContext) {
    const { article, stock } = await this.service.create(body, ctx);
    return this.toDetail(article, stock);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateArticleDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const article = await this.service.update(id, body, ctx);
    const stock = await this.stock.getByArticle(article.id);
    return this.toDetail(article, stock);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(204)
  async delete(@Param('id') id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    await this.service.softDelete(id, ctx);
  }

  /**
   * Article history — audit entries that touch this article. Includes
   * direct article changes (CREATED/UPDATED/DELETED) and stock corrections
   * for it. Procurements are tracked separately for now.
   */
  @Get(':id/history')
  async history(
    @Param('id') id: string,
    @Query('page') pageParam: string | undefined,
    @Query('pageSize') pageSizeParam: string | undefined,
    @CurrentUser() ctx: AuthContext,
  ) {
    // Confirm the article exists + belongs to this org before exposing history.
    await this.service.requireById(id, ctx.organizationId);
    const page = pageParam ? Number(pageParam) : 1;
    const pageSize = pageSizeParam ? Number(pageSizeParam) : 50;
    const { items, total } = await this.auditLog.listArticleHistory(
      ctx.organizationId,
      id,
      page,
      pageSize,
    );

    // Enrich userId → user actor — same shape as the dashboard activity
    // feed so the mobile UI can reuse its renderer.
    const userIds = new Set(items.map((e) => e.userId));
    const users = userIds.size
      ? await this.users.listByOrg(ctx.organizationId)
      : [];
    const userById = new Map(
      users.filter((u) => userIds.has(u.id)).map((u) => [u.id, u]),
    );

    return {
      items: items.map((e) => {
        const u = userById.get(e.userId);
        return {
          id: e.id,
          action: e.action,
          entityType: e.entityType,
          entityId: e.entityId,
          userId: e.userId,
          user: u
            ? {
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                fullName: u.fullName(),
                initials: u.initials(),
              }
            : null,
          before: e.before,
          after: e.after,
          createdAt: e.createdAt.toISOString(),
        };
      }),
      pagination: { page, pageSize, total },
    };
  }

  // ── helpers ──

  private overallStatus(a: Article, stock: StockEntry[]): StockStatus {
    if (stock.length === 0) return StockStatus.UNKNOWN;
    let worst = StockStatus.OK;
    for (const e of stock) {
      const s = a.status(e.quantity);
      if (s === StockStatus.CRITICAL) return StockStatus.CRITICAL;
      if (s === StockStatus.WARNING) worst = StockStatus.WARNING;
    }
    return worst;
  }

  private toListItem(a: Article, stock: StockEntry[], overall: StockStatus) {
    const totalQty = stock.reduce(
      (sum, e) => sum + Number(e.quantity.toFixed(3)),
      0,
    );
    return {
      id: a.id,
      sku: a.sku,
      name: a.name,
      unit: a.unit,
      categoryId: a.categoryId,
      supplierId: a.supplierId,
      purchasePrice: a.purchasePrice.toFixed(),
      salePrice: a.salePrice.toFixed(),
      currency: a.purchasePrice.currency,
      thresholdWarning: a.thresholdWarning.toFixed(3),
      thresholdCritical: a.thresholdCritical.toFixed(3),
      totalQuantity: totalQty.toFixed(3),
      status: overall,
    };
  }

  private toDetail(a: Article, stock: StockEntry[]) {
    const overall = this.overallStatus(a, stock);
    return {
      ...this.toListItem(a, stock, overall),
      stockByWarehouse: stock.map((e) => ({
        warehouseId: e.warehouseId,
        quantity: e.quantity.toFixed(3),
        status: a.status(e.quantity),
      })),
    };
  }
}
