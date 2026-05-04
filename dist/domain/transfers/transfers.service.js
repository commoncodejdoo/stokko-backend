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
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = require("decimal.js");
const articles_service_1 = require("../articles/articles.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const audit_action_1 = require("../common/audit-action");
const errors_1 = require("../common/errors");
const stock_service_1 = require("../stock/stock.service");
const warehouses_service_1 = require("../warehouses/warehouses.service");
const prisma_service_1 = require("../../data/common/prisma/prisma.service");
const transfers_repository_1 = require("./transfers.repository");
let TransfersService = class TransfersService {
    repo;
    warehouses;
    articles;
    stock;
    auditLog;
    prisma;
    constructor(repo, warehouses, articles, stock, auditLog, prisma) {
        this.repo = repo;
        this.warehouses = warehouses;
        this.articles = articles;
        this.stock = stock;
        this.auditLog = auditLog;
        this.prisma = prisma;
    }
    async create(cmd, ctx) {
        if (!cmd.items?.length) {
            throw new errors_1.DomainValidationError('At least one item is required');
        }
        if (cmd.sourceWarehouseId === cmd.destinationWarehouseId) {
            throw new errors_1.DomainValidationError('Source and destination warehouse must differ');
        }
        return this.prisma.$transaction(async (tx) => {
            await this.warehouses.requireById(cmd.sourceWarehouseId, ctx.organizationId, tx);
            await this.warehouses.requireById(cmd.destinationWarehouseId, ctx.organizationId, tx);
            for (const item of cmd.items) {
                await this.articles.requireById(item.articleId, ctx.organizationId, tx);
            }
            const aggregated = new Map();
            for (const it of cmd.items) {
                const qty = new decimal_js_1.Decimal(it.quantity);
                if (qty.isNegative() || qty.isZero()) {
                    throw new errors_1.DomainValidationError('Transfer item quantity must be > 0', { articleId: it.articleId, quantity: qty.toFixed() });
                }
                aggregated.set(it.articleId, (aggregated.get(it.articleId) ?? new decimal_js_1.Decimal(0)).plus(qty));
            }
            for (const [articleId, qty] of aggregated.entries()) {
                await this.stock.increment(articleId, cmd.sourceWarehouseId, qty.negated(), tx);
                await this.stock.increment(articleId, cmd.destinationWarehouseId, qty, tx);
            }
            const created = await this.repo.create({
                organizationId: ctx.organizationId,
                sourceWarehouseId: cmd.sourceWarehouseId,
                destinationWarehouseId: cmd.destinationWarehouseId,
                createdById: ctx.userId,
                note: cmd.note ?? null,
                items: Array.from(aggregated.entries()).map(([articleId, quantity]) => ({
                    articleId,
                    quantity,
                })),
            }, tx);
            await this.auditLog.record({
                organizationId: ctx.organizationId,
                userId: ctx.userId,
                action: audit_action_1.AuditAction.TRANSFER_CREATED,
                entityType: 'StockTransfer',
                entityId: created.id,
                before: null,
                after: created.toSnapshot(),
            }, tx);
            return created;
        });
    }
    async findById(id, organizationId, tx) {
        const t = await this.repo.findById(id, tx);
        if (!t)
            throw new errors_1.EntityNotFoundError('StockTransfer', id);
        if (t.organizationId !== organizationId) {
            throw new errors_1.CrossOrgAccessError('StockTransfer', id);
        }
        return t;
    }
    async list(filter, tx) {
        return this.repo.list(filter, tx);
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [transfers_repository_1.TransfersRepository,
        warehouses_service_1.WarehousesService,
        articles_service_1.ArticlesService,
        stock_service_1.StockService,
        audit_log_service_1.AuditLogService,
        prisma_service_1.PrismaService])
], TransfersService);
//# sourceMappingURL=transfers.service.js.map