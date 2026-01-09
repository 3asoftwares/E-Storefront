import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use different URLs for different platforms
const getGraphQLUrl = () => {
  // For web, use localhost
  // For mobile devices, use your computer's IP address
  const WEB_URL = 'http://localhost:4000/graphql';
  const MOBILE_URL = 'http://192.168.1.100:4000/graphql'; // Replace with your IP

  // Try to use environment variable first
  if (process.env.EXPO_PUBLIC_GRAPHQL_URL) {
    return process.env.EXPO_PUBLIC_GRAPHQL_URL;
  }

  return Platform.OS === 'web' ? WEB_URL : MOBILE_URL;
};

const GRAPHQL_ENDPOINT = getGraphQLUrl();

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: 'include',
});

// Auth link to add token to requests
const authLink = new ApolloLink((operation, forward) => {
  // Get token from AsyncStorage (sync access not available, so we use a cached version)
  const token = globalThis.__AUTH_TOKEN__;

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  }));

  return forward(operation);
});

// Error handling link
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
        clearAuthToken();
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
            merge: false,
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

// Auth token management
export const setAuthToken = async (token: string) => {
  globalThis.__AUTH_TOKEN__ = token;
  await AsyncStorage.setItem('accessToken', token);
};

export const getAuthToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem('accessToken');
  globalThis.__AUTH_TOKEN__ = token;
  return token;
};

export const clearAuthToken = async () => {
  globalThis.__AUTH_TOKEN__ = null;
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  await AsyncStorage.removeItem('user');
};

// Initialize token on app start
export const initializeAuth = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    globalThis.__AUTH_TOKEN__ = token;
  }
};

// Declare global type
declare global {
  var __AUTH_TOKEN__: string | null | undefined;
}
