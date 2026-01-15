/**
 * @3asoftwares/utils - Shared utility functions
 * @version 1.0.1
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

export * from './api';
export * from './helpers';
export * from './constants';
export * from './validation';
