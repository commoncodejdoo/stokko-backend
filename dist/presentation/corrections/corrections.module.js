"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrectionsModule = void 0;
const common_1 = require("@nestjs/common");
const corrections_repository_1 = require("../../data/corrections/corrections.repository");
const corrections_repository_2 = require("../../domain/corrections/corrections.repository");
const corrections_service_1 = require("../../domain/corrections/corrections.service");
const articles_module_1 = require("../articles/articles.module");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const organizations_module_1 = require("../organizations/organizations.module");
const stock_module_1 = require("../stock/stock.module");
const warehouses_module_1 = require("../warehouses/warehouses.module");
const corrections_controller_1 = require("./corrections.controller");
let CorrectionsModule = class CorrectionsModule {
};
exports.CorrectionsModule = CorrectionsModule;
exports.CorrectionsModule = CorrectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            organizations_module_1.OrganizationsModule,
            articles_module_1.ArticlesModule,
            warehouses_module_1.WarehousesModule,
            stock_module_1.StockModule,
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [corrections_controller_1.CorrectionsController],
        providers: [
            { provide: corrections_repository_2.CorrectionsRepository, useClass: corrections_repository_1.PrismaCorrectionsRepository },
            corrections_service_1.CorrectionsService,
        ],
        exports: [corrections_service_1.CorrectionsService],
    })
], CorrectionsModule);
//# sourceMappingURL=corrections.module.js.map