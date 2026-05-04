import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TxClient } from '../../domain/common/transaction';
import { Sale } from '../../domain/sales/sale.domain';
import {
  CloseShiftInput,
  CreateSaleInput,
  ListShiftsFilter,
  PaginatedShifts,
  SalesRepository,
  ShiftWithSales,
  UpsertShiftInput,
} from '../../domain/sales/sales.repository';
import { Shift } from '../../domain/sales/shift.domain';
import { PrismaService } from '../common/prisma/prisma.service';
import { SalesMapper } from './sales.mapper';

@Injectable()
export class PrismaSalesRepository extends SalesRepository {
  private readonly mapper = new SalesMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async upsertShift(input: UpsertShiftInput, tx?: TxClient): Promise<Shift> {
    const row = await this.client(tx).shift.upsert({
      where: {
        organizationId_date: {
          organizationId: input.organizationId,
          date: input.date,
        },
      },
      update: {},
      create: {
        organizationId: input.organizationId,
        date: input.date,
      },
    });
    return this.mapper.toShift(row, 'EUR');
  }

  async findShiftById(
    id: string,
    currency: string,
    tx?: TxClient,
  ): Promise<Shift | null> {
    const row = await this.client(tx).shift.findUnique({ where: { id } });
    return row ? this.mapper.toShift(row, currency) : null;
  }

  async findShiftWithSales(
    id: string,
    currency: string,
    tx?: TxClient,
  ): Promise<ShiftWithSales | null> {
    const row = await this.client(tx).shift.findUnique({
      where: { id },
      include: { sales: { include: { items: true } } },
    });
    if (!row) return null;
    const shift = this.mapper.toShift(row, currency);
    const sales = row.sales.map((s) => this.mapper.toSale(s, currency));
    return { shift, sales };
  }

  async listShifts(
    filter: ListShiftsFilter,
    currency: string,
    tx?: TxClient,
  ): Promise<PaginatedShifts> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 50;
    const where: Prisma.ShiftWhereInput = { organizationId: filter.organizationId };
    const client = this.client(tx);

    const [rows, total] = await Promise.all([
      client.shift.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      client.shift.count({ where }),
    ]);
    return {
      items: rows.map((r) => this.mapper.toShift(r, currency)),
      total,
    };
  }

  async createSale(
    input: CreateSaleInput,
    currency: string,
    tx?: TxClient,
  ): Promise<Sale> {
    const row = await this.client(tx).sale.create({
      data: {
        organizationId: input.organizationId,
        shiftId: input.shiftId,
        warehouseId: input.warehouseId,
        createdById: input.createdById,
        items: {
          create: input.items.map((i) => ({
            articleId: i.articleId,
            quantity: new Prisma.Decimal(i.quantity.toFixed()),
            unitPrice: new Prisma.Decimal(i.unitPrice.toFixed()),
          })),
        },
      },
      include: { items: true },
    });
    return this.mapper.toSale(row, currency);
  }

  async closeShift(input: CloseShiftInput, currency: string, tx?: TxClient): Promise<Shift> {
    const row = await this.client(tx).shift.update({
      where: { id: input.shiftId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedById: input.closedById,
        totalQuantity: new Prisma.Decimal(input.totalQuantity.toFixed()),
        totalRevenue: new Prisma.Decimal(input.totalRevenueAmount.toFixed()),
      },
    });
    return this.mapper.toShift(row, currency);
  }

  async deleteShift(id: string, tx?: TxClient): Promise<void> {
    await this.client(tx).shift.delete({ where: { id } });
  }
}
