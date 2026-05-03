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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = require("decimal.js");
const errors_1 = require("../common/errors");
const stock_repository_1 = require("./stock.repository");
let StockService = class StockService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async getByArticle(articleId, tx) {
        return this.repo.findByArticle(articleId, tx);
    }
    async getByWarehouse(warehouseId, tx) {
        return this.repo.findByWarehouse(warehouseId, tx);
    }
    async getByArticleAndWarehouse(articleId, warehouseId, tx) {
        return this.repo.findByArticleAndWarehouse(articleId, warehouseId, tx);
    }
    async setQuantity(articleId, warehouseId, quantity, tx) {
        const dec = quantity instanceof decimal_js_1.Decimal ? quantity : new decimal_js_1.Decimal(quantity);
        if (dec.isNegative()) {
            throw new errors_1.DomainValidationError('Stock quantity cannot be negative');
        }
        return this.repo.setQuantity(articleId, warehouseId, dec, tx);
    }
    async increment(articleId, warehouseId, delta, tx) {
        const dec = delta instanceof decimal_js_1.Decimal ? delta : new decimal_js_1.Decimal(delta);
        return this.repo.increment(articleId, warehouseId, dec, tx);
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stock_repository_1.StockRepository])
], StockService);
//# sourceMappingURL=stock.service.js.map