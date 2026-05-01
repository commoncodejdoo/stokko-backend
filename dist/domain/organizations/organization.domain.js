"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const errors_1 = require("../common/errors");
class Organization {
    id;
    name;
    currency;
    isActive;
    createdAt;
    updatedAt;
    constructor(id, name, currency, isActive, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.currency = currency;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        if (!name?.trim()) {
            throw new errors_1.DomainValidationError('Organization name is required');
        }
        if (!/^[A-Z]{3}$/.test(currency)) {
            throw new errors_1.DomainValidationError(`Invalid ISO 4217 currency code: "${currency}"`, { currency });
        }
    }
    toSnapshot() {
        return {
            id: this.id,
            name: this.name,
            currency: this.currency,
            isActive: this.isActive,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}
exports.Organization = Organization;
//# sourceMappingURL=organization.domain.js.map