import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLogEntry, AuditLogInput } from '../../domain/audit-log/audit-log.domain';
import { AuditLogRepository } from '../../domain/audit-log/audit-log.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditLogMapper } from './audit-log.mapper';

@Injectable()
export class PrismaAuditLogRepository extends AuditLogRepository {
  private readonly mapper = new AuditLogMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** Returns the active client — `tx` if inside a transaction, otherwise the global instance. */
  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(input: AuditLogInput, tx?: TxClient): Promise<void> {
    await this.client(tx).auditLog.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before === undefined ? Prisma.JsonNull : (input.before as Prisma.InputJsonValue),
        after: input.after === undefined ? Prisma.JsonNull : (input.after as Prisma.InputJsonValue),
      },
    });
  }

  async findRecentByOrg(
    organizationId: string,
    limit: number,
    tx?: TxClient,
  ): Promise<AuditLogEntry[]> {
    const rows = await this.client(tx).auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async findByEntity(
    organizationId: string,
    entityType: string,
    entityId: string,
    page: number,
    pageSize: number,
    tx?: TxClient,
  ): Promise<{ items: AuditLogEntry[]; total: number }> {
    const where = { organizationId, entityType, entityId };
    const client = this.client(tx);

    const [rows, total] = await Promise.all([
      client.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      client.auditLog.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.mapper.toDomain(r)),
      total,
    };
  }

  async listPaginated(
    opts: { organizationId?: string; page: number; pageSize: number },
    tx?: TxClient,
  ): Promise<{ items: AuditLogEntry[]; total: number }> {
    const where = opts.organizationId ? { organizationId: opts.organizationId } : {};
    const client = this.client(tx);
    const [rows, total] = await Promise.all([
      client.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
      }),
      client.auditLog.count({ where }),
    ]);
    return { items: rows.map((r) => this.mapper.toDomain(r)), total };
  }

  async findArticleHistory(
    organizationId: string,
    articleId: string,
    page: number,
    pageSize: number,
    tx?: TxClient,
  ): Promise<{ items: AuditLogEntry[]; total: number }> {
    const where: Prisma.AuditLogWhereInput = {
      organizationId,
      OR: [
        { entityType: 'Article', entityId: articleId },
        {
          entityType: 'StockCorrection',
          after: { path: ['articleId'], equals: articleId },
        },
      ],
    };
    const client = this.client(tx);

    const [rows, total] = await Promise.all([
      client.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      client.auditLog.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.mapper.toDomain(r)),
      total,
    };
  }
}
