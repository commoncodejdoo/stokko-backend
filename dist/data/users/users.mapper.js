"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersMapper = void 0;
const user_domain_1 = require("../../domain/users/user.domain");
class UsersMapper {
    toDomain(p) {
        return new user_domain_1.User(p.id, p.organizationId, p.email, p.passwordHash, p.role, p.firstName, p.lastName, p.mustChangePassword, p.isActive, p.createdAt, p.updatedAt);
    }
}
exports.UsersMapper = UsersMapper;
//# sourceMappingURL=users.mapper.js.map