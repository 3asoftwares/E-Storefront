import { create } from 'zustand';
import type { SellerAuthStoreState } from '@3asoftwares/types';
import {
  SHELL_APP_URL,
  clearAuth as clearAuthCookies,
  getStoredAuth,
  storeAuth,
} from '@3asoftwares/utils/client';

interface ExtendedSellerAuthStore extends SellerAuthStoreState {
  setAuthData: (user: any, token: string) => void;
  updateUser: (user: any) => void;
}

export const useSellerAuthStore = create<ExtendedSellerAuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAuthData: (user, token) => {
    set({
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified || false,
      },
      token,
      isAuthenticated: true,
      error: null,
    });
  },

  updateUser: (user) => {
    const currentToken = get().token;
    set({
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified || false,
      },
    });
    // Update stored auth
    if (currentToken) {
      storeAuth({
        user,
        accessToken: currentToken,
      });
    }
  },

  clearAuth: () => {
    clearAuthCookies();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
    window.location.href = `${process.env.VITE_SHELL_APP_URL || SHELL_APP_URL}?logout=true`;
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  hydrate: () => {
    const storedAuth = getStoredAuth();

    if (storedAuth && storedAuth.user && storedAuth.token) {
      const user = storedAuth.user;

      if (user && user.role === 'seller') {
        set({
          user: {
            id: user._id || user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: user.emailVerified || false,
          },
          token: storedAuth.token,
          isAuthenticated: true,
        });
      } else {
        clearAuthCookies();
      }
    }
  },
}));
