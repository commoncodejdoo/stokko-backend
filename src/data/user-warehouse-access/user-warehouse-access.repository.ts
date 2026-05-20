import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TxClient } from '../../domain/common/transaction';
import {
  UserWarehouseAccessRecord,
  UserWarehouseAccessRepository,
} from '../../domain/user-warehouse-access/user-warehouse-access.repository';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PrismaUserWarehouseAccessRepository extends UserWarehouseAccessRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async listForUser(userId: string, tx?: TxClient): Promise<UserWarehouseAccessRecord[]> {
    const rows = await this.client(tx).userWarehouseAccess.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({ userId: r.userId, warehouseId: r.warehouseId, createdAt: r.createdAt }));
  }

  async listForWarehouse(
    warehouseId: string,
    tx?: TxClient,
  ): Promise<UserWarehouseAccessRecord[]> {
    const rows = await this.client(tx).userWarehouseAccess.findMany({
      where: { warehouseId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({ userId: r.userId, warehouseId: r.warehouseId, createdAt: r.createdAt }));
  }

  async grant(
    userId: string,
    warehouseId: string,
    tx?: TxClient,
  ): Promise<UserWarehouseAccessRecord> {
    const row = await this.client(tx).userWarehouseAccess.upsert({
      where: { userId_warehouseId: { userId, warehouseId } },
      create: { userId, warehouseId },
      update: {},
    });
    return { userId: row.userId, warehouseId: row.warehouseId, createdAt: row.createdAt };
  }

  async revoke(userId: string, warehouseId: string, tx?: TxClient): Promise<void> {
    await this.client(tx).userWarehouseAccess.deleteMany({
      where: { userId, warehouseId },
    });
  }
}
