"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNotFoundError = void 0;
const base_domain_error_1 = require("./base-domain.error");
class EntityNotFoundError extends base_domain_error_1.DomainError {
    statusCode = 404;
    code;
    constructor(entityType, identifier) {
        const idStr = typeof identifier === 'string' ? identifier : JSON.stringify(identifier);
        super(`${entityType} not found (${idStr})`, {
            entityType,
            identifier,
        });
        this.code = `${entityType.toUpperCase().replace(/\s+/g, '_')}_NOT_FOUND`;
    }
}
exports.EntityNotFoundError = EntityNotFoundError;
//# sourceMappingURL=entity-not-found.error.js.map