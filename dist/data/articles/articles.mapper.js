"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesMapper = void 0;
const decimal_js_1 = require("decimal.js");
const article_domain_1 = require("../../domain/articles/article.domain");
const money_1 = require("../../domain/common/money");
class ArticlesMapper {
    toDomain(p, currency) {
        return new article_domain_1.Article(p.id, p.organizationId, p.sku, p.name, new money_1.Money(new decimal_js_1.Decimal(p.purchasePrice.toString()), currency), new money_1.Money(new decimal_js_1.Decimal(p.salePrice.toString()), currency), p.unit, p.categoryId, p.supplierId, new decimal_js_1.Decimal(p.thresholdWarning.toString()), new decimal_js_1.Decimal(p.thresholdCritical.toString()), p.createdById, p.deletedAt, p.createdAt, p.updatedAt);
    }
}
exports.ArticlesMapper = ArticlesMapper;
//# sourceMappingURL=articles.mapper.js.map