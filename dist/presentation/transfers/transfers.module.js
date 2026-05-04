"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersModule = void 0;
const common_1 = require("@nestjs/common");
const transfers_repository_1 = require("../../data/transfers/transfers.repository");
const transfers_repository_2 = require("../../domain/transfers/transfers.repository");
const transfers_service_1 = require("../../domain/transfers/transfers.service");
const articles_module_1 = require("../articles/articles.module");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const stock_module_1 = require("../stock/stock.module");
const warehouses_module_1 = require("../warehouses/warehouses.module");
const transfers_controller_1 = require("./transfers.controller");
let TransfersModule = class TransfersModule {
};
exports.TransfersModule = TransfersModule;
exports.TransfersModule = TransfersModule = __decorate([
    (0, common_1.Module)({
        imports: [warehouses_module_1.WarehousesModule, articles_module_1.ArticlesModule, stock_module_1.StockModule, audit_log_module_1.AuditLogModule],
        controllers: [transfers_controller_1.TransfersController],
        providers: [
            { provide: transfers_repository_2.TransfersRepository, useClass: transfers_repository_1.PrismaTransfersRepository },
            transfers_service_1.TransfersService,
        ],
        exports: [transfers_service_1.TransfersService],
    })
], TransfersModule);
//# sourceMappingURL=transfers.module.js.map