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
exports.ListCorrectionsQueryDto = exports.CreateCorrectionDto = void 0;
const class_validator_1 = require("class-validator");
const correction_domain_1 = require("../../domain/corrections/correction.domain");
class CreateCorrectionDto {
    articleId;
    warehouseId;
    type;
    value;
    reason;
    note;
}
exports.CreateCorrectionDto = CreateCorrectionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCorrectionDto.prototype, "articleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCorrectionDto.prototype, "warehouseId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(correction_domain_1.CorrectionType),
    __metadata("design:type", String)
], CreateCorrectionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)({}, { message: 'value must be a numeric string' }),
    __metadata("design:type", String)
], CreateCorrectionDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(correction_domain_1.CorrectionReason),
    __metadata("design:type", String)
], CreateCorrectionDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateCorrectionDto.prototype, "note", void 0);
class ListCorrectionsQueryDto {
    articleId;
    warehouseId;
    page;
    pageSize;
}
exports.ListCorrectionsQueryDto = ListCorrectionsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCorrectionsQueryDto.prototype, "articleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCorrectionsQueryDto.prototype, "warehouseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListCorrectionsQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListCorrectionsQueryDto.prototype, "pageSize", void 0);
//# sourceMappingURL=corrections.dto.js.map