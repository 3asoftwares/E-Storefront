import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton, EmptyState } from '../ui';
import { Colors, Spacing, FontSizes, FontWeights } from '../../constants/theme';

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  image?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  category?: { name: string };
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: Error | null;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}

export function ProductGrid({
  products,
  loading = false,
  error,
  onEndReached,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
  ListFooterComponent,
  emptyIcon = '📦',
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your search or filters',
  emptyActionLabel,
  onEmptyAction,
}: ProductGridProps) {
  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        {ListHeaderComponent}
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {ListHeaderComponent}
        <EmptyState
          icon="❌"
          title="Error loading products"
          description={error.message || 'Something went wrong'}
          actionLabel="Try Again"
          onAction={onRefresh}
        />
      </View>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <View style={styles.container}>
        {ListHeaderComponent}
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => <ProductCard product={item} />}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        <>
          {loading && products.length > 0 && (
            <View style={styles.loadingMore}>
              <Text style={styles.loadingText}>Loading more...</Text>
            </View>
          )}
          {ListFooterComponent}
        </>
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
    />
  );
}

// Horizontal product list for featured sections
interface ProductHorizontalListProps {
  title?: string;
  products: Product[];
  loading?: boolean;
  onSeeAll?: () => void;
}

export function ProductHorizontalList({
  title,
  products,
  loading = false,
  onSeeAll,
}: ProductHorizontalListProps) {
  if (loading) {
    return (
      <View style={styles.horizontalContainer}>
        {title && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        <View style={styles.horizontalSkeleton}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.compactSkeleton} />
          ))}
        </View>
      </View>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <View style={styles.horizontalContainer}>
      {title && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {onSeeAll && (
            <TouchableOpacity onPress={onSeeAll}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => <ProductCard product={item} variant="compact" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: Spacing.base,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listContent: {
    padding: Spacing.base,
  },
  row: {
    justifyContent: 'space-between',
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
  },
  horizontalContainer: {
    marginVertical: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: FontSizes.sm,
    color: Colors.light.primary,
    fontWeight: FontWeights.medium,
  },
  horizontalList: {
    paddingHorizontal: Spacing.base,
  },
  horizontalSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  compactSkeleton: {
    width: 140,
    height: 160,
    backgroundColor: Colors.light.borderLight,
    borderRadius: 12,
  },
});
