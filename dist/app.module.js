"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./data/common/prisma/prisma.module");
const articles_module_1 = require("./presentation/articles/articles.module");
const audit_log_module_1 = require("./presentation/audit-log/audit-log.module");
const auth_module_1 = require("./presentation/auth/auth.module");
const categories_module_1 = require("./presentation/categories/categories.module");
const health_module_1 = require("./presentation/common/health/health.module");
const corrections_module_1 = require("./presentation/corrections/corrections.module");
const dashboard_module_1 = require("./presentation/dashboard/dashboard.module");
const organizations_module_1 = require("./presentation/organizations/organizations.module");
const procurements_module_1 = require("./presentation/procurements/procurements.module");
const sales_module_1 = require("./presentation/sales/sales.module");
const stock_module_1 = require("./presentation/stock/stock.module");
const suppliers_module_1 = require("./presentation/suppliers/suppliers.module");
const transfers_module_1 = require("./presentation/transfers/transfers.module");
const users_module_1 = require("./presentation/users/users.module");
const warehouses_module_1 = require("./presentation/warehouses/warehouses.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            audit_log_module_1.AuditLogModule,
            organizations_module_1.OrganizationsModule,
            categories_module_1.CategoriesModule,
            warehouses_module_1.WarehousesModule,
            suppliers_module_1.SuppliersModule,
            stock_module_1.StockModule,
            articles_module_1.ArticlesModule,
            procurements_module_1.ProcurementsModule,
            corrections_module_1.CorrectionsModule,
            transfers_module_1.TransfersModule,
            sales_module_1.SalesModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            dashboard_module_1.DashboardModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map