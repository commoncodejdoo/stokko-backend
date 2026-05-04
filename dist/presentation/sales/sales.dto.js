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
exports.ListShiftsQueryDto = exports.CloseShiftDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ShiftCloseItemDto {
    articleId;
    warehouseId;
    quantity;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ShiftCloseItemDto.prototype, "articleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ShiftCloseItemDto.prototype, "warehouseId", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)({}, { message: 'quantity must be a numeric string' }),
    __metadata("design:type", String)
], ShiftCloseItemDto.prototype, "quantity", void 0);
class CloseShiftDto {
    items;
}
exports.CloseShiftDto = CloseShiftDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ShiftCloseItemDto),
    __metadata("design:type", Array)
], CloseShiftDto.prototype, "items", void 0);
class ListShiftsQueryDto {
    page;
    pageSize;
}
exports.ListShiftsQueryDto = ListShiftsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListShiftsQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListShiftsQueryDto.prototype, "pageSize", void 0);
//# sourceMappingURL=sales.dto.js.map