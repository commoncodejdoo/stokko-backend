"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const errors_1 = require("../common/errors");
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class User {
    id;
    organizationId;
    email;
    passwordHash;
    role;
    firstName;
    lastName;
    mustChangePassword;
    isActive;
    createdAt;
    updatedAt;
    constructor(id, organizationId, email, passwordHash, role, firstName, lastName, mustChangePassword, isActive, createdAt, updatedAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.mustChangePassword = mustChangePassword;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        if (!EMAIL_RX.test(email)) {
            throw new errors_1.DomainValidationError(`Invalid email: "${email}"`, { email });
        }
        if (!firstName?.trim())
            throw new errors_1.DomainValidationError('firstName is required');
        if (!lastName?.trim())
            throw new errors_1.DomainValidationError('lastName is required');
        if (!passwordHash)
            throw new errors_1.DomainValidationError('passwordHash is required');
    }
    fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }
    initials() {
        const f = this.firstName[0] ?? '';
        const l = this.lastName[0] ?? '';
        return `${f}${l}`.toUpperCase();
    }
    toSnapshot() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            email: this.email,
            role: this.role,
            firstName: this.firstName,
            lastName: this.lastName,
            mustChangePassword: this.mustChangePassword,
            isActive: this.isActive,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
    toPublic() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            email: this.email,
            role: this.role,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.fullName(),
            initials: this.initials(),
            mustChangePassword: this.mustChangePassword,
            isActive: this.isActive,
        };
    }
}
exports.User = User;
//# sourceMappingURL=user.domain.js.map