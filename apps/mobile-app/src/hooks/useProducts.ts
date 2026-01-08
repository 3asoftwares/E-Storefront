import { useQuery } from '@tanstack/react-query';
import { apolloClient } from '@/services/apollo';
import { GQL_QUERIES } from '@/services/queries';
import type { ProductsResponse, ProductResponse, CategoriesResponse } from '@3asoftwares/types';

interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
}

export function useProducts(page: number = 1, limit: number = 20, filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', page, limit, filters],
    queryFn: async () => {
      const { data } = await apolloClient.query<ProductsResponse>({
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await apolloClient.query<ProductResponse>({
        query: GQL_QUERIES.GET_PRODUCT_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      });

      return data.product;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apolloClient.query<CategoriesResponse>({
        query: GQL_QUERIES.GET_CATEGORIES_QUERY,
        fetchPolicy: 'cache-first',
      });

      return data.categories;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
