'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { apolloClient } from '../apollo/client';
import { GQL_QUERIES } from '../apollo/queries/queries';
import { getAccessToken, clearAuth, storeAuth, getStoredAuth } from '3a-ecommerce-utils/client';

// Check token validity every 5 minutes
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Public routes that should not trigger token validation redirects
const PUBLIC_ROUTES = ['/reset-password', '/forgot-password', '/login', '/signup', '/verify-email'];

/**
 * Hook to periodically validate the user's session by calling the "me" API.
 * This implements a sliding expiration mechanism:
 * - Token expires after 1 hour of inactivity
 * - Any API call (including this check) extends the session
 * - If token is expired, user is logged out automatically
 * - Skips validation on public routes (login, signup, reset-password, etc.)
 */
export function useTokenValidator() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Check if current path is a public route
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));

  const validateToken = useCallback(async () => {
    const token = getAccessToken();

    // No token, no need to validate
    if (!token) {
      return { valid: false, reason: 'no_token' };
    }

    try {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.GET_ME_QUERY,
        fetchPolicy: 'network-only',
      });

      if (data?.me) {
        // Token is valid, update last activity time
        lastActivityRef.current = Date.now();

        // Refresh the stored auth to extend cookie expiry (sliding expiration)
        const storedAuth = getStoredAuth();
        if (storedAuth) {
          storeAuth({
            user: data.me,
            accessToken: storedAuth.token,
          });
        }

        // Update the cache with fresh user data
        queryClient.setQueryData(['me'], data.me);

        return { valid: true, user: data.me };
      } else {
        // No user returned, token might be invalid
        return { valid: false, reason: 'no_user' };
      }
    } catch (error: any) {
      // Token is invalid or expired
      const isAuthError =
        error?.message?.includes('401') ||
        error?.message?.includes('Unauthorized') ||
        error?.message?.includes('jwt expired') ||
        error?.message?.includes('invalid token') ||
        error?.networkError?.statusCode === 401;

      if (isAuthError) {
        return { valid: false, reason: 'auth_error' };
      }

      // Network error, don't logout - might be temporary
      return { valid: true, reason: 'network_error' };
    }
  }, [queryClient]);

  const handleInvalidToken = useCallback(async () => {
    // Don't redirect on public routes - just clear auth silently
    const shouldRedirect = !isPublicRoute;

    // Try to call logout mutation to remove refresh token from MongoDB
    // This is a best-effort attempt - if it fails, we still clear local auth
    try {
      await apolloClient.mutate({
        mutation: GQL_QUERIES.LOGOUT_MUTATION,
      });
    } catch {
      // Ignore errors - token might already be invalid
      // We still want to clear local auth data
    }

    // Clear all auth data
    clearAuth();

    // Clear Apollo cache
    apolloClient.clearStore();

    // Clear React Query cache
    queryClient.clear();

    // Redirect to home page only if not on a public route
    if (shouldRedirect && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, [queryClient, isPublicRoute]);

  const checkAndValidate = useCallback(async () => {
    const result = await validateToken();

    if (!result.valid && result.reason !== 'network_error' && result.reason !== 'no_token') {
      handleInvalidToken();
    }
  }, [validateToken, handleInvalidToken]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Skip validation on public routes
    if (isPublicRoute) return;

    // Check if there's a token to validate
    const token = getAccessToken();
    if (!token) return;

    // Initial validation on mount
    checkAndValidate();

    // Set up periodic validation
    intervalRef.current = setInterval(checkAndValidate, TOKEN_CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkAndValidate, isPublicRoute]);

  // Also validate on window focus (user comes back to tab)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Skip validation on public routes
    if (isPublicRoute) return;

    const handleFocus = () => {
      const token = getAccessToken();
      if (token) {
        checkAndValidate();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAndValidate, isPublicRoute]);

  return {
    validateToken,
    checkAndValidate,
  };
}
