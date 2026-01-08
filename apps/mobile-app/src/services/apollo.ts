import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const GRAPHQL_ENDPOINT =
  Constants.expoConfig?.extra?.graphqlUrl ||
  process.env.EXPO_PUBLIC_GRAPHQL_URL ||
  'http://localhost:4000/graphql';

// Get access token from secure storage
const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('accessToken');
  } catch {
    return null;
  }
};

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// Auth middleware
const authLink = new ApolloLink((operation, forward) => {
  // For React Native, we need to handle this asynchronously
  // The token will be added in the query/mutation hooks
  return forward(operation);
});

// Error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations
        )}, Path: ${path}`
      );

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        SecureStore.deleteItemAsync('accessToken');
        SecureStore.deleteItemAsync('refreshToken');
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
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
              'sortBy',
              'sortOrder',
              'featured',
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
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

// Export for direct usage with token
export const createAuthenticatedClient = async () => {
  const token = await getAccessToken();

  const authHttpLink = new HttpLink({
    uri: GRAPHQL_ENDPOINT,
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });

  return new ApolloClient({
    link: from([errorLink, authHttpLink]),
    cache: apolloClient.cache,
  });
};
