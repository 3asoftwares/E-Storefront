import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apolloClient } from '../apollo/client';
import { GQL_QUERIES } from '../apollo/queries/queries';
import { getAccessToken } from '3a-ecommerce-utils/client';

import type {
  OrdersResponse,
  OrderResponse,
  CreateOrderResponse,
  CreateOrderInput as HookCreateOrderInput,
} from '3a-ecommerce-types';

type CreateOrderInput = HookCreateOrderInput;

export function useOrders(page: number = 1, limit: number = 10, customerId?: string) {
  return useQuery({
    queryKey: ['orders', page, limit, customerId],
    queryFn: async () => {
      const { data } = await apolloClient.query<OrdersResponse>({
        query: GQL_QUERIES.GET_ORDERS_QUERY,
        variables: { page, limit, customerId },
        fetchPolicy: 'network-only',
      });

      return data.orders;
    },
    // Only fetch orders if user is authenticated
    enabled: !!getAccessToken(),
    staleTime: 1000 * 30,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await apolloClient.query<OrderResponse>({
        query: GQL_QUERIES.GET_ORDER_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      });

      return data.order;
    },
    // Only fetch order if user is authenticated and id is provided
    enabled: !!id && !!getAccessToken(),
    staleTime: 1000 * 60,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const { data } = await apolloClient.mutate<CreateOrderResponse>({
        mutation: GQL_QUERIES.CREATE_ORDER_MUTATION,
        variables: { input },
      });

      if (!data?.createOrder) {
        throw new Error('Failed to create order');
      }

      // Handle new response structure with order/orders/orderCount
      const result = data.createOrder;
      // Return the first order for backward compatibility
      return result.order || result.orders?.[0] || result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apolloClient.mutate({
        mutation: GQL_QUERIES.CANCEL_ORDER_MUTATION,
        variables: { id },
      });

      if (!data?.cancelOrder) {
        throw new Error('Failed to cancel order');
      }

      return data.cancelOrder;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });
}
