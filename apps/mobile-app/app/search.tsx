import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '../src/lib/hooks';
import { ProductCard } from '../src/components/products';
import { Loading, EmptyState } from '../src/components/ui';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../src/constants/theme';
import { useCartStore } from '../src/store/cartStore';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { recentSearches, addRecentSearch, clearRecentSearches } = useCartStore();

  const { data, isLoading, refetch } = useProducts({
    search: debouncedQuery,
    limit: 20,
    enabled: debouncedQuery.length >= 2,
  });

  const products = data?.products?.products || [];
  const shouldShowProducts = debouncedQuery.length >= 2;

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim().length > 0) {
        addRecentSearch(query.trim());
      }
    },
    [addRecentSearch]
  );

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const popularSearches = [
    'Electronics',
    'Clothing',
    'Shoes',
    'Watches',
    'Headphones',
    'Laptops',
    'Phones',
    'Accessories',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.light.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {shouldShowProducts ? (
        // Search Results
        <View style={styles.content}>
          {isLoading ? (
            <Loading fullScreen text="Searching..." />
          ) : products.length > 0 ? (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              renderItem={({ item }) => <ProductCard product={item} />}
              contentContainerStyle={styles.productList}
              ListHeaderComponent={
                <Text style={styles.resultCount}>
                  {products.length} result{products.length !== 1 ? 's' : ''} for "{debouncedQuery}"
                </Text>
              }
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState
              icon="🔍"
              title="No results found"
              description={`We couldn't find anything for "${debouncedQuery}"`}
            />
          )}
        </View>
      ) : (
        // Recent & Popular Searches
        <View style={styles.content}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipContainer}>
                {recentSearches.slice(0, 10).map((query, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => handleRecentSearchPress(query)}
                  >
                    <Text style={styles.chipIcon}>🕐</Text>
                    <Text style={styles.chipText}>{query}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Popular Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.chipContainer}>
              {popularSearches.map((query, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.chip, styles.popularChip]}
                  onPress={() => handleRecentSearchPress(query)}
                >
                  <Text style={styles.chipIcon}>🔥</Text>
                  <Text style={styles.chipText}>{query}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Trending Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Categories</Text>
            <View style={styles.categoryGrid}>
              {[
                { icon: '📱', name: 'Electronics' },
                { icon: '👕', name: 'Fashion' },
                { icon: '🏠', name: 'Home & Living' },
                { icon: '💄', name: 'Beauty' },
                { icon: '⚽', name: 'Sports' },
                { icon: '📚', name: 'Books' },
              ].map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryCard}
                  onPress={() => {
                    setSearchQuery(category.name);
                    handleSearch(category.name);
                  }}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.light.text,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.light.textTertiary,
  },
  cancelButton: {
    marginLeft: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    fontSize: FontSizes.base,
    color: Colors.light.primary,
    fontWeight: FontWeights.medium,
  },
  content: {
    flex: 1,
  },
  resultCount: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  productList: {
    padding: Spacing.base,
  },
  row: {
    justifyContent: 'space-between',
  },
  section: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  clearAllText: {
    fontSize: FontSizes.sm,
    color: Colors.light.primary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceSecondary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  popularChip: {
    backgroundColor: Colors.light.primary + '10',
  },
  chipIcon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  chipText: {
    fontSize: FontSizes.sm,
    color: Colors.light.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    color: Colors.light.text,
    textAlign: 'center',
  },
});
