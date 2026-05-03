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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = require("decimal.js");
const articles_service_1 = require("../articles/articles.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const audit_action_1 = require("../common/audit-action");
const stock_status_1 = require("../common/stock-status");
const organizations_service_1 = require("../organizations/organizations.service");
const procurements_service_1 = require("../procurements/procurements.service");
const stock_service_1 = require("../stock/stock.service");
const users_service_1 = require("../users/users.service");
const warehouses_service_1 = require("../warehouses/warehouses.service");
const ACTIVITY_LIMIT = 10;
const ACTIVITY_HIDDEN_ACTIONS = new Set([audit_action_1.AuditAction.USER_LOGGED_IN]);
let DashboardService = class DashboardService {
    orgs;
    warehouses;
    articles;
    stock;
    procurements;
    auditLog;
    users;
    constructor(orgs, warehouses, articles, stock, procurements, auditLog, users) {
        this.orgs = orgs;
        this.warehouses = warehouses;
        this.articles = articles;
        this.stock = stock;
        this.procurements = procurements;
        this.auditLog = auditLog;
        this.users = users;
    }
    async getOverview(organizationId) {
        const org = await this.orgs.requireById(organizationId);
        const currency = org.currency;
        const [warehouses, articles] = await Promise.all([
            this.warehouses.list(organizationId),
            this.articles.list({ organizationId }),
        ]);
        const stockByWarehouse = new Map();
        for (const w of warehouses) {
            stockByWarehouse.set(w.id, await this.stock.getByWarehouse(w.id));
        }
        const stockByArticle = new Map();
        for (const w of warehouses) {
            for (const e of stockByWarehouse.get(w.id) ?? []) {
                const list = stockByArticle.get(e.articleId) ?? [];
                list.push(e);
                stockByArticle.set(e.articleId, list);
            }
        }
        const articleById = new Map();
        for (const a of articles)
            articleById.set(a.id, a);
        const perWarehouse = warehouses.map((w) => {
            const entries = stockByWarehouse.get(w.id) ?? [];
            let totalQty = new decimal_js_1.Decimal(0);
            let totalValue = new decimal_js_1.Decimal(0);
            let articleCount = 0;
            for (const e of entries) {
                if (e.quantity.isZero())
                    continue;
                articleCount += 1;
                totalQty = totalQty.plus(e.quantity);
                const a = articleById.get(e.articleId);
                if (a) {
                    totalValue = totalValue.plus(e.quantity.times(a.purchasePrice.amount));
                }
            }
            return {
                warehouseId: w.id,
                name: w.name,
                color: w.color,
                initials: w.initials(),
                articleCount,
                totalQuantity: totalQty,
                totalValue,
                currency,
            };
        });
        const lowStockCount = articles.reduce((acc, a) => {
            const overall = computeOverallStatus(a, stockByArticle.get(a.id) ?? []);
            return overall === stock_status_1.StockStatus.WARNING || overall === stock_status_1.StockStatus.CRITICAL
                ? acc + 1
                : acc;
        }, 0);
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayProcurementsCount = await this.procurements.countCreatedSince(organizationId, todayStart);
        const counts = {
            warehouses: warehouses.length,
            articles: articles.length,
            lowStockCount,
            todayProcurementsCount,
        };
        const recentActivity = await this.buildRecentActivity(organizationId);
        return { counts, perWarehouse, recentActivity };
    }
    async buildRecentActivity(organizationId) {
        const raw = await this.auditLog.listRecent(organizationId, ACTIVITY_LIMIT * 5);
        const entries = raw
            .filter((e) => !ACTIVITY_HIDDEN_ACTIONS.has(e.action))
            .slice(0, ACTIVITY_LIMIT);
        if (entries.length === 0)
            return [];
        const userIds = new Set(entries.map((e) => e.userId));
        const users = await this.users.listByOrg(organizationId);
        const userById = new Map(users.filter((u) => userIds.has(u.id)).map((u) => [u.id, u]));
        return entries.map((e) => {
            const u = userById.get(e.userId);
            return {
                id: e.id,
                action: e.action,
                entityType: e.entityType,
                entityId: e.entityId,
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
                createdAt: e.createdAt,
            };
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService,
        warehouses_service_1.WarehousesService,
        articles_service_1.ArticlesService,
        stock_service_1.StockService,
        procurements_service_1.ProcurementsService,
        audit_log_service_1.AuditLogService,
        users_service_1.UsersService])
], DashboardService);
function computeOverallStatus(article, entries) {
    if (entries.length === 0)
        return stock_status_1.StockStatus.UNKNOWN;
    let worst = stock_status_1.StockStatus.OK;
    for (const e of entries) {
        const s = (0, stock_status_1.computeStockStatus)(e.quantity, article.thresholdWarning, article.thresholdCritical);
        if (s === stock_status_1.StockStatus.CRITICAL)
            return stock_status_1.StockStatus.CRITICAL;
        if (s === stock_status_1.StockStatus.WARNING)
            worst = stock_status_1.StockStatus.WARNING;
    }
    return worst;
}
//# sourceMappingURL=dashboard.service.js.map