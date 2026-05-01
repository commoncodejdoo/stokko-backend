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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../common/errors");
const organizations_repository_1 = require("./organizations.repository");
let OrganizationsService = class OrganizationsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(input, tx) {
        return this.repo.create(input, tx);
    }
    async findById(id, tx) {
        return this.repo.findById(id, tx);
    }
    async requireById(id, tx) {
        const org = await this.repo.findById(id, tx);
        if (!org)
            throw new errors_1.EntityNotFoundError('Organization', id);
        return org;
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [organizations_repository_1.OrganizationsRepository])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map