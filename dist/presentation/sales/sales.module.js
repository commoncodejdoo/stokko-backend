"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const sales_repository_1 = require("../../data/sales/sales.repository");
const sales_report_service_1 = require("../../domain/sales/sales-report.service");
const sales_repository_2 = require("../../domain/sales/sales.repository");
const sales_service_1 = require("../../domain/sales/sales.service");
const articles_module_1 = require("../articles/articles.module");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const organizations_module_1 = require("../organizations/organizations.module");
const stock_module_1 = require("../stock/stock.module");
const warehouses_module_1 = require("../warehouses/warehouses.module");
const sales_report_controller_1 = require("./sales-report.controller");
const shifts_controller_1 = require("./shifts.controller");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            organizations_module_1.OrganizationsModule,
            warehouses_module_1.WarehousesModule,
            articles_module_1.ArticlesModule,
            stock_module_1.StockModule,
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [shifts_controller_1.ShiftsController, sales_report_controller_1.SalesReportController],
        providers: [
            { provide: sales_repository_2.SalesRepository, useClass: sales_repository_1.PrismaSalesRepository },
            sales_service_1.SalesService,
            sales_report_service_1.SalesReportService,
        ],
        exports: [sales_service_1.SalesService, sales_report_service_1.SalesReportService],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map