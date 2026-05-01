"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const password_hasher_1 = require("../../data/common/password-hasher");
const users_repository_1 = require("../../data/users/users.repository");
const password_hasher_2 = require("../../domain/common/password-hasher");
const users_repository_2 = require("../../domain/users/users.repository");
const users_service_1 = require("../../domain/users/users.service");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const organizations_module_1 = require("../organizations/organizations.module");
const users_controller_1 = require("./users.controller");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [audit_log_module_1.AuditLogModule, organizations_module_1.OrganizationsModule],
        controllers: [users_controller_1.UsersController],
        providers: [
            { provide: users_repository_2.UsersRepository, useClass: users_repository_1.PrismaUsersRepository },
            { provide: password_hasher_2.PasswordHasher, useClass: password_hasher_1.BcryptPasswordHasher },
            users_service_1.UsersService,
        ],
        exports: [users_service_1.UsersService, password_hasher_2.PasswordHasher],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map