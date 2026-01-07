/**
 * Client-safe utilities for browser environments
 * This entry point excludes server-side dependencies like axios/http2
 */

export {
  storeAuth,
  getStoredAuth,
  isTokenExpired,
  willTokenExpireSoon,
  clearAuth,
  validateUserRole,
  getCurrentUser,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
  setupAutoRefresh,
  type AuthTokens,
  type StoredAuth,
} from './auth';

export {
  setCookie,
  getCookie,
  removeCookie,
  areCookiesEnabled,
  AUTH_COOKIE_NAMES,
} from './cookies';

// Export only client-safe helpers
export * from './helpers';
export * from './constants';

// Export client-safe validation (not server validation)
export * from './validation/client';

// Export client-safe logger
export { Logger } from './api/logger.client';

// Export GraphQL query strings (browser-safe, no http dependencies)
export * from './queries';
