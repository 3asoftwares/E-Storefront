import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import {
  ProductCard,
  ProductCardSkeleton,
  SearchBar,
  Button,
  EmptyState,
  LoadingSpinner,
} from '@/components';
import { useProducts, useCategories } from '@/hooks';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ToastProvider';
import type { ProductGraphQL } from '@3asoftwares/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function ProductsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showToast } = useToast();

  const [search, setSearch] = useState((params.search as string) || '');
  const [selectedCategory, setSelectedCategory] = useState((params.category as string) || '');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { addItem, isInWishlist, addToWishlist, removeFromWishlist, items } = useCartStore();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  const filters = useMemo(
    () => ({
      search: search || undefined,
      category: selectedCategory || undefined,
      sortBy: sortBy === 'newest' ? undefined : sortBy,
    }),
    [search, selectedCategory, sortBy]
  );

  const {
    data: productsData,
    isLoading,
    refetch,
    isFetchingNextPage,
  } = useProducts(page, 20, filters);
  const products = productsData?.products || [];

  const handleAddToCart = (product: ProductGraphQL) => {
    addItem({
      id: `cart-${product.id}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.imageUrl,
    });
    showToast(`${product.name} added to cart`, 'success');
  };

  const handleWishlistToggle = (product: ProductGraphQL) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
      showToast('Added to wishlist', 'success');
    }
  };

  const isInCart = (productId: string) => items.some((item) => item.productId === productId);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('newest');
  };

  const hasActiveFilters = search || selectedCategory || sortBy !== 'newest';

  const renderProduct = useCallback(
    ({ item }: { item: ProductGraphQL }) => (
      <ProductCard
        product={item}
        onPress={() => router.push(`/product/${item.id}`)}
        onAddToCart={() => handleAddToCart(item)}
        onWishlistToggle={() => handleWishlistToggle(item)}
        isInWishlist={isInWishlist(item.id)}
        isInCart={isInCart(item.id)}
      />
    ),
    [items]
  );

  const renderHeader = () => (
    <View>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        onSubmit={() => refetch()}
        placeholder="Search products..."
      />

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, { borderColor: colors.border }]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={16} color={colors.text} />
          <Text style={[styles.filterButtonText, { color: colors.text }]}>Filters</Text>
          {hasActiveFilters && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]} />
          )}
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              { borderColor: !selectedCategory ? colors.primary : colors.border },
              !selectedCategory && { backgroundColor: `${colors.primary}10` },
            ]}
            onPress={() => setSelectedCategory('')}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: !selectedCategory ? colors.primary : colors.textSecondary },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.slice(0, 5).map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                { borderColor: selectedCategory === cat.name ? colors.primary : colors.border },
                selectedCategory === cat.name && { backgroundColor: `${colors.primary}10` },
              ]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === cat.name ? colors.primary : colors.textSecondary },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
          {products.length} products found
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={[styles.clearFilters, { color: colors.primary }]}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="cube-outline"
        title="No Products Found"
        description="Try adjusting your filters or search terms"
        actionText="Clear Filters"
        onAction={clearFilters}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingFooter}>
              {[1, 2].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </View>
          ) : null
        }
        onEndReached={() => {
          // Load more products
        }}
        onEndReachedThreshold={0.5}
      />

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filters & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Sort Options */}
              <Text style={[styles.filterLabel, { color: colors.text }]}>Sort By</Text>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    { borderColor: sortBy === option.value ? colors.primary : colors.border },
                    sortBy === option.value && { backgroundColor: `${colors.primary}10` },
                  ]}
                  onPress={() => setSortBy(option.value)}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      { color: sortBy === option.value ? colors.primary : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}

              {/* Category Options */}
              <Text
                style={[styles.filterLabel, { color: colors.text, marginTop: Layout.spacing.lg }]}
              >
                Category
              </Text>
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  { borderColor: !selectedCategory ? colors.primary : colors.border },
                  !selectedCategory && { backgroundColor: `${colors.primary}10` },
                ]}
                onPress={() => setSelectedCategory('')}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    { color: !selectedCategory ? colors.primary : colors.text },
                  ]}
                >
                  All Categories
                </Text>
                {!selectedCategory && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.sortOption,
                    { borderColor: selectedCategory === cat.name ? colors.primary : colors.border },
                    selectedCategory === cat.name && { backgroundColor: `${colors.primary}10` },
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      { color: selectedCategory === cat.name ? colors.primary : colors.text },
                    ]}
                  >
                    {cat.name}
                  </Text>
                  {selectedCategory === cat.name && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Clear All"
                onPress={clearFilters}
                variant="outline"
                style={{ flex: 1, marginRight: Layout.spacing.sm }}
              />
              <Button title="Apply" onPress={() => setShowFilters(false)} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginRight: Layout.spacing.sm,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  categoriesScroll: {
    flex: 1,
  },
  categoryChip: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginRight: Layout.spacing.xs,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  resultsText: {
    fontSize: 14,
  },
  clearFilters: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: Layout.spacing.lg,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginBottom: Layout.spacing.sm,
  },
  sortOptionText: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Layout.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
