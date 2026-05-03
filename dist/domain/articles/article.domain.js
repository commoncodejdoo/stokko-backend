"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const decimal_js_1 = require("decimal.js");
const errors_1 = require("../common/errors");
const stock_status_1 = require("../common/stock-status");
class Article {
    id;
    organizationId;
    sku;
    name;
    purchasePrice;
    salePrice;
    unit;
    categoryId;
    supplierId;
    createdById;
    deletedAt;
    createdAt;
    updatedAt;
    thresholdWarning;
    thresholdCritical;
    constructor(id, organizationId, sku, name, purchasePrice, salePrice, unit, categoryId, supplierId, thresholdWarning, thresholdCritical, createdById, deletedAt, createdAt, updatedAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.sku = sku;
        this.name = name;
        this.purchasePrice = purchasePrice;
        this.salePrice = salePrice;
        this.unit = unit;
        this.categoryId = categoryId;
        this.supplierId = supplierId;
        this.createdById = createdById;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        if (!sku?.trim())
            throw new errors_1.DomainValidationError('SKU is required');
        if (!name?.trim())
            throw new errors_1.DomainValidationError('Article name is required');
        const warn = thresholdWarning instanceof decimal_js_1.Decimal ? thresholdWarning : new decimal_js_1.Decimal(thresholdWarning);
        const crit = thresholdCritical instanceof decimal_js_1.Decimal ? thresholdCritical : new decimal_js_1.Decimal(thresholdCritical);
        if (warn.isNegative() || crit.isNegative()) {
            throw new errors_1.DomainValidationError('Thresholds cannot be negative');
        }
        if (crit.greaterThan(warn)) {
            throw new errors_1.DomainValidationError(`thresholdCritical (${crit.toFixed()}) must be <= thresholdWarning (${warn.toFixed()})`, { thresholdCritical: crit.toFixed(), thresholdWarning: warn.toFixed() });
        }
        if (purchasePrice.currency !== salePrice.currency) {
            throw new errors_1.DomainValidationError('purchasePrice and salePrice currencies must match');
        }
        this.thresholdWarning = warn;
        this.thresholdCritical = crit;
    }
    status(quantity) {
        const qty = quantity instanceof decimal_js_1.Decimal ? quantity : new decimal_js_1.Decimal(quantity);
        return (0, stock_status_1.computeStockStatus)(qty, this.thresholdWarning, this.thresholdCritical);
    }
    isDeleted() {
        return this.deletedAt !== null;
    }
    toSnapshot() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            sku: this.sku,
            name: this.name,
            purchasePrice: this.purchasePrice.toFixed(),
            salePrice: this.salePrice.toFixed(),
            currency: this.purchasePrice.currency,
            unit: this.unit,
            categoryId: this.categoryId,
            supplierId: this.supplierId,
            thresholdWarning: this.thresholdWarning.toFixed(3),
            thresholdCritical: this.thresholdCritical.toFixed(3),
            createdById: this.createdById,
            deletedAt: this.deletedAt?.toISOString() ?? null,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}
exports.Article = Article;
//# sourceMappingURL=article.domain.js.map