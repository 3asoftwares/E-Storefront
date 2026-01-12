import { SHELL_APP_URL } from './constants';
import {
  setCookie,
  getCookie,
  removeCookie,
  AUTH_COOKIE_NAMES,
} from './cookies';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface StoredAuth {
  user: any;
  token: string;
  expiresIn: number;
}

// Cookie expiry in days
const ACCESS_TOKEN_EXPIRY = 1; // 1 day
const REFRESH_TOKEN_EXPIRY = 7; // 7 days

export const storeAuth = (data: {
  user: any;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}) => {
  // Store user data
  setCookie(AUTH_COOKIE_NAMES.USER, JSON.stringify(data.user), {
    expires: REFRESH_TOKEN_EXPIRY,
  });

  // Store access token
  setCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, data.accessToken, {
    expires: ACCESS_TOKEN_EXPIRY,
  });

  // Store refresh token if provided
  if (data.refreshToken) {
    setCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, data.refreshToken, {
      expires: REFRESH_TOKEN_EXPIRY,
    });
  }

  // Calculate and store token expiry time
  const expiresIn = data.expiresIn || 3600;
  const expiryTime = new Date().getTime() + expiresIn * 1000;
  setCookie(AUTH_COOKIE_NAMES.TOKEN_EXPIRY, expiryTime.toString(), {
    expires: ACCESS_TOKEN_EXPIRY,
  });
};

export const getStoredAuth = (): StoredAuth | null => {
  const userStr = getCookie(AUTH_COOKIE_NAMES.USER);
  const token = getCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN);
  const expiryStr = getCookie(AUTH_COOKIE_NAMES.TOKEN_EXPIRY);

  if (!userStr || !token) {
    return null;
  }

  try {
    const user = JSON.parse(userStr);
    const expiresIn = expiryStr ? parseInt(expiryStr) - new Date().getTime() : 0;

    return {
      user,
      token,
      expiresIn: Math.max(0, expiresIn),
    };
  } catch {
    return null;
  }
};

export const isTokenExpired = (): boolean => {
  const tokenExpiry = getCookie(AUTH_COOKIE_NAMES.TOKEN_EXPIRY);

  if (!tokenExpiry) {
    return true;
  }

  const now = new Date().getTime();
  return now > parseInt(tokenExpiry);
};

export const willTokenExpireSoon = (): boolean => {
  const tokenExpiry = getCookie(AUTH_COOKIE_NAMES.TOKEN_EXPIRY);

  if (!tokenExpiry) {
    return true;
  }

  const now = new Date().getTime();
  const expiryTime = parseInt(tokenExpiry);
  const timeUntilExpiry = expiryTime - now;

  return timeUntilExpiry < 300000;
};

export const clearAuth = () => {
  removeCookie(AUTH_COOKIE_NAMES.USER);
  removeCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN);
  removeCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN);
  removeCookie(AUTH_COOKIE_NAMES.TOKEN_EXPIRY);
};

export const validateUserRole = (requiredRole: string): boolean => {
  const userStr = getCookie(AUTH_COOKIE_NAMES.USER);

  if (!userStr) {
    return false;
  }

  try {
    const user = JSON.parse(userStr);
    return user.role === requiredRole;
  } catch {
    return false;
  }
};

export const getCurrentUser = () => {
  const userStr = getCookie(AUTH_COOKIE_NAMES.USER);

  if (!userStr) {
    return null;
  }

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  return getCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN);
};

export const getRefreshToken = (): string | null => {
  return getCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN);
};

export const updateAccessToken = (newToken: string, expiresIn?: number) => {
  setCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, newToken, {
    expires: ACCESS_TOKEN_EXPIRY,
  });

  if (expiresIn) {
    const expiryTime = new Date().getTime() + expiresIn * 1000;
    setCookie(AUTH_COOKIE_NAMES.TOKEN_EXPIRY, expiryTime.toString(), {
      expires: ACCESS_TOKEN_EXPIRY,
    });
  }
};

export const setupAutoRefresh = (refreshFn: () => Promise<void>) => {
  const checkAndRefresh = async () => {
    if (willTokenExpireSoon() && !isTokenExpired()) {
      try {
        await refreshFn();
      } catch (error) {
        clearAuth();
        window.location.href = process.env.VITE_SHELL_APP_URL || SHELL_APP_URL;
      }
    }
  };

  const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

  return () => clearInterval(interval);
};
