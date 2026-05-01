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
exports.PrismaAuditLogRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const audit_log_repository_1 = require("../../domain/audit-log/audit-log.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
const audit_log_mapper_1 = require("./audit-log.mapper");
let PrismaAuditLogRepository = class PrismaAuditLogRepository extends audit_log_repository_1.AuditLogRepository {
    prisma;
    mapper = new audit_log_mapper_1.AuditLogMapper();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    async create(input, tx) {
        await this.client(tx).auditLog.create({
            data: {
                organizationId: input.organizationId,
                userId: input.userId,
                action: input.action,
                entityType: input.entityType,
                entityId: input.entityId,
                before: input.before === undefined ? client_1.Prisma.JsonNull : input.before,
                after: input.after === undefined ? client_1.Prisma.JsonNull : input.after,
            },
        });
    }
    async findRecentByOrg(organizationId, limit, tx) {
        const rows = await this.client(tx).auditLog.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return rows.map((r) => this.mapper.toDomain(r));
    }
    async findByEntity(organizationId, entityType, entityId, page, pageSize, tx) {
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
};
exports.PrismaAuditLogRepository = PrismaAuditLogRepository;
exports.PrismaAuditLogRepository = PrismaAuditLogRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAuditLogRepository);
//# sourceMappingURL=audit-log.repository.js.map