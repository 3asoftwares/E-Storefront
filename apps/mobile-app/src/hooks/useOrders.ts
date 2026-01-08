import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedClient } from '@/services/apollo';
import { GQL_QUERIES } from '@/services/queries';
import type { OrdersResponse, OrderResponse } from '@3asoftwares/types';

export function useOrders(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: async () => {
      const client = await createAuthenticatedClient();
      const { data } = await client.query<OrdersResponse>({
        query: GQL_QUERIES.GET_ORDERS_QUERY,
        variables: { page, limit },
        fetchPolicy: 'network-only',
      });

      return data.orders;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const client = await createAuthenticatedClient();
      const { data } = await client.query<OrderResponse>({
        query: GQL_QUERIES.GET_ORDER_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      });

      return data.order;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
