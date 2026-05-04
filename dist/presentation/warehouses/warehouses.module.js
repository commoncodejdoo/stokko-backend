"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehousesModule = void 0;
const common_1 = require("@nestjs/common");
const warehouses_repository_1 = require("../../data/warehouses/warehouses.repository");
const warehouses_repository_2 = require("../../domain/warehouses/warehouses.repository");
const warehouses_service_1 = require("../../domain/warehouses/warehouses.service");
const articles_module_1 = require("../articles/articles.module");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const organizations_module_1 = require("../organizations/organizations.module");
const stock_module_1 = require("../stock/stock.module");
const warehouses_controller_1 = require("./warehouses.controller");
let WarehousesModule = class WarehousesModule {
};
exports.WarehousesModule = WarehousesModule;
exports.WarehousesModule = WarehousesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            audit_log_module_1.AuditLogModule,
            stock_module_1.StockModule,
            organizations_module_1.OrganizationsModule,
            (0, common_1.forwardRef)(() => articles_module_1.ArticlesModule),
        ],
        controllers: [warehouses_controller_1.WarehousesController],
        providers: [
            { provide: warehouses_repository_2.WarehousesRepository, useClass: warehouses_repository_1.PrismaWarehousesRepository },
            warehouses_service_1.WarehousesService,
        ],
        exports: [warehouses_service_1.WarehousesService],
    })
], WarehousesModule);
//# sourceMappingURL=warehouses.module.js.map