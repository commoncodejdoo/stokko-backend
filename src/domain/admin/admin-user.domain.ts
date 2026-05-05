export class AdminUser {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
