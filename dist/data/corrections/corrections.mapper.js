"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrectionsMapper = void 0;
const decimal_js_1 = require("decimal.js");
const correction_domain_1 = require("../../domain/corrections/correction.domain");
class CorrectionsMapper {
    toDomain(p) {
        return new correction_domain_1.StockCorrection(p.id, p.organizationId, p.articleId, p.warehouseId, p.type, new decimal_js_1.Decimal(p.value.toString()), p.reason, p.note, p.createdById, p.createdAt);
    }
}
exports.CorrectionsMapper = CorrectionsMapper;
//# sourceMappingURL=corrections.mapper.js.map