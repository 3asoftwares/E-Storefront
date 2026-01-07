'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ApolloProvider } from '@apollo/client';
import { RecoilRoot } from 'recoil';
import { useState, useEffect } from 'react';
import { ToastProvider } from '@/lib/hooks/useToast';
import { useInitializeAuth } from '@/lib/hooks/useInitializeAuth';
import { useTokenValidator } from '@/lib/hooks/useTokenValidator';
import { storeAuth } from '3a-ecommerce-utils/client';
import { apolloClient } from '@/lib/apollo/client';

function AuthLoader({ children }: { children: React.ReactNode }) {
  useInitializeAuth();
  useTokenValidator();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');
      const tokenExpiry = params.get('tokenExpiry');
      const user = params.get('user');

      if (accessToken) {
        const parsedUser = user ? JSON.parse(user) : {};
        storeAuth({
          user: parsedUser,
          accessToken,
          refreshToken: refreshToken || undefined,
          expiresIn: tokenExpiry ? parseInt(tokenExpiry) : undefined,
        });
      }
    }
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000,
          },
        },
      })
  );

  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <ToastProvider>
            <AuthLoader>{children}</AuthLoader>
          </ToastProvider>
        </RecoilRoot>
        {process.env.NEXT_PUBLIC_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ApolloProvider>
  );
}
