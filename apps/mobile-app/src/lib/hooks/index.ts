import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apolloClient } from '../apollo/client';
import { GQL_QUERIES } from '../apollo/queries';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, clearAuthToken } from '../apollo/client';
import { useCartStore } from '../../store/cartStore';
import { router } from 'expo-router';

// ============== PRODUCT HOOKS ==============
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  featured?: boolean;
}

export function useProducts(page: number = 1, limit: number = 20, filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', page, limit, filters],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.GET_PRODUCTS_QUERY,
        variables: {
          page,
          limit,
          ...filters,
        },
        fetchPolicy: 'network-only',
      });

      return data.products;
    },
    staleTime: 0,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.GET_PRODUCT_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      });

      return data.product;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ============== CATEGORY HOOKS ==============
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.GET_CATEGORIES_QUERY,
        variables: {
          filter: { isActive: true },
        },
        fetchPolicy: 'cache-first',
      });

      return data.categories?.data || [];
    },
    staleTime: 1000 * 60 * 30,
  });
}

// ============== AUTH HOOKS ==============
export function useLogin() {
  const queryClient = useQueryClient();
  const setUserProfile = useCartStore((state) => state.setUserProfile);

  const mutation = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data } = await apolloClient.mutate({
        mutation: GQL_QUERIES.LOGIN_MUTATION,
        variables: { input },
      });

      if (!data?.login) {
        throw new Error('Login failed');
      }

      return data.login;
    },
    onSuccess: async (data) => {
      // Store tokens
      await setAuthToken(data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // Update store
      setUserProfile({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email.split('@')[0],
        phone: data.user.phone,
        addresses: [],
      });

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
  const setUserProfile = useCartStore((state) => state.setUserProfile);

  const mutation = useMutation({
    mutationFn: async (input: { email: string; password: string; name: string }) => {
      const { data } = await apolloClient.mutate({
        mutation: GQL_QUERIES.REGISTER_MUTATION,
        variables: { input },
      });

      if (!data?.register) {
        throw new Error('Registration failed');
      }

      return data.register;
    },
    onSuccess: async (data) => {
      await setAuthToken(data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      setUserProfile({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email.split('@')[0],
        addresses: [],
      });

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

export function useLogout() {
  const queryClient = useQueryClient();
  const clearUser = useCartStore((state) => state.clearUser);

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        await apolloClient.mutate({
          mutation: GQL_QUERIES.LOGOUT_MUTATION,
        });
      } catch (e) {
        // Ignore errors, just clear local state
      }
    },
    onSuccess: async () => {
      await clearAuthToken();
      clearUser();
      queryClient.clear();
      router.replace('/');
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.GET_ME_QUERY,
        fetchPolicy: 'network-only',
      });

      return data.me;
    },
    retry: false,
  });
}

// ============== ORDER HOOKS ==============
export function useOrders(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.GET_ORDERS_BY_CUSTOMER_QUERY,
        variables: { page, limit },
        fetchPolicy: 'network-only',
      });

      return data.ordersByCustomer;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.GET_ORDER_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
      });

      return data.order;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);

  const mutation = useMutation({
    mutationFn: async (input: any) => {
      const { data } = await apolloClient.mutate({
        mutation: GQL_QUERIES.CREATE_ORDER_MUTATION,
        variables: { input },
      });

      if (!data?.createOrder) {
        throw new Error('Failed to create order');
      }

      return data.createOrder;
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    createOrder: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// ============== REVIEW HOOKS ==============
export function useProductReviews(productId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['reviews', productId, page, limit],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.GET_PRODUCT_REVIEWS_QUERY,
        variables: { productId, page, limit },
        fetchPolicy: 'cache-first',
      });

      return data.productReviews;
    },
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: {
      productId: string;
      rating: number;
      title: string;
      comment: string;
    }) => {
      const { data } = await apolloClient.mutate({
        mutation: GQL_QUERIES.CREATE_REVIEW_MUTATION,
        variables: { input },
      });

      return data.createReview;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });

  return {
    createReview: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

// ============== COUPON HOOKS ==============
export function useValidateCoupon() {
  const mutation = useMutation({
    mutationFn: async ({ code, orderTotal }: { code: string; orderTotal: number }) => {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.VALIDATE_COUPON_QUERY,
        variables: { code, orderTotal },
        fetchPolicy: 'network-only',
      });

      return data.validateCoupon;
    },
  });

  return {
    validateCoupon: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

// ============== ADDRESS HOOKS ==============
export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.GET_MY_ADDRESSES_QUERY,
        fetchPolicy: 'network-only',
      });

      return data.myAddresses || [];
    },
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: any) => {
      const { data } = await apolloClient.mutate({
        mutation: GQL_QUERIES.ADD_ADDRESS_MUTATION,
        variables: { input },
      });

      return data.addAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  return {
    addAddress: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
