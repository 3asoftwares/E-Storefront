'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apolloClient } from '../apollo/client';
import { GQL_QUERIES } from '../apollo/queries/queries';
import { storeAuth, getStoredAuth } from '3a-ecommerce-utils/client';
import type { SendVerificationEmailResponse, VerifyEmailResponse } from '3a-ecommerce-types';

export function useSendVerificationEmail() {
  const mutation = useMutation({
    mutationFn: async (source: string = 'storefront') => {
      const { data } = await apolloClient.mutate<SendVerificationEmailResponse>({
        mutation: GQL_QUERIES.SEND_VERIFICATION_EMAIL_MUTATION,
        variables: { source },
      });

      if (!data?.sendVerificationEmail) {
        throw new Error('Failed to send verification email');
      }

      return data.sendVerificationEmail;
    },
  });

  return {
    sendVerificationEmail: (source?: string) => mutation.mutateAsync(source || 'storefront'),
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await apolloClient.mutate<VerifyEmailResponse>({
        mutation: GQL_QUERIES.VERIFY_EMAIL_MUTATION,
      });

      if (!data?.verifyEmail) {
        throw new Error('Failed to verify email');
      }

      return data.verifyEmail;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Update stored auth with verified user
        const storedAuth = getStoredAuth();
        if (storedAuth) {
          storeAuth({
            user: data.user,
            accessToken: storedAuth.token,
          });
        }
        // Invalidate me query to refresh user data
        queryClient.invalidateQueries({ queryKey: ['me'] });
        queryClient.setQueryData(['me'], data.user);
      }
    },
  });

  return {
    verifyEmail: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
}
