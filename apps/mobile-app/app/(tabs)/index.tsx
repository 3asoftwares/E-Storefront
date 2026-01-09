import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useProducts, useCategories } from '../../src/lib/hooks';
import { useCartStore } from '../../src/store/cartStore';

const { width } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (width - 48) / 2;

// Product Card Component
function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlistItem = useCartStore((state) => state.toggleWishlistItem);
  const isInWishlist = useCartStore((state) =>
    state.wishlist.some((item) => item.id === product.id)
  );

  const imageUrl = product.images?.[0] || 'https://via.placeholder.com/200';
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: imageUrl,
      quantity: 1,
      variant: undefined,
    });
  };

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercentage}%</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() =>
            toggleWishlistItem({
              id: product.id,
              name: product.name,
              price: product.salePrice || product.price,
              image: imageUrl,
            })
          }
        >
          <Text style={{ fontSize: 18 }}>{isInWishlist ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceContainer}>
          {hasDiscount ? (
            <>
              <Text style={styles.salePrice}>${product.salePrice.toFixed(2)}</Text>
              <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
            </>
          ) : (
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          )}
        </View>
        {product.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount || 0})</Text>
          </View>
        )}
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Category Card Component
function CategoryCard({ category }: { category: any }) {
  const imageUrl = category.image || 'https://via.placeholder.com/100';

  return (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/products?category=${category.slug}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: imageUrl }} style={styles.categoryImage} resizeMode="cover" />
      <Text style={styles.categoryName} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

// Hero Banner Component
function HeroBanner() {
  return (
    <View style={styles.heroBanner}>
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>Welcome to Our Store</Text>
        <Text style={styles.heroSubtitle}>Discover amazing products at great prices</Text>
        <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/products')}>
          <Text style={styles.heroButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Section Header Component
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Main Home Screen
export default function HomeScreen() {
  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
    isRefetching: isRefetchingProducts,
  } = useProducts(1, 8, { featured: true });

  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();

  const addToRecentlyViewed = useCartStore((state) => state.addToRecentlyViewed);
  const recentlyViewed = useCartStore((state) => state.recentlyViewed);

  const products = productsData?.data || [];
  const isLoading = productsLoading || categoriesLoading;

  const onRefresh = useCallback(() => {
    refetchProducts();
    refetchCategories();
  }, [refetchProducts, refetchCategories]);

  if (isLoading && !products.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetchingProducts} onRefresh={onRefresh} />}
      >
        {/* Hero Banner */}
        <HeroBanner />

        {/* Categories Section */}
        {categories && categories.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Shop by Category" onSeeAll={() => router.push('/products')} />
            <FlatList
              data={categories.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <CategoryCard category={item} />}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        )}

        {/* Featured Products Section */}
        <View style={styles.section}>
          <SectionHeader title="Featured Products" onSeeAll={() => router.push('/products')} />
          <View style={styles.productsGrid}>
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
          {products.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📦</Text>
              <Text style={styles.emptyStateText}>No products found</Text>
            </View>
          )}
        </View>

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Recently Viewed" />
            <FlatList
              data={recentlyViewed.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recentlyViewedCard}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.recentlyViewedImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.recentlyViewedName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.recentlyViewedPrice}>${item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.recentlyViewedList}
            />
          </View>
        )}

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoTitle}>🎉 Special Offer</Text>
          <Text style={styles.promoText}>Get 20% off on your first order with code FIRST20</Text>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  heroBanner: {
    backgroundColor: '#4F46E5',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 8,
    textAlign: 'center',
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  heroButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
  },
  categoryName: {
    marginTop: 8,
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    minHeight: 36,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  salePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  originalPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: '#374151',
  },
  reviewCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  addToCartButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  recentlyViewedList: {
    paddingHorizontal: 16,
  },
  recentlyViewedCard: {
    width: 120,
    marginRight: 12,
  },
  recentlyViewedImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  recentlyViewedName: {
    fontSize: 13,
    color: '#374151',
    marginTop: 8,
  },
  recentlyViewedPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 48,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  promoBanner: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
  },
  promoText: {
    fontSize: 14,
    color: '#92400E',
    marginTop: 4,
    textAlign: 'center',
  },
});
