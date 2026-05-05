import { DomainValidationError } from '../common/errors';
import { Role } from '../common/role';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * User — a member of an Organization with a role and login credentials.
 *
 * Multi-tenant rule: every User belongs to exactly one Organization;
 * `email` is unique per organization (the same email may exist in other
 * organizations as a separate account).
 */
export class User {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly role: Role,
    readonly firstName: string,
    readonly lastName: string,
    readonly mustChangePassword: boolean,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {
    if (!EMAIL_RX.test(email)) {
      throw new DomainValidationError(`Invalid email: "${email}"`, { email });
    }
    if (!firstName?.trim()) throw new DomainValidationError('firstName is required');
    if (!lastName?.trim()) throw new DomainValidationError('lastName is required');
    if (!passwordHash) throw new DomainValidationError('passwordHash is required');
  }

  fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  initials(): string {
    const f = this.firstName[0] ?? '';
    const l = this.lastName[0] ?? '';
    return `${f}${l}`.toUpperCase();
  }

  /** Snapshot for audit logs — sensitive fields (passwordHash) are excluded. */
  toSnapshot(): Record<string, unknown> {
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

  /** Public shape — what the API returns to the client. */
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
      createdAt: this.createdAt.toISOString(),
    };
  }
}
