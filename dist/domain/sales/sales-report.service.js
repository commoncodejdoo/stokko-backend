"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReportService = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = require("decimal.js");
const articles_service_1 = require("../articles/articles.service");
const organizations_service_1 = require("../organizations/organizations.service");
const prisma_service_1 = require("../../data/common/prisma/prisma.service");
let SalesReportService = class SalesReportService {
    orgs;
    articles;
    prisma;
    constructor(orgs, articles, prisma) {
        this.orgs = orgs;
        this.articles = articles;
        this.prisma = prisma;
    }
    async getReport(organizationId, period, offset, tx) {
        const org = await this.orgs.requireById(organizationId, tx);
        const range = computeRange(period, offset);
        const client = tx ?? this.prisma;
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
        let totalQty = new decimal_js_1.Decimal(0);
        let totalRevenue = new decimal_js_1.Decimal(0);
        const byDateMap = new Map();
        const byArticleMap = new Map();
        for (const it of saleItems) {
            const qty = new decimal_js_1.Decimal(it.quantity.toString());
            const unitPrice = new decimal_js_1.Decimal(it.unitPrice.toString());
            const lineTotal = qty.times(unitPrice);
            totalQty = totalQty.plus(qty);
            totalRevenue = totalRevenue.plus(lineTotal);
            const dateKey = isoDateUtc(it.sale.createdAt);
            const dateBucket = byDateMap.get(dateKey) ?? {
                qty: new decimal_js_1.Decimal(0),
                revenue: new decimal_js_1.Decimal(0),
            };
            byDateMap.set(dateKey, {
                qty: dateBucket.qty.plus(qty),
                revenue: dateBucket.revenue.plus(lineTotal),
            });
            const article = byArticleMap.get(it.articleId) ?? {
                name: it.article.name,
                qty: new decimal_js_1.Decimal(0),
                revenue: new decimal_js_1.Decimal(0),
            };
            byArticleMap.set(it.articleId, {
                name: article.name,
                qty: article.qty.plus(qty),
                revenue: article.revenue.plus(lineTotal),
            });
        }
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
        const byDate = Array.from(byDateMap.entries())
            .map(([date, v]) => ({
            date,
            qty: v.qty.toFixed(3),
            revenue: v.revenue.toFixed(2),
        }))
            .sort((a, b) => a.date.localeCompare(b.date));
        const byArticle = Array.from(byArticleMap.entries())
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
};
exports.SalesReportService = SalesReportService;
exports.SalesReportService = SalesReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService,
        articles_service_1.ArticlesService,
        prisma_service_1.PrismaService])
], SalesReportService);
function isoDateUtc(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
        .toISOString()
        .slice(0, 10);
}
function initialsOf(first, last) {
    const a = first?.[0] ?? '';
    const b = last?.[0] ?? '';
    return (a + b).toUpperCase();
}
function computeRange(period, offset) {
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    switch (period) {
        case 'day': {
            const from = addDaysUtc(todayUtc, -offset);
            const to = addDaysUtc(from, 1);
            return { from, to, label: dayLabel(from, offset) };
        }
        case 'week': {
            const dayOfWeek = (todayUtc.getUTCDay() + 6) % 7;
            const startOfThisWeek = addDaysUtc(todayUtc, -dayOfWeek);
            const from = addDaysUtc(startOfThisWeek, -offset * 7);
            const to = addDaysUtc(from, 7);
            return { from, to, label: weekLabel(from, offset) };
        }
        case 'month': {
            const from = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth() - offset, 1));
            const to = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1));
            return { from, to, label: monthLabel(from, offset) };
        }
        case 'year': {
            const from = new Date(Date.UTC(todayUtc.getUTCFullYear() - offset, 0, 1));
            const to = new Date(Date.UTC(from.getUTCFullYear() + 1, 0, 1));
            return { from, to, label: yearLabel(from, offset) };
        }
    }
}
function addDaysUtc(d, days) {
    return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}
function dayLabel(_from, offset) {
    if (offset === 0)
        return 'Danas';
    if (offset === 1)
        return 'Jučer';
    return _from.toISOString().slice(0, 10);
}
function weekLabel(from, offset) {
    if (offset === 0)
        return 'Ovaj tjedan';
    if (offset === 1)
        return 'Prošli tjedan';
    const to = addDaysUtc(from, 6);
    return `${formatDdMm(from)}–${formatDdMm(to)}`;
}
function monthLabel(from, offset) {
    if (offset === 0)
        return 'Ovaj mjesec';
    if (offset === 1)
        return 'Prošli mjesec';
    return `${MONTH_HR[from.getUTCMonth()]} ${from.getUTCFullYear()}.`;
}
function yearLabel(from, offset) {
    if (offset === 0)
        return 'Ova godina';
    if (offset === 1)
        return 'Prošla godina';
    return `${from.getUTCFullYear()}.`;
}
function formatDdMm(d) {
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
//# sourceMappingURL=sales-report.service.js.map