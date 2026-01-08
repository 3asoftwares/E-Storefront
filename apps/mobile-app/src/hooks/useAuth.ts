import { useMutation } from '@tanstack/react-query';
import { apolloClient } from '@/services/apollo';
import { GQL_QUERIES } from '@/services/queries';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { setUser, setTokens } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data } = await apolloClient.mutate({
        mutation: GQL_QUERIES.LOGIN_MUTATION,
        variables: { email, password },
      });

      return data.login;
    },
    onSuccess: async (data) => {
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      const { data } = await apolloClient.mutate({
        mutation: GQL_QUERIES.REGISTER_MUTATION,
        variables: { name, email, password },
      });

      return data.register;
    },
    onSuccess: async (data) => {
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    },
  });

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
