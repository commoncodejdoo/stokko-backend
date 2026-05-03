"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcurementsModule = void 0;
const common_1 = require("@nestjs/common");
const procurements_repository_1 = require("../../data/procurements/procurements.repository");
const procurements_repository_2 = require("../../domain/procurements/procurements.repository");
const procurements_service_1 = require("../../domain/procurements/procurements.service");
const articles_module_1 = require("../articles/articles.module");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const organizations_module_1 = require("../organizations/organizations.module");
const stock_module_1 = require("../stock/stock.module");
const suppliers_module_1 = require("../suppliers/suppliers.module");
const warehouses_module_1 = require("../warehouses/warehouses.module");
const procurements_controller_1 = require("./procurements.controller");
let ProcurementsModule = class ProcurementsModule {
};
exports.ProcurementsModule = ProcurementsModule;
exports.ProcurementsModule = ProcurementsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            organizations_module_1.OrganizationsModule,
            suppliers_module_1.SuppliersModule,
            warehouses_module_1.WarehousesModule,
            articles_module_1.ArticlesModule,
            stock_module_1.StockModule,
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [procurements_controller_1.ProcurementsController],
        providers: [
            { provide: procurements_repository_2.ProcurementsRepository, useClass: procurements_repository_1.PrismaProcurementsRepository },
            procurements_service_1.ProcurementsService,
        ],
        exports: [procurements_service_1.ProcurementsService],
    })
], ProcurementsModule);
//# sourceMappingURL=procurements.module.js.map