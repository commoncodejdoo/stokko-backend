import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Per-request flags that downstream services may consult without needing
 * the raw `AuthContext` threaded through every method call. Populated by
 * `RequestContextInterceptor` after the auth guards have run.
 */
export interface RequestContextStore {
  /** Admin id that opened the current impersonation session, if any. */
  impersonatedBy: string | null;
}

const storage = new AsyncLocalStorage<RequestContextStore>();

export function runWithRequestContext<T>(
  store: RequestContextStore,
  fn: () => T,
): T {
  return storage.run(store, fn);
}

export function getRequestContext(): RequestContextStore | null {
  return storage.getStore() ?? null;
}
