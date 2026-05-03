"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockCorrection = exports.CorrectionReason = exports.CorrectionType = void 0;
const decimal_js_1 = require("decimal.js");
const errors_1 = require("../common/errors");
var CorrectionType;
(function (CorrectionType) {
    CorrectionType["ABSOLUTE"] = "ABSOLUTE";
    CorrectionType["DELTA"] = "DELTA";
})(CorrectionType || (exports.CorrectionType = CorrectionType = {}));
var CorrectionReason;
(function (CorrectionReason) {
    CorrectionReason["COUNT"] = "COUNT";
    CorrectionReason["WRITE_OFF"] = "WRITE_OFF";
    CorrectionReason["INPUT_ERROR"] = "INPUT_ERROR";
    CorrectionReason["OTHER"] = "OTHER";
})(CorrectionReason || (exports.CorrectionReason = CorrectionReason = {}));
class StockCorrection {
    id;
    organizationId;
    articleId;
    warehouseId;
    type;
    reason;
    note;
    createdById;
    createdAt;
    value;
    constructor(id, organizationId, articleId, warehouseId, type, value, reason, note, createdById, createdAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.articleId = articleId;
        this.warehouseId = warehouseId;
        this.type = type;
        this.reason = reason;
        this.note = note;
        this.createdById = createdById;
        this.createdAt = createdAt;
        const dec = value instanceof decimal_js_1.Decimal ? value : new decimal_js_1.Decimal(value);
        if (type === CorrectionType.ABSOLUTE && dec.isNegative()) {
            throw new errors_1.DomainValidationError('ABSOLUTE correction value must be >= 0', { value: dec.toFixed() });
        }
        if (type === CorrectionType.DELTA && dec.isZero()) {
            throw new errors_1.DomainValidationError('DELTA correction value cannot be zero');
        }
        this.value = dec;
    }
    applyTo(currentQuantity) {
        if (this.type === CorrectionType.ABSOLUTE)
            return this.value;
        return currentQuantity.plus(this.value);
    }
    deltaFrom(currentQuantity) {
        if (this.type === CorrectionType.ABSOLUTE) {
            return this.value.minus(currentQuantity);
        }
        return this.value;
    }
    toSnapshot() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            articleId: this.articleId,
            warehouseId: this.warehouseId,
            type: this.type,
            value: this.value.toFixed(3),
            reason: this.reason,
            note: this.note,
            createdById: this.createdById,
            createdAt: this.createdAt.toISOString(),
        };
    }
}
exports.StockCorrection = StockCorrection;
//# sourceMappingURL=correction.domain.js.map