import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { getAccessToken, clearAuth, Logger } from '3a-ecommerce-utils/client';

// Load Apollo Client error messages in development
if (process.env.NEXT_PUBLIC_ENV !== 'production') {
  loadDevMessages();
  loadErrorMessages();
}

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: 'include',
});

const authLink = new ApolloLink((operation, forward) => {
  const token = typeof window !== 'undefined' ? getAccessToken() : null;

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  }));

  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      Logger.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations
        )}, Path: ${path}`,
        undefined,
        'Apollo'
      );

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        if (typeof window !== 'undefined') {
          clearAuth();
        }
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    });
  }

  if (networkError) {
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: [
              'search',
              'category',
              'minPrice',
              'maxPrice',
              'page',
              'limit',
              'sortBy',
              'sortOrder',
              'featured',
              'includeInactive',
            ],
            merge(existing, incoming, { args }) {
              if (!args?.page || args.page === 1) {
                return incoming;
              }
              return {
                ...incoming,
                products: [...(existing?.products || []), ...(incoming?.products || [])],
              };
            },
          },
          orders: {
            keyArgs: false,
            merge(incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export const resetApolloStore = async () => {
  await apolloClient.clearStore();
};
