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
exports.PrismaUsersRepository = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("../../domain/users/users.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
const users_mapper_1 = require("./users.mapper");
let PrismaUsersRepository = class PrismaUsersRepository extends users_repository_1.UsersRepository {
    prisma;
    mapper = new users_mapper_1.UsersMapper();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    async create(input, tx) {
        const row = await this.client(tx).user.create({
            data: {
                organizationId: input.organizationId,
                email: input.email,
                passwordHash: input.passwordHash,
                role: input.role,
                firstName: input.firstName,
                lastName: input.lastName,
                mustChangePassword: input.mustChangePassword ?? true,
            },
        });
        return this.mapper.toDomain(row);
    }
    async findById(id, tx) {
        const row = await this.client(tx).user.findUnique({ where: { id } });
        return row ? this.mapper.toDomain(row) : null;
    }
    async findByEmailInOrg(email, organizationId, tx) {
        const row = await this.client(tx).user.findUnique({
            where: { organizationId_email: { organizationId, email } },
        });
        return row ? this.mapper.toDomain(row) : null;
    }
    async findAllByEmail(email, tx) {
        const rows = await this.client(tx).user.findMany({ where: { email } });
        return rows.map((r) => this.mapper.toDomain(r));
    }
    async update(id, patch, tx) {
        const row = await this.client(tx).user.update({
            where: { id },
            data: patch,
        });
        return this.mapper.toDomain(row);
    }
    async listByOrg(organizationId, tx) {
        const rows = await this.client(tx).user.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'asc' },
        });
        return rows.map((r) => this.mapper.toDomain(r));
    }
};
exports.PrismaUsersRepository = PrismaUsersRepository;
exports.PrismaUsersRepository = PrismaUsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUsersRepository);
//# sourceMappingURL=users.repository.js.map