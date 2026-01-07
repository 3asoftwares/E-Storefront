

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apolloClient } from '../apollo/client';
import { GQL_QUERIES } from '../apollo/queries/queries';
import type { UserGraphQL } from '3a-ecommerce-types';
import type {
  LoginInput,
  RegisterInput,
  LoginResponse,
  RegisterResponse,
  MeResponse,
} from '3a-ecommerce-types';
import { storeAuth, clearAuth as clearAuthCookies, getAccessToken } from '3a-ecommerce-utils/client';

export function useLogin() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await apolloClient.mutate<LoginResponse>({
        mutation: GQL_QUERIES.LOGIN_MUTATION,
        variables: { input },
      });

      if (!data?.login) {
        throw new Error('Login failed');
      }

      return data.login;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        storeAuth({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.setQueryData(['me'], data.user);
    },
  });

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useRegister() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await apolloClient.mutate<RegisterResponse>({
        mutation: GQL_QUERIES.REGISTER_MUTATION,
        variables: { input },
      });

      if (!data?.register) {
        throw new Error('Registration failed');
      }

      return data.register;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        storeAuth({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.setQueryData(['me'], data.user);
    },
  });

  return {
    register: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

interface GoogleAuthInput {
  idToken: string;
}

interface GoogleAuthResponse {
  googleAuth: {
    user: UserGraphQL;
    accessToken: string;
    refreshToken: string;
  };
}

export function useGoogleAuth() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: GoogleAuthInput) => {
      const { data } = await apolloClient.mutate<GoogleAuthResponse>({
        mutation: GQL_QUERIES.GOOGLE_AUTH_MUTATION,
        variables: { input },
      });

      if (!data?.googleAuth) {
        throw new Error('Google authentication failed');
      }

      return data.googleAuth;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        storeAuth({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.setQueryData(['me'], data.user);
    },
  });

  return {
    googleAuth: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await apolloClient.mutate({
        mutation: GQL_QUERIES.LOGOUT_MUTATION,
      });
    },
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        clearAuthCookies();
      }

      apolloClient.clearStore();
      queryClient.clear();

      router.push('/login');
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useCurrentUser() {
  return useQuery<UserGraphQL | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = getAccessToken();
          if (!token) {
            return null;
          }
        }

        const { data } = await apolloClient.query<MeResponse>({
          query: GQL_QUERIES.GET_ME_QUERY,
          fetchPolicy: 'network-only',
        });

        return data.me;
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useIsAuthenticated() {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
}
