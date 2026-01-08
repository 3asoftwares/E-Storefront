import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import {
  ProductCard,
  ProductCardSkeleton,
  CategoryCard,
  SearchBar,
  LoadingSpinner,
} from '@/components';
import { useProducts, useCategories } from '@/hooks';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ToastProvider';
import type { ProductGraphQL, CategoryGraphQL } from '@3asoftwares/types';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { showToast } = useToast();

  const { addItem, isInWishlist, addToWishlist, removeFromWishlist, items } = useCartStore();
  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProducts(1, 10);
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();

  const featuredProducts = productsData?.products?.slice(0, 6) || [];
  const categories = categoriesData || [];

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProducts(), refetchCategories()]);
    setRefreshing(false);
  };

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Search Bar */}
      <TouchableOpacity onPress={() => router.push('/products')}>
        <View pointerEvents="none">
          <SearchBar value="" onChangeText={() => {}} placeholder="Search products..." />
        </View>
      </TouchableOpacity>

      {/* Hero Banner */}
      <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Welcome to</Text>
          <Text style={styles.heroBrand}>3A Softwares Store</Text>
          <Text style={styles.heroSubtitle}>Discover amazing products at great prices</Text>
          <TouchableOpacity
            style={[styles.heroButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/products')}
          >
            <Text style={[styles.heroButtonText, { color: colors.primary }]}>Shop Now</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="bag" size={80} color="rgba(255,255,255,0.3)" />
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Shop by Category</Text>
          <TouchableOpacity onPress={() => router.push('/products')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {categoriesLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <FlatList
            horizontal
            data={categories.slice(0, 6)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={() => router.push(`/products?category=${encodeURIComponent(item.name)}`)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        )}
      </View>

      {/* Featured Products Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Products</Text>
          <TouchableOpacity onPress={() => router.push('/products?featured=true')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {productsLoading ? (
          <View style={styles.productGrid}>
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </View>
        ) : (
          <View style={styles.productGrid}>
            {featuredProducts.map((product: ProductGraphQL) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => router.push(`/product/${product.id}`)}
                onAddToCart={() => handleAddToCart(product)}
                onWishlistToggle={() => handleWishlistToggle(product)}
                isInWishlist={isInWishlist(product.id)}
                isInCart={isInCart(product.id)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Quick Links */}
      <View style={[styles.quickLinks, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/products')}>
          <View style={[styles.quickLinkIcon, { backgroundColor: colors.infoLight }]}>
            <Ionicons name="flash" size={24} color={colors.info} />
          </View>
          <Text style={[styles.quickLinkText, { color: colors.text }]}>New Arrivals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/products')}>
          <View style={[styles.quickLinkIcon, { backgroundColor: colors.warningLight }]}>
            <Ionicons name="pricetag" size={24} color={colors.warning} />
          </View>
          <Text style={[styles.quickLinkText, { color: colors.text }]}>On Sale</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/wishlist')}>
          <View style={[styles.quickLinkIcon, { backgroundColor: colors.errorLight }]}>
            <Ionicons name="heart" size={24} color={colors.error} />
          </View>
          <Text style={[styles.quickLinkText, { color: colors.text }]}>Wishlist</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/profile')}>
          <View style={[styles.quickLinkIcon, { backgroundColor: colors.successLight }]}>
            <Ionicons name="person" size={24} color={colors.success} />
          </View>
          <Text style={[styles.quickLinkText, { color: colors.text }]}>Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroBanner: {
    margin: Layout.spacing.md,
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.lg,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  heroBrand: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: Layout.spacing.xs,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Layout.spacing.md,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  heroIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesList: {
    paddingRight: Layout.spacing.md,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Layout.spacing.lg,
    marginHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
  },
  quickLink: {
    alignItems: 'center',
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  quickLinkText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: Layout.spacing.xl,
  },
});
