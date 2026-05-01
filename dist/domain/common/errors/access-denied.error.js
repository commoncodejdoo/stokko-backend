"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossOrgAccessError = exports.AccessDeniedError = void 0;
const base_domain_error_1 = require("./base-domain.error");
class AccessDeniedError extends base_domain_error_1.DomainError {
    statusCode = 403;
    code = 'ACCESS_DENIED';
}
exports.AccessDeniedError = AccessDeniedError;
class CrossOrgAccessError extends base_domain_error_1.DomainError {
    statusCode = 403;
    code = 'CROSS_ORG_ACCESS_DENIED';
    constructor(entityType, entityId) {
        super('Access denied — entity belongs to a different organization', {
            entityType,
            entityId,
        });
    }
}
exports.CrossOrgAccessError = CrossOrgAccessError;
//# sourceMappingURL=access-denied.error.js.map