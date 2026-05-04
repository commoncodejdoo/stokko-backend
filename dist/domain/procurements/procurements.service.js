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
exports.ProcurementsService = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = require("decimal.js");
const articles_service_1 = require("../articles/articles.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const audit_action_1 = require("../common/audit-action");
const errors_1 = require("../common/errors");
const organizations_service_1 = require("../organizations/organizations.service");
const stock_service_1 = require("../stock/stock.service");
const suppliers_service_1 = require("../suppliers/suppliers.service");
const warehouses_service_1 = require("../warehouses/warehouses.service");
const prisma_service_1 = require("../../data/common/prisma/prisma.service");
const procurements_repository_1 = require("./procurements.repository");
let ProcurementsService = class ProcurementsService {
    repo;
    orgs;
    suppliers;
    warehouses;
    articles;
    stock;
    auditLog;
    prisma;
    constructor(repo, orgs, suppliers, warehouses, articles, stock, auditLog, prisma) {
        this.repo = repo;
        this.orgs = orgs;
        this.suppliers = suppliers;
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
        return this.prisma.$transaction(async (tx) => {
            const org = await this.orgs.requireById(ctx.organizationId, tx);
            const supplierId = cmd.supplierId ?? null;
            if (supplierId) {
                await this.suppliers.requireById(supplierId, ctx.organizationId, tx);
            }
            await this.warehouses.requireById(cmd.warehouseId, ctx.organizationId, tx);
            for (const item of cmd.items) {
                await this.articles.requireById(item.articleId, ctx.organizationId, tx);
            }
            const created = await this.repo.create({
                organizationId: ctx.organizationId,
                supplierId,
                warehouseId: cmd.warehouseId,
                createdById: ctx.userId,
                note: cmd.note ?? null,
                items: cmd.items.map((i) => ({
                    articleId: i.articleId,
                    quantity: new decimal_js_1.Decimal(i.quantity),
                    purchasePrice: new decimal_js_1.Decimal(i.purchasePrice),
                })),
            }, org.currency, tx);
            for (const item of created.items) {
                await this.stock.increment(item.articleId, created.warehouseId, item.quantity, tx);
            }
            await this.auditLog.record({
                organizationId: ctx.organizationId,
                userId: ctx.userId,
                action: audit_action_1.AuditAction.PROCUREMENT_CREATED,
                entityType: 'Procurement',
                entityId: created.id,
                before: null,
                after: created.toSnapshot(),
            }, tx);
            return created;
        });
    }
    async findById(id, organizationId, tx) {
        const org = await this.orgs.requireById(organizationId, tx);
        const p = await this.repo.findById(id, org.currency, tx);
        if (!p)
            throw new errors_1.EntityNotFoundError('Procurement', id);
        if (p.organizationId !== organizationId) {
            throw new errors_1.CrossOrgAccessError('Procurement', id);
        }
        return p;
    }
    async list(filter, tx) {
        const org = await this.orgs.requireById(filter.organizationId, tx);
        return this.repo.list(filter, org.currency, tx);
    }
    async countCreatedSince(organizationId, since, tx) {
        return this.repo.countCreatedSince(organizationId, since, tx);
    }
};
exports.ProcurementsService = ProcurementsService;
exports.ProcurementsService = ProcurementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [procurements_repository_1.ProcurementsRepository,
        organizations_service_1.OrganizationsService,
        suppliers_service_1.SuppliersService,
        warehouses_service_1.WarehousesService,
        articles_service_1.ArticlesService,
        stock_service_1.StockService,
        audit_log_service_1.AuditLogService,
        prisma_service_1.PrismaService])
], ProcurementsService);
//# sourceMappingURL=procurements.service.js.map