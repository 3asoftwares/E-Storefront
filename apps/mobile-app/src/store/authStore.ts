import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { apolloClient } from '@/services/apollo';
import { GQL_QUERIES } from '@/services/queries';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const { data } = await apolloClient.mutate({
            mutation: GQL_QUERIES.LOGIN_MUTATION,
            variables: { email, password },
          });

          const { accessToken, refreshToken, user } = data.login;

          // Store tokens securely
          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });

        try {
          const { data } = await apolloClient.mutate({
            mutation: GQL_QUERIES.REGISTER_MUTATION,
            variables: { name, email, password },
          });

          const { accessToken, refreshToken, user } = data.register;

          // Store tokens securely
          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          // Clear secure storage
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');

          // Clear Apollo cache
          await apolloClient.clearStore();

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });

        try {
          const accessToken = await SecureStore.getItemAsync('accessToken');
          const refreshToken = await SecureStore.getItemAsync('refreshToken');

          if (accessToken) {
            set({ accessToken, refreshToken });

            // Validate token by fetching user
            const { data } = await apolloClient.query({
              query: GQL_QUERIES.ME_QUERY,
              context: {
                headers: {
                  authorization: `Bearer ${accessToken}`,
                },
              },
              fetchPolicy: 'network-only',
            });

            if (data.me) {
              set({
                user: data.me,
                isAuthenticated: true,
              });
            }
          }
        } catch (error) {
          // Token invalid, clear everything
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuthStatus: async () => {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        return !!accessToken;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
