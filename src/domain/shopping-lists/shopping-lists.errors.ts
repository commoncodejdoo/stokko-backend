import { DomainError } from '../common/errors/base-domain.error';

export class ActiveShoppingListAlreadyExistsError extends DomainError {
  readonly statusCode = 409;
  readonly code = 'ACTIVE_SHOPPING_LIST_ALREADY_EXISTS';

  constructor(listId: string) {
    super('Već postoji aktivna lista za kupovinu', { listId });
  }
}

export class ShoppingListNotActiveError extends DomainError {
  readonly statusCode = 409;
  readonly code = 'SHOPPING_LIST_NOT_ACTIVE';

  constructor(status: string) {
    super(`Lista nije aktivna (status: ${status})`, { status });
  }
}
