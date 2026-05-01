"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = void 0;
class DomainError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.DomainError = DomainError;
//# sourceMappingURL=base-domain.error.js.map