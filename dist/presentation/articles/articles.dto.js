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
exports.ListArticlesQueryDto = exports.UpdateArticleDto = exports.CreateArticleDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const unit_1 = require("../../domain/common/unit");
class InitialStockDto {
    warehouseId;
    quantity;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitialStockDto.prototype, "warehouseId", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)({ no_symbols: false }, { message: 'quantity must be a numeric string' }),
    __metadata("design:type", String)
], InitialStockDto.prototype, "quantity", void 0);
class CreateArticleDto {
    sku;
    name;
    purchasePrice;
    salePrice;
    unit;
    categoryId;
    supplierId;
    thresholdWarning;
    thresholdCritical;
    initialStock;
}
exports.CreateArticleDto = CreateArticleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "sku", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)({}, { message: 'purchasePrice must be a numeric string' }),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)({}, { message: 'salePrice must be a numeric string' }),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "salePrice", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(unit_1.Unit),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CreateArticleDto.prototype, "supplierId", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)({}, { message: 'thresholdWarning must be a numeric string' }),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "thresholdWarning", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)({}, { message: 'thresholdCritical must be a numeric string' }),
    __metadata("design:type", String)
], CreateArticleDto.prototype, "thresholdCritical", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InitialStockDto),
    __metadata("design:type", Array)
], CreateArticleDto.prototype, "initialStock", void 0);
class UpdateArticleDto {
    sku;
    name;
    purchasePrice;
    salePrice;
    unit;
    categoryId;
    supplierId;
    thresholdWarning;
    thresholdCritical;
}
exports.UpdateArticleDto = UpdateArticleDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "sku", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "salePrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(unit_1.Unit),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateArticleDto.prototype, "supplierId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "thresholdWarning", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], UpdateArticleDto.prototype, "thresholdCritical", void 0);
class ListArticlesQueryDto {
    q;
    categoryId;
    status;
    page;
    pageSize;
    page_min;
}
exports.ListArticlesQueryDto = ListArticlesQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListArticlesQueryDto.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListArticlesQueryDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListArticlesQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListArticlesQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListArticlesQueryDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ListArticlesQueryDto.prototype, "page_min", void 0);
//# sourceMappingURL=articles.dto.js.map