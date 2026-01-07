'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apolloClient } from '../apollo/client';
import { GQL_QUERIES } from '../apollo/queries/queries';
import { storeAuth, getStoredAuth } from '3a-ecommerce-utils/client';

interface UpdateProfileResponse {
  updateProfile: {
    success: boolean;
    message: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      isActive: boolean;
      emailVerified: boolean;
      createdAt: string;
    } | null;
  };
}

interface UpdateProfileInput {
  name: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data } = await apolloClient.mutate<UpdateProfileResponse>({
        mutation: GQL_QUERIES.UPDATE_PROFILE_MUTATION,
        variables: { input },
      });

      if (!data?.updateProfile) {
        throw new Error('Failed to update profile');
      }

      return data.updateProfile;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Update stored auth with new user data
        const storedAuth = getStoredAuth();
        if (storedAuth) {
          storeAuth({
            user: data.user,
            accessToken: storedAuth.token,
          });
        }

        // Invalidate user queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: ['me'] });
        queryClient.setQueryData(['me'], data.user);
      }
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
}

export default useUpdateProfile;
