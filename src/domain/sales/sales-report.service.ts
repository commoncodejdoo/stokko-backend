import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { ArticlesService } from '../articles/articles.service';
import { TxClient } from '../common/transaction';
import { OrganizationsService } from '../organizations/organizations.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';

export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export interface ReportRange {
  from: Date;
  to: Date;
  label: string;
}

export interface ReportTotals {
  /** Decimal string. */
  qty: string;
  /** Decimal string. */
  revenue: string;
  currency: string;
}

export interface ReportByDateBucket {
  /** YYYY-MM-DD. */
  date: string;
  qty: string;
  revenue: string;
}

export interface ReportByArticleBucket {
  articleId: string;
  name: string;
  qty: string;
  revenue: string;
}

export interface ReportShiftEntry {
  id: string;
  /** ISO 8601 date (no time). */
  date: string;
  status: 'OPEN' | 'CLOSED';
  closedAt: string | null;
  closedBy: { id: string; firstName: string; lastName: string; initials: string } | null;
  totalQuantity: string;
  totalRevenue: string;
}

export interface SalesReport {
  period: ReportRange & { kind: ReportPeriod; offset: number };
  totals: ReportTotals;
  byDate: ReportByDateBucket[];
  byArticle: ReportByArticleBucket[];
  shifts: ReportShiftEntry[];
}

@Injectable()
export class SalesReportService {
  constructor(
    private readonly orgs: OrganizationsService,
    private readonly articles: ArticlesService,
    private readonly prisma: PrismaService,
  ) {}

  async getReport(
    organizationId: string,
    period: ReportPeriod,
    offset: number,
    tx?: TxClient,
  ): Promise<SalesReport> {
    const org = await this.orgs.requireById(organizationId, tx);
    const range = computeRange(period, offset);
    const client = tx ?? this.prisma;

    // Pull every SaleItem joined to its Sale + Article for this period.
    // Volumes are bounded (one Shift per day → per-period max ≈ 365 sales).
    const saleItems = await client.saleItem.findMany({
      where: {
        sale: {
          organizationId,
          createdAt: { gte: range.from, lt: range.to },
        },
      },
      include: {
        sale: { select: { createdAt: true } },
        article: { select: { id: true, name: true } },
      },
    });

    let totalQty = new Decimal(0);
    let totalRevenue = new Decimal(0);

    const byDateMap = new Map<string, { qty: Decimal; revenue: Decimal }>();
    const byArticleMap = new Map<
      string,
      { name: string; qty: Decimal; revenue: Decimal }
    >();

    for (const it of saleItems) {
      const qty = new Decimal(it.quantity.toString());
      const unitPrice = new Decimal(it.unitPrice.toString());
      const lineTotal = qty.times(unitPrice);

      totalQty = totalQty.plus(qty);
      totalRevenue = totalRevenue.plus(lineTotal);

      const dateKey = isoDateUtc(it.sale.createdAt);
      const dateBucket = byDateMap.get(dateKey) ?? {
        qty: new Decimal(0),
        revenue: new Decimal(0),
      };
      byDateMap.set(dateKey, {
        qty: dateBucket.qty.plus(qty),
        revenue: dateBucket.revenue.plus(lineTotal),
      });

      const article = byArticleMap.get(it.articleId) ?? {
        name: it.article.name,
        qty: new Decimal(0),
        revenue: new Decimal(0),
      };
      byArticleMap.set(it.articleId, {
        name: article.name,
        qty: article.qty.plus(qty),
        revenue: article.revenue.plus(lineTotal),
      });
    }

    // Shifts inside the period.
    const shifts = await client.shift.findMany({
      where: {
        organizationId,
        date: { gte: range.from, lt: range.to },
      },
      orderBy: { date: 'desc' },
      include: {
        closedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    const byDate: ReportByDateBucket[] = Array.from(byDateMap.entries())
      .map(([date, v]) => ({
        date,
        qty: v.qty.toFixed(3),
        revenue: v.revenue.toFixed(2),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const byArticle: ReportByArticleBucket[] = Array.from(byArticleMap.entries())
      .map(([articleId, v]) => ({
        articleId,
        name: v.name,
        qty: v.qty.toFixed(3),
        revenue: v.revenue.toFixed(2),
      }))
      .sort((a, b) => Number(b.revenue) - Number(a.revenue));

    return {
      period: { ...range, kind: period, offset },
      totals: {
        qty: totalQty.toFixed(3),
        revenue: totalRevenue.toFixed(2),
        currency: org.currency,
      },
      byDate,
      byArticle,
      shifts: shifts.map((s) => ({
        id: s.id,
        date: isoDateUtc(s.date),
        status: s.status,
        closedAt: s.closedAt?.toISOString() ?? null,
        closedBy: s.closedBy
          ? {
              id: s.closedBy.id,
              firstName: s.closedBy.firstName,
              lastName: s.closedBy.lastName,
              initials: initialsOf(s.closedBy.firstName, s.closedBy.lastName),
            }
          : null,
        totalQuantity: s.totalQuantity.toFixed(3),
        totalRevenue: s.totalRevenue.toFixed(2),
      })),
    };
  }
}

function isoDateUtc(d: Date): string {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

function initialsOf(first: string, last: string): string {
  const a = first?.[0] ?? '';
  const b = last?.[0] ?? '';
  return (a + b).toUpperCase();
}

/**
 * Compute the absolute UTC date window for a given period+offset.
 *   offset 0  → current period (today / this week / this month / this year)
 *   offset 1  → previous period
 *   offset -1 → next period (used when navigating forward from a past period)
 *
 * Range is `[from, to)` — `to` is exclusive (start of the next bucket).
 */
function computeRange(period: ReportPeriod, offset: number): ReportRange {
  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  switch (period) {
    case 'day': {
      const from = addDaysUtc(todayUtc, -offset);
      const to = addDaysUtc(from, 1);
      return { from, to, label: dayLabel(from, offset) };
    }
    case 'week': {
      // Monday-based week.
      const dayOfWeek = (todayUtc.getUTCDay() + 6) % 7; // 0=Mon
      const startOfThisWeek = addDaysUtc(todayUtc, -dayOfWeek);
      const from = addDaysUtc(startOfThisWeek, -offset * 7);
      const to = addDaysUtc(from, 7);
      return { from, to, label: weekLabel(from, offset) };
    }
    case 'month': {
      const from = new Date(
        Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth() - offset, 1),
      );
      const to = new Date(
        Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1),
      );
      return { from, to, label: monthLabel(from, offset) };
    }
    case 'year': {
      const from = new Date(Date.UTC(todayUtc.getUTCFullYear() - offset, 0, 1));
      const to = new Date(Date.UTC(from.getUTCFullYear() + 1, 0, 1));
      return { from, to, label: yearLabel(from, offset) };
    }
  }
}

function addDaysUtc(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function dayLabel(_from: Date, offset: number): string {
  if (offset === 0) return 'Danas';
  if (offset === 1) return 'Jučer';
  return _from.toISOString().slice(0, 10);
}

function weekLabel(from: Date, offset: number): string {
  if (offset === 0) return 'Ovaj tjedan';
  if (offset === 1) return 'Prošli tjedan';
  const to = addDaysUtc(from, 6);
  return `${formatDdMm(from)}–${formatDdMm(to)}`;
}

function monthLabel(from: Date, offset: number): string {
  if (offset === 0) return 'Ovaj mjesec';
  if (offset === 1) return 'Prošli mjesec';
  return `${MONTH_HR[from.getUTCMonth()]} ${from.getUTCFullYear()}.`;
}

function yearLabel(from: Date, offset: number): string {
  if (offset === 0) return 'Ova godina';
  if (offset === 1) return 'Prošla godina';
  return `${from.getUTCFullYear()}.`;
}

function formatDdMm(d: Date): string {
  return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.`;
}

const MONTH_HR = [
  'Siječanj',
  'Veljača',
  'Ožujak',
  'Travanj',
  'Svibanj',
  'Lipanj',
  'Srpanj',
  'Kolovoz',
  'Rujan',
  'Listopad',
  'Studeni',
  'Prosinac',
];
