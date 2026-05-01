"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainValidationError = void 0;
const base_domain_error_1 = require("./base-domain.error");
class DomainValidationError extends base_domain_error_1.DomainError {
    statusCode = 422;
    code = 'DOMAIN_INVARIANT_VIOLATED';
}
exports.DomainValidationError = DomainValidationError;
//# sourceMappingURL=domain-validation.error.js.map